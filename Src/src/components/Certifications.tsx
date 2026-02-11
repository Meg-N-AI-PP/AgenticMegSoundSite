import { useEffect, useRef } from 'react';
import anime from 'animejs';

const Certifications = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.cert-label',
              opacity: [0, 1],
              translateX: [-30, 0],
              duration: 600,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.cert-heading',
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              delay: 200,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.cert-card',
              opacity: [0, 1],
              scale: [0.8, 1],
              duration: 1200,
              delay: 400,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.cert-glow',
              opacity: [0, 0.5],
              scale: [0.8, 1.1],
              duration: 2000,
              delay: 1000,
              direction: 'alternate',
              loop: true,
              easing: 'easeInOutSine',
            });
          }
        });
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="certifications" id="certifications" ref={sectionRef}>
      <div className="container">
        <span className="section-label cert-label">Certifications</span>
        <h2 className="cert-heading">
          Professional <span className="gradient-text">Credentials</span>
        </h2>
        <div className="cert-container">
          <div className="cert-card">
            <div className="cert-glow"></div>
            <div className="cert-badge">
              <svg viewBox="0 0 120 120" className="cert-badge-svg">
                <defs>
                  <linearGradient id="certGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <polygon
                  points="60,8 72,40 108,40 80,58 90,90 60,72 30,90 40,58 12,40 48,40"
                  fill="none"
                  stroke="url(#certGrad1)"
                  strokeWidth="2"
                />
                <circle cx="60" cy="60" r="22" fill="none" stroke="url(#certGrad1)" strokeWidth="1.5" opacity="0.6" />
              </svg>
              <span className="cert-badge-text">PL-400</span>
            </div>
            <h3 className="cert-title">Microsoft Certified</h3>
            <h4 className="cert-name">Power Platform Developer Associate</h4>
            <p className="cert-exam">Exam PL-400</p>
            <div className="cert-status">
              <span className="cert-status-dot"></span>
              Current
            </div>
            <div className="cert-logo">
              <img src="/images/Microsoft_Power_Platform_logo.svg" alt="Microsoft Power Platform" />
            </div>
          </div>
          <div className="cert-card">
            <div className="cert-glow"></div>
            <div className="cert-badge">
              <svg viewBox="0 0 120 120" className="cert-badge-svg">
                <defs>
                  <linearGradient id="certGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#00e5ff" />
                  </linearGradient>
                </defs>
                <polygon
                  points="60,8 72,40 108,40 80,58 90,90 60,72 30,90 40,58 12,40 48,40"
                  fill="none"
                  stroke="url(#certGrad2)"
                  strokeWidth="2"
                />
                <circle cx="60" cy="60" r="22" fill="none" stroke="url(#certGrad2)" strokeWidth="1.5" opacity="0.6" />
              </svg>
              <span className="cert-badge-text">PL-200</span>
            </div>
            <h3 className="cert-title">Microsoft Certified</h3>
            <h4 className="cert-name">Power Platform Functional Consultant Associate</h4>
            <p className="cert-exam">Exam PL-200</p>
            <div className="cert-status">
              <span className="cert-status-dot"></span>
              Current
            </div>
            <div className="cert-logo">
              <img src="/images/Microsoft_Power_Platform_logo.svg" alt="Microsoft Power Platform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
