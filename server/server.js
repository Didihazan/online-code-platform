const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const CodeBlock = require('./models/CodeBlock');

const app = express();
app.use(cors());
app.use(express.json());

// התחברות למסד הנתונים
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('התחברות למסד הנתונים הצליחה'))
    .catch(err => console.error('שגיאה בהתחברות למסד הנתונים:', err));

// יצירת שרת HTTP
const server = http.createServer(app);

// הגדרת Socket.IO
const io = socketIo(server, {
    cors: {
        origin: 'https://online-code-platform-client.onrender.com',
        methods: ['GET', 'POST']
    }
});

// ניהול חדרים ומשתמשים
const rooms = {}; // מידע על כל החדרים
const users = {}; // מידע על כל המשתמשים המחוברים

// אזנה לחיבורים חדשים
io.on('connection', (socket) => {
    console.log('משתמש חדש התחבר:', socket.id);

    // הצטרפות לחדר
    socket.on('join-room', async ({ blockId }) => {
        try {
            // מציאת בלוק הקוד במסד הנתונים
            const codeBlock = await CodeBlock.findById(blockId);
            if (!codeBlock) {
                socket.emit('error', 'בלוק הקוד לא נמצא');
                return;
            }

            // בדיקה אם זהו המנטור או סטודנט
            let role = 'student';
            if (!rooms[blockId] || !rooms[blockId].mentor) {
                role = 'mentor';
                // יצירת החדר אם הוא לא קיים
                rooms[blockId] = {
                    mentor: socket.id,
                    code: codeBlock.code,
                    students: []
                };
            } else {
                // הוספת הסטודנט לחדר
                rooms[blockId].students.push(socket.id);
            }

            // שמירת המידע על המשתמש
            users[socket.id] = {
                blockId,
                role
            };

            // הצטרפות לחדר
            socket.join(blockId);

            // שליחת מידע למשתמש
            socket.emit('room-joined', {
                role,
                code: rooms[blockId].code,
                studentsCount: rooms[blockId].students.length,
                solution: codeBlock.solution
            });

            // עדכון כל המשתתפים בחדר על מספר הסטודנטים
            io.to(blockId).emit('students-count', rooms[blockId].students.length);

        } catch (error) {
            console.error('שגיאה בהצטרפות לחדר:', error);
            socket.emit('error', 'שגיאה בהצטרפות לחדר');
        }
    });

    // עדכון קוד
    socket.on('code-update', ({ code }) => {
        const user = users[socket.id];
        if (!user || user.role !== 'student') return;

        const { blockId } = user;
        if (!rooms[blockId]) return;

        // עדכון הקוד בחדר
        rooms[blockId].code = code;

        // שליחת העדכון לכל המשתתפים בחדר (כולל המנטור)
        socket.to(blockId).emit('code-updated', { code });
    });

    // ניתוק
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (!user) return;

        const { blockId, role } = user;
        if (!rooms[blockId]) return;

        if (role === 'mentor') {
            // המנטור עזב - הודעה לכל הסטודנטים לחזור ללובי
            io.to(blockId).emit('mentor-left');
            delete rooms[blockId];
        } else {
            // סטודנט עזב - הסרה מרשימת הסטודנטים
            rooms[blockId].students = rooms[blockId].students.filter(id => id !== socket.id);
            // עדכון כל המשתתפים על מספר הסטודנטים החדש
            io.to(blockId).emit('students-count', rooms[blockId].students.length);
        }

        delete users[socket.id];
    });
});

// REST API נקודות קצה
app.get('/api/code-blocks', async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find({}, { title: 1 }); // שליפת הכותרות בלבד
        res.json(codeBlocks);
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת בלוקי הקוד' });
    }
});

app.get('/api/code-blocks/:id', async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findById(req.params.id);
        if (!codeBlock) {
            return res.status(404).json({ message: 'בלוק הקוד לא נמצא' });
        }
        res.json({ title: codeBlock.title, code: codeBlock.code });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בשליפת בלוק הקוד' });
    }
});

// הוספת בלוקי קוד התחלתיים (רק אם אין בלוקים במסד הנתונים)
const seedDatabase = async () => {
    try {
        const count = await CodeBlock.countDocuments();
        if (count === 0) {
            const initialCodeBlocks = [
                {
                    title: 'Async Function',
                    code: `// Async function example
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`,
                    solution: `// Async function example
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`
                },
                {
                    title: 'Promise Chain',
                    code: `// Promise chain example
function fetchUserData(userId) {
  return fetch(\`https://api.example.com/users/\${userId}\`)
    .then(response => {
      // Complete the promise chain
    })
    .catch(error => {
      console.error('Error:', error);
    });
}`,
                    solution: `// Promise chain example
function fetchUserData(userId) {
  return fetch(\`https://api.example.com/users/\${userId}\`)
    .then(response => response.json())
    .then(data => {
      console.log('User data:', data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}`
                },
                {
                    title: 'Array Methods',
                    code: `// Array methods example
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers and multiply by 2
const result = // Your code here`,
                    solution: `// Array methods example
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers and multiply by 2
const result = numbers.filter(num => num % 2 === 0).map(num => num * 2);`
                },
                {
                    title: 'Event Loop',
                    code: `// Event loop example
console.log('Start');

setTimeout(() => {
  console.log('Timeout callback');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise resolved');
  });

console.log('End');

// What is the correct order of the output?`,
                    solution: `// Event loop example
console.log('Start');

setTimeout(() => {
  console.log('Timeout callback');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise resolved');
  });

console.log('End');

// Output order: Start, End, Promise resolved, Timeout callback`
                }
            ];

            await CodeBlock.insertMany(initialCodeBlocks);
            console.log('בלוקי קוד התחלתיים נוספו בהצלחה');
        }
    } catch (error) {
        console.error('שגיאה ביצירת בלוקי קוד התחלתיים:', error);
    }
};

// אתחול מסד הנתונים
seedDatabase();

// הפעלת השרת

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`השרת פועל בפורט ${PORT}`);
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});