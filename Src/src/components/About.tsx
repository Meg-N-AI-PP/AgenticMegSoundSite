import { useEffect, useRef } from 'react';
import anime from 'animejs';

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.about-label',
              opacity: [0, 1],
              translateX: [-30, 0],
              duration: 600,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.about-heading',
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              delay: 200,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.about-text p',
              opacity: [0, 1],
              translateY: [30, 0],
              delay: anime.stagger(150, { start: 400 }),
              duration: 800,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.about-stat',
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.8, 1],
              delay: anime.stagger(100, { start: 600 }),
              duration: 800,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.about-highlight-card',
              opacity: [0, 1],
              translateX: [50, 0],
              delay: anime.stagger(120, { start: 500 }),
              duration: 800,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <span className="section-label about-label">About Me</span>
            <h2 className="about-heading">
              Building Enterprise Solutions<br />
              with <span className="gradient-text">Power Platform</span>
            </h2>
            <div className="about-text">
              <p>
                Power Platform Developer with
                <strong> 8+ years</strong> of experience delivering enterprise business
                applications across Dynamics 365 Customer Engagement, Power Apps, Power
                Automate, and Dataverse.
              </p>
              <p>
                Extensive experience working on multiple Dynamics 365 CRM projects from
                full lifecycle phases — including requirement analysis, system design,
                configuration, customization, integration, deployment, and ongoing support.
              </p>
              <p>
                Strong focus on building governed, secure, and scalable systems of record
                with long-term maintainability. Actively expanding into AI and agentic
                solution design within the Power Platform ecosystem.
              </p>
            </div>
            <div className="about-stats">
              <div className="about-stat">
                <span className="stat-number">8+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">10+</span>
                <span className="stat-label">Major Projects</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">PL-400</span>
                <span className="stat-label">Certified</span>
              </div>
            </div>
          </div>
          <div className="about-highlights">
            <div className="about-highlight-card">
              <div className="highlight-icon">🎯</div>
              <h3>Business-First Approach</h3>
              <p>Understanding business problems before solutioning</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🏗️</div>
              <h3>Scalable Architecture</h3>
              <p>Designing Dataverse models for long-term evolution</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🤖</div>
              <h3>AI-Ready Solutions</h3>
              <p>Planning CRM solutions to be AI and agent-ready</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🛡️</div>
              <h3>Governance First</h3>
              <p>Configuration and governance over fragile customization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
