# Online Code Platform

An online code platform allowing mentors to track students' progress in real-time.

## Introduction

This project was created for Tom, a JavaScript lecturer who moved to Thailand but wants to continue monitoring his students' progress remotely. The platform enables him to view code written by students in real-time, identify issues, and assist with remote learning.

## Key Features

- **Lobby Page** - Displays a list of available code blocks for practice
- **Role Assignment** - The first user who enters a room is the mentor, all others are students
- **View/Edit Mode** - Mentors see code in read-only mode, students can edit
- **Real-time Updates** - Code changes are displayed in real-time using Socket.io
- **Room Management** - When the mentor leaves, students are redirected back to the lobby and code is deleted
- **Live Information** - Shows the number of students currently in the room
- **Immediate Feedback** - When a student's code matches the solution, a smiley face is displayed

## Technologies

### Client-side
- React
- React Router
- Socket.io Client
- Monaco Editor
- Tailwind CSS
- Lucide React

### Server-side
- Node.js
- Express
- Socket.io
- Mongoose

### Database
- MongoDB
