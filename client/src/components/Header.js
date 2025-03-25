import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import '../css/Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className='header-container'>
          <div className='header-content'>
            <nav className={`nav ${menuOpen ? 'open' : ''}`}>
              <ul className='nav-list'>
                <li className='nav-item'>
                  <Link className='nav-link' to="home" smooth={true} duration={50}  onClick={() => {
                    scrollToTop();
                    toggleMenu();
                  }}>Home</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link' to="about" smooth={true} duration={50} onClick={toggleMenu}>About Me</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link' to="skills" smooth={true} duration={50} onClick={toggleMenu}>My Skills</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link' to= "projects" smooth={true} duration={50} onClick={toggleMenu}>Projects</Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link' to="contact" smooth={true} duration={50} onClick={toggleMenu}>Contact Me</Link>
                </li>
              </ul>
            </nav>
            <div className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </header>
  );
}
