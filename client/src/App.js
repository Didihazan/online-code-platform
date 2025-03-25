import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LobbyPage from './pages/LobbyPage';
import CodeBlockPage from './pages/CodeBlockPage';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="app">
                <Routes>
                    <Route path="/" element={<Navigate to="/lobby" />} />
                    <Route path="/lobby" element={<LobbyPage />} />
                    <Route path="/code-block/:id" element={<CodeBlockPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;