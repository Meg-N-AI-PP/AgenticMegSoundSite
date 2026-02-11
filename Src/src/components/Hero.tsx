import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';

const Hero = () => {
  useEffect(() => {
    const tl = anime.timeline({
      easing: 'easeOutExpo',
    });

    tl.add({
      targets: '.hero-badge',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    })
    .add({
      targets: '.hero-title .char',
      opacity: [0, 1],
      translateY: [80, 0],
      rotateX: [90, 0],
      duration: 1200,
      delay: anime.stagger(60),
    }, '-=400')
    .add({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=600')
    .add({
      targets: '.hero-description',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=400')
    .add({
      targets: '.hero-cta-group',
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=400')
    .add({
      targets: '.hero-social-link',
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.5, 1],
      delay: anime.stagger(80),
      duration: 600,
    }, '-=300')
    .add({
      targets: '.hero-image-container',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 1200,
    }, '-=1000')
    .add({
      targets: '.hero-sound-cta',
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.9, 1],
      duration: 800,
    }, '-=400')
    .add({
      targets: '.hero-scroll-indicator',
      opacity: [0, 0.7],
      translateY: [20, 0],
      duration: 600,
    }, '-=200');

    // Floating animation on the VISUAL wrapper (not image-container, to avoid overwriting scale)
    anime({
      targets: '.hero-visual',
      translateY: [-10, 10],
      duration: 3500,
      direction: 'alternate',
      easing: 'easeInOutSine',
      loop: true,
    });

    // Floating tech icons — delayed to let CSS pop-in complete first
    setTimeout(() => {
      anime({
        targets: '.floating-icon-1',
        translateY: [-8, 8],
        translateX: [-4, 4],
        duration: 2800,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });

      anime({
        targets: '.floating-icon-2',
        translateY: [6, -10],
        translateX: [3, -3],
        duration: 3200,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });

      anime({
        targets: '.floating-icon-3',
        translateY: [-10, 6],
        translateX: [-5, 5],
        duration: 2600,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });

      anime({
        targets: '.floating-icon-4',
        translateY: [7, -9],
        translateX: [4, -4],
        duration: 3000,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });

      anime({
        targets: '.floating-icon-5',
        translateY: [-6, 10],
        translateX: [-3, 5],
        duration: 3400,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });

      anime({
        targets: '.floating-icon-6',
        translateY: [9, -7],
        translateX: [5, -3],
        duration: 2900,
        direction: 'alternate',
        easing: 'easeInOutSine',
        loop: true,
      });
    }, 2500); // Wait for CSS pop-in to finish

    // Glow pulse
    anime({
      targets: '.hero-glow',
      opacity: [0.2, 0.5],
      scale: [0.95, 1.15],
      duration: 2500,
      direction: 'alternate',
      easing: 'easeInOutSine',
      loop: true,
    });
  }, []);

  const titleText = "Meg";
  const titleChars = titleText.split('').map((char, i) => (
    <span key={i} className="char">{char}</span>
  ));

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Available for Engagements
          </div>
          <h1 className="hero-title">
            {titleChars}
          </h1>
          <p className="hero-subtitle">
            Power Platform
          </p>
          <p className="hero-description">
            About 8 years in the Power Platform world — Dev, Admin,
            Trainer, Support, CoE & Operations. D365 CE, Power Apps,
            Power Automate, Copilot Studio & OpenAI.
          </p>
          <div className="hero-cta-group">
            <a href="#experience" className="hero-cta primary"
              onClick={e => { e.preventDefault(); document.querySelector('#experience')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span>View My Work</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </a>
            <a href="#skills" className="hero-cta secondary"
              onClick={e => { e.preventDefault(); document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <span>Explore Skills</span>
            </a>
            <a href="/Meg-CV.pdf" download="Meg-CV.pdf" className="hero-cta secondary" title="Download Meg's Resume">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Resume</span>
            </a>
          </div>
          <div className="hero-social-links">
            <a href="mailto:hoait1996@gmail.com" className="hero-social-link" title="Email">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
            </a>
            <a href="tel:+840772805512" className="hero-social-link" title="Zalo: +84 0772805512">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/hoaakameg/" target="_blank" rel="noopener noreferrer" className="hero-social-link" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://suno.com/@megssrare" target="_blank" rel="noopener noreferrer" className="hero-social-link" title="Suno Music">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M8 17V5l12-2v12"/></svg>
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="hero-image-container">
              <div className="hero-glow"></div>
              <div className="hero-image-ring"></div>
              <img
                src="/images/meg-robo-1-image.jpg"
                alt="Meg - Power Platform Developer"
                className="hero-image"
              />
            </div>
            <div className="hero-tech-icons">
              <img src="/images/Power_App.png" alt="Power Apps" className="tech-icon floating-icon-1" title="Power Apps" />
              <img src="/images/Power_Automate.jpg" alt="Power Automate" className="tech-icon floating-icon-2" title="Power Automate" />
              <img src="/images/Power_Page.svg" alt="Power Pages" className="tech-icon floating-icon-3" title="Power Pages" />
              <img src="/images/Microsoft_Power_Platform_logo.svg" alt="Power Platform" className="tech-icon floating-icon-4" title="Power Platform" />
              <img src="/images/Microsoft_Copilot_Icon.svg.png" alt="Copilot" className="tech-icon floating-icon-5" title="Copilot" />
              <img src="/images/Azure.jpg" alt="Azure" className="tech-icon floating-icon-6" title="Azure" />
            </div>
          </div>
          <Link to="/music" className="hero-sound-cta">
            <div className="hero-sound-eq">
              <span /><span /><span /><span />
            </div>
            <span className="hero-sound-text">Want to hear some sound?</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <div className="scroll-line"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
