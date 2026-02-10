import { useEffect, useRef } from 'react';
import anime from 'animejs';

const skillCategories = [
  {
    title: 'Dynamics 365 CRM / CE',
    icon: '🔷',
    color: '#00e5ff',
    skills: [
      'Dynamics 365 Customer Engagement',
      'Customer Service App Customization',
      'Custom Entities, Forms, Views & Rules',
      'Security Roles & Field-level Security',
      'Full Lifecycle CRM Delivery',
    ],
  },
  {
    title: 'Power Platform',
    icon: '⚡',
    color: '#7c3aed',
    skills: [
      'Power Apps (Model-driven & Canvas)',
      'Power Automate (Complex Workflows)',
      'Dataverse (Data Modeling & Security)',
      'Power Pages (External Portals)',
      'Governance, ALM & Env Strategy',
    ],
  },
  {
    title: 'Development & Integration',
    icon: '⚙️',
    color: '#00e676',
    skills: [
      'C# (Plugins, Workflow Activities)',
      'JavaScript (CRM Form Scripting)',
      'REST APIs, JSON, HTTP Integrations',
      'Azure Functions & Logic Apps',
      'Service Bus Integration',
    ],
  },
  {
    title: 'AI & Agentic Solutions',
    icon: '🤖',
    color: '#ff6b35',
    skills: [
      'Copilot Studio Agent Architecture',
      'Bot Framework → Copilot Migration',
      'Multi-agent Patterns Design',
      'Knowledge Agents & Data Boundaries',
      'Microsoft Foundry & AI Integration',
    ],
  },
];

const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.skills-label',
              opacity: [0, 1],
              translateX: [-30, 0],
              duration: 600,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.skills-heading',
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              delay: 200,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.skill-card',
              opacity: [0, 1],
              translateY: [60, 0],
              scale: [0.9, 1],
              delay: anime.stagger(150, { start: 400 }),
              duration: 1000,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="skills" id="skills" ref={sectionRef}>
      <div className="container">
        <span className="section-label skills-label">Expertise</span>
        <h2 className="skills-heading">
          Core <span className="gradient-text">Skills &amp; Technologies</span>
        </h2>
        <div className="skills-grid">
          {skillCategories.map((cat, i) => (
            <div
              key={i}
              className="skill-card"
              style={{ '--card-color': cat.color } as React.CSSProperties}
            >
              <div className="skill-card-header">
                <span className="skill-icon">{cat.icon}</span>
                <h3>{cat.title}</h3>
              </div>
              <ul className="skill-list">
                {cat.skills.map((skill, j) => (
                  <li key={j}>
                    <span className="skill-dot" style={{ background: cat.color }}></span>
                    {skill}
                  </li>
                ))}
              </ul>
              <div className="skill-card-glow" style={{ background: cat.color }}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
