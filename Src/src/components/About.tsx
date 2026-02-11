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
                About <strong>8 years</strong> of experience in the Power Platform world
                — covering Development, Administration, Training, Support, CoE, and
                Operations.
              </p>
              <p>
                Core expertise in D365 CE (CRM), Power Apps, Power Automate, Power Pages,
                Power BI, Dataverse, and Copilot Studio. From Fresher to Senior in D365
                CRM at FPT Software, now at Swiss Post working on Power Platform
                governance, citizen development, and AI integration.
              </p>
              <p>
                Current Goal: Power Platform Scale, Governance, and Leadership — combined
                with Copilot Agents and enterprise AI capabilities.
              </p>
            </div>
            <div className="about-stats">
              <div className="about-stat">
                <span className="stat-number">8+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">19+</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">PL-400</span>
                <span className="stat-label">Developer</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">PL-200</span>
                <span className="stat-label">Consultant</span>
              </div>
            </div>
          </div>
          <div className="about-highlights">
            <div className="about-highlight-card">
              <div className="highlight-icon">⚡</div>
              <h3>Power Platform at Scale</h3>
              <p>Dev, Admin, Training, Support, CoE & Operations</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🔷</div>
              <h3>D365 CE (CRM)</h3>
              <p>Full lifecycle configuration and customization</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🤖</div>
              <h3>AI & Copilot Agents</h3>
              <p>Copilot Studio, OpenAI, and AI productivity</p>
            </div>
            <div className="about-highlight-card">
              <div className="highlight-icon">🛡️</div>
              <h3>Governance & ALM</h3>
              <p>Compliance, CI/CD, CoE, environment strategy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
