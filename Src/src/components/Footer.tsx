import { useEffect, useRef } from 'react';
import anime from 'animejs';

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.footer-content > *',
              opacity: [0, 1],
              translateY: [30, 0],
              delay: anime.stagger(150),
              duration: 800,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <h2 className="footer-title">
              <span className="logo-icon">⬡</span> Meg
            </h2>
            <p className="footer-subtitle">
              Power Platform
            </p>
            <p className="footer-focus">
              Dynamics 365 CRM / CE and Power Platform as core expertise,
              expanding into enterprise AI and agentic capabilities.
            </p>
          </div>
          <div className="footer-approach">
            <h3>Work Approach</h3>
            <ul>
              <li>Business-first problem understanding</li>
              <li>Clear data ownership and lifecycle</li>
              <li>Long-term Dataverse model evolution</li>
              <li>Governance over fragile customization</li>
              <li>AI-ready solution design</li>
            </ul>
          </div>
          <div className="footer-connect">
            <h3>Let's Connect</h3>
            <p>Seeking long-term CRM and platform-focused engagements.</p>
            <div className="footer-contact-links">
              <a href="mailto:hoait1996@gmail.com" className="contact-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
                <span>hoait1996@gmail.com</span>
              </a>
              <a href="tel:+840772805512" className="contact-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                <span>Zalo: +84 0772805512</span>
              </a>
              <a href="https://www.linkedin.com/in/hoaakameg/" target="_blank" rel="noopener noreferrer" className="contact-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://suno.com/@megssrare" target="_blank" rel="noopener noreferrer" className="contact-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17V5l12-2v12"/></svg>
                <span>Suno Music</span>
              </a>
            </div>
            <a href="#hero" className="footer-cta"
              onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Back to Top ↑
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <p>&copy; 2026 Meg. Crafted with passion for Power Platform.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
