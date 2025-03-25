import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, Loader, AlertTriangle } from 'lucide-react';

const LobbyPage = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // פונקציה לטעינת רשימת בלוקי הקוד מהשרת
        const fetchCodeBlocks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/code-blocks');
                if (!response.ok) {
                    throw new Error('שגיאה בטעינת בלוקי הקוד');
                }
                const data = await response.json();
                setCodeBlocks(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCodeBlocks();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader className="w-12 h-12 mx-auto text-primary-600 animate-spin" />
                    <p className="mt-4 text-xl text-gray-600">טוען בלוקי קוד...</p>
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose code block</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto" dir="rtl">
                        בחר בלוק קוד כדי להתחיל את המסע בלימוד JavaScript. המנטור הראשון שייכנס יוכל לצפות בקוד, וכל הסטודנטים יוכלו לערוך אותו.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {codeBlocks.map((block) => (
                        <Link
                            to={`/code-block/${block._id}`}
                            key={block._id}
                            className="card group hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                        <Code className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary-100 text-secondary-800">
                    JavaScript
                  </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{block.title}</h2>
                                <p className="text-gray-600">לחץ כדי להתחיל לעבוד על בלוק הקוד הזה</p>
                            </div>
                            <div className="h-2 bg-primary-500 group-hover:bg-primary-600 transition-colors"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LobbyPage;