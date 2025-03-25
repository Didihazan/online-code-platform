import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CartContext } from '../../Context/CartContext';
import { Menu, X, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cart } = useContext(CartContext);
    const navRef = React.useRef();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    const navItems = [
        { to: "/contactUs", text: "בואו נדבר" },
        { to: "/personalCustomization", text: "הזמנה בהתאמה אישית" },
        { to: "/", text: "בית" },
    ];

    return (
        <nav ref={navRef} className="sticky top-0 z-50 bg-black/90 text-white transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* עגלת קניות */}
                    <div className="flex items-center">
                        <Link to="/orders" className="relative p-2 hover:text-amber-400 transition-colors duration-200">
                            <ShoppingCart className="w-6 h-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* תפריט דסקטופ */}
                    <div className="hidden md:flex items-center justify-center flex-1 space-x-4 space-x-reverse">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `px-3 py-2 text-lg hover:text-amber-400 transition-colors duration-200
                                    ${isActive ? 'border-b-2 border-amber-400' : ''}`
                                }
                            >
                                {item.text}
                            </NavLink>
                        ))}
                    </div>

                    {/* לוגו */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-4xl font-bold">
                            פומה
                        </Link>
                    </div>

                    {/* כפתור המבורגר למובייל */}
                    <div className="block md:hidden">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu();
                            }}
                            className="p-2 hover:text-amber-400 transition-colors duration-200"
                        >
                            {isMenuOpen ? <X className="w-10 h-10" /> : <Menu className="w-10 h-10" />}
                        </button>
                    </div>
                </div>

                {/* תפריט מובייל */}
                <div
                    className={`md:hidden fixed left-0 right-0 bg-black/95 ${
                        isMenuOpen
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-full pointer-events-none'
                    } transition-all duration-300 ease-in-out`}
                >
                    <div className="px-4 py-3 space-y-3 text-right"> {/* הוספתי text-right כאן */}
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block text-lg py-2 px-3 hover:text-amber-400 transition-colors duration-200
                                    ${isActive ? 'text-amber-400' : ''}`
                                }
                            >
                                {item.text}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;