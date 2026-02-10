import { useState, useEffect } from 'react';
import anime from 'animejs';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Certifications', href: '#certifications' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    anime({
      targets: '.nav-link',
      opacity: [0, 1],
      translateY: [-20, 0],
      delay: anime.stagger(100, { start: 300 }),
      easing: 'easeOutExpo',
      duration: 800,
    });

    anime({
      targets: '.nav-logo',
      opacity: [0, 1],
      translateX: [-30, 0],
      duration: 800,
      easing: 'easeOutExpo',
    });
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Meg</span>
        </a>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link"
              onClick={e => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}

        </div>

        <button
          className={`nav-toggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
