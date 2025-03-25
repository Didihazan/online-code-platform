import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    const handleScroll = () => {
        const scrollHeight = window.pageYOffset;
        if (scrollHeight > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`fixed bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full
                       bg-gray-800/80 text-white shadow-lg transition-all duration-300 ease-in-out
                       hover:bg-gray-700 hover:shadow-xl
                       ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <ArrowUp className="h-8 w-8" />
        </button>
    );
};

export default ScrollToTop;