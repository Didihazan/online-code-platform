import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { Smile, Users, ArrowLeft, Loader, AlertTriangle, BookOpen, Edit3 } from 'lucide-react';

const CodeBlockPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const [role, setRole] = useState(null);
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [studentsCount, setStudentsCount] = useState(0);
    const [solution, setSolution] = useState(null);
    const [showSmiley, setShowSmiley] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // יצירת חיבור Socket.io
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // האזנה לאירועים
        newSocket.on('room-joined', ({ role: userRole, code: initialCode, studentsCount: count, solution: codeSolution }) => {
            setRole(userRole);
            setCode(initialCode);
            setStudentsCount(count);
            if (codeSolution) {
                setSolution(codeSolution);
            }
            setLoading(false);
        });

        newSocket.on('code-updated', ({ code: updatedCode }) => {
            setCode(updatedCode);
        });

        newSocket.on('students-count', (count) => {
            setStudentsCount(count);
        });

        newSocket.on('mentor-left', () => {
            alert('המנטור עזב את החדר. אתה מועבר בחזרה ללובי.');
            navigate('/lobby');
        });

        newSocket.on('error', (errorMsg) => {
            setError(errorMsg);
            setLoading(false);
        });

        // הצטרפות לחדר
        newSocket.emit('join-room', { blockId: id });

        // ניקוי בעת עזיבת הקומפוננטה
        return () => {
            newSocket.disconnect();
        };
    }, [id, navigate]);

    // פונקציה לטיפול בשינויי קוד
    const handleCodeChange = (value) => {
        setCode(value);
        if (socket && role === 'student') {
            socket.emit('code-update', { code: value });

            // בדיקה האם הקוד תואם לפתרון
            if (solution && value.replace(/\s+/g, '') === solution.replace(/\s+/g, '')) {
                setShowSmiley(true);
            } else {
                setShowSmiley(false);
            }
        }
    };

    // טעינת כותרת בלוק הקוד
    useEffect(() => {
        const fetchBlockTitle = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/code-blocks/${id}`);
                if (!response.ok) {
                    throw new Error('שגיאה בטעינת בלוק הקוד');
                }
                const data = await response.json();
                setTitle(data.title);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchBlockTitle();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader className="w-12 h-12 mx-auto text-primary-600 animate-spin" />
                    <p className="mt-4 text-xl text-gray-600">מתחבר לחדר הקוד...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8 bg-red-50 rounded-xl max-w-md">
                    <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">שגיאה</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        className="mt-6 btn btn-primary"
                        onClick={() => navigate('/lobby')}
                    >
                        חזור ללובי
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                className="p-2 rounded-full hover:bg-gray-100 mr-3"
                                onClick={() => navigate('/lobby')}
                                title="חזור ללובי"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        </div>
                        <div className="flex space-x-4">
                            <div className={`flex items-center px-3 py-1.5 rounded-full ${
                                role === 'mentor'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {role === 'mentor' ? (
                                    <BookOpen className="h-4 w-4 mr-1.5" />
                                ) : (
                                    <Edit3 className="h-4 w-4 mr-1.5" />
                                )}
                                <span className="text-sm font-medium">
                  {role === 'mentor' ? 'מנטור' : 'סטודנט'}
                </span>
                            </div>
                            <div className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full">
                                <Users className="h-4 w-4 mr-1.5" />
                                <span className="text-sm font-medium">
                  {studentsCount} סטודנטים
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {showSmiley && (
                <div className="mx-auto my-4 py-3 px-6 bg-green-50 border border-green-200 rounded-lg shadow-sm flex items-center">
                    <Smile className="h-8 w-8 text-green-500 mr-3" />
                    <span className="text-green-700 font-medium">מצוין! הקוד שלך תואם לפתרון!</span>
                </div>
            )}

            <div className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="bg-white rounded-xl shadow-code overflow-hidden border border-gray-200 h-[calc(100vh-12rem)]">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        value={code}
                        onChange={handleCodeChange}
                        theme="vs-dark"
                        options={{
                            readOnly: role === 'mentor',
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 16,
                            tabSize: 2,
                            automaticLayout: true,
                            wordWrap: 'on',
                            padding: { top: 16 },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CodeBlockPage;