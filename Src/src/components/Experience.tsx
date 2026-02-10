import { useEffect, useRef } from 'react';
import anime from 'animejs';

const projects = [
  {
    title: 'Enterprise Education Platform',
    status: 'Current',
    statusColor: '#00e676',
    role: 'Senior Power Platform & Dynamics 365 CRM Developer',
    technologies: ['Dynamics 365 CE', 'Dataverse', 'Power Apps', 'Power Pages', 'Power Automate', 'React'],
    description: 'Large-scale education platform where Dynamics 365 CRM (CE) and Dataverse act as the central system of record and integration layer.',
    highlights: [
      'Designed CRM entities and Dataverse data models',
      'Built model-driven and canvas apps for teachers, staff, and students',
      'Developed Power Pages for parents and external users',
      'Implemented workflow automation and integrations',
      'Prepared CRM data for future agentic AI extensions',
    ],
  },
  {
    title: 'Contract Management & Digital Signature',
    status: 'Current',
    statusColor: '#00e676',
    role: 'Power Platform Developer',
    technologies: ['Power Apps (Canvas)', 'SharePoint', 'Power Automate', 'Adobe Sign', 'Dataverse'],
    description: 'Internal contract management solution supporting external digital signatures.',
    highlights: [
      'Designed canvas app UI and data capture',
      'Implemented approval and signing workflows',
      'Migrated solution toward Dataverse for better security',
      'Separated solution into multiple versions for different orgs',
    ],
  },
  {
    title: 'Vehicle Lending System',
    status: 'Completed',
    statusColor: '#00e5ff',
    role: 'Power Platform Developer',
    technologies: ['Power Apps', 'Dataverse', 'Power Automate'],
    description: 'Operational system replacing manual processes with governed digital workflows.',
    highlights: [
      'Designed Dataverse schema',
      'Built Power Apps for request and management',
      'Implemented approvals, notifications, and PDF output',
      'Delivered governed operational workflows',
    ],
  },
  {
    title: 'Document Approval Platform',
    status: 'Completed',
    statusColor: '#00e5ff',
    role: 'Power Platform Developer',
    technologies: ['Power Apps', 'Power Automate', 'Outlook'],
    description: 'Approval platform with configurable approval matrices.',
    highlights: [
      'Implemented multi-level approval flows',
      'Integrated Outlook-based approvals',
      'Designed lifecycle and audit tracking',
      'Delivered end-to-end approval automation',
    ],
  },
  {
    title: 'Copilot Studio & Agentic Consulting',
    status: 'Research',
    statusColor: '#7c3aed',
    role: 'Architecture, Research & Consulting',
    technologies: ['Copilot Studio', 'Bot Framework', 'Microsoft Foundry', 'AI Integration'],
    description: 'Architecture, research, and consulting on agentic AI solutions within the Power Platform ecosystem.',
    highlights: [
      'Consulted on CRM bot migration to Copilot Agents',
      'Split legacy bot into multiple CRM-aligned agents',
      'Designed knowledge agents with strict data boundaries',
      'Researched Microsoft Foundry and AI integration patterns',
    ],
  },
];

const Experience = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            anime({
              targets: '.experience-label',
              opacity: [0, 1],
              translateX: [-30, 0],
              duration: 600,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.experience-heading',
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              delay: 200,
              easing: 'easeOutExpo',
            });

            anime({
              targets: '.timeline-item',
              opacity: [0, 1],
              translateX: [-60, 0],
              delay: anime.stagger(200, { start: 400 }),
              duration: 1000,
              easing: 'easeOutExpo',
            });
          }
        });
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="experience" id="experience" ref={sectionRef}>
      <div className="container">
        <span className="section-label experience-label">Experience</span>
        <h2 className="experience-heading">
          Project <span className="gradient-text">Portfolio</span>
        </h2>
        <div className="timeline">
          {projects.map((project, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-marker" style={{ borderColor: project.statusColor }}>
                <div className="timeline-marker-inner" style={{ background: project.statusColor }}></div>
              </div>
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div>
                    <h3>{project.title}</h3>
                    <p className="timeline-role">{project.role}</p>
                  </div>
                  <span
                    className="timeline-status"
                    style={{ color: project.statusColor, borderColor: project.statusColor }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="timeline-description">{project.description}</p>
                <div className="timeline-tech">
                  {project.technologies.map((tech, j) => (
                    <span key={j} className="tech-tag">{tech}</span>
                  ))}
                </div>
                <ul className="timeline-highlights">
                  {project.highlights.map((h, j) => (
                    <li key={j}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
