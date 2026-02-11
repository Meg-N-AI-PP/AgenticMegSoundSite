import { useEffect, useRef } from 'react';
import anime from 'animejs';

const employers = [
  { name: 'Swiss Post', role: 'Power Platform', period: 'Nov 2022 – Present', location: 'Switzerland', color: '#00e676' },
  { name: 'Varkey Education', role: 'Senior Power Platform & D365 CRM Developer', period: 'Current / Ongoing', location: '', color: '#ff6b35' },
  { name: 'Freelancer', role: 'Power Platform Developer', period: '', location: '', color: '#b794f6' },
  { name: 'FPT Software', role: 'Technical Consultant', period: 'Sep 2018 – Nov 2022', location: 'Ho Chi Minh', color: '#00e5ff' },
];

const projects = [
  // ── Swiss Post ──
  {
    title: 'Power Platform Governance & Development',
    employer: 'Swiss Post',
    status: 'Current',
    statusColor: '#00e676',
    period: 'Ongoing',
    client: 'Switzerland',
    technologies: ['Power Apps', 'Power Automate', 'Dataverse', 'CoE', 'Azure DevOps', 'CI/CD'],
    description: 'Governance, CoE solutions, ALM Accelerator, CI/CD pipelines, and admin support for Power Platform scale.',
    highlights: [
      'Maintained and upgraded Center of Excellence (CoE) solutions',
      'Primary support for ALM Accelerator (CI/CD ALM for makers)',
      'Developed Power Platform governance and compliance processes',
      'Managed CI/CD deployments across various environments',
    ],
  },
  {
    title: 'Power Platform Hub Development',
    employer: 'Swiss Post',
    status: 'Current',
    statusColor: '#00e676',
    period: 'Ongoing',
    client: 'Switzerland',
    technologies: ['Power Apps (Model-Driven)', 'Dataverse', 'Azure AI (LLM)', 'CI/CD'],
    description: 'Centralized Hub site for Power Platform information, news, documents, tools, CI/CD, and AI capabilities.',
    highlights: [
      'Planned and designed Hub architecture',
      'Implemented news, document management, custom CI/CD tools, and AI capabilities',
      'Integrated Azure AI services (LLMs)',
    ],
  },
  {
    title: 'Power Platform Citizen Projects',
    employer: 'Swiss Post',
    status: 'Current',
    statusColor: '#00e676',
    period: 'Ongoing',
    client: 'Switzerland',
    technologies: ['Power Apps', 'Power Automate', 'SharePoint', 'CI/CD'],
    description: 'Multiple apps for the Citizen Developer community: App Catalog, News App, Community Requests, Hub Portal, Idea Management, Compliance App.',
    highlights: [
      'Developed App Catalog, News App, Community Requests, and more',
      'Managed deployment using CI/CD practices',
      'Provided technical guidance and support',
    ],
  },
  {
    title: 'Contract Generation & Approval',
    employer: 'Swiss Post',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '2 months',
    client: 'Switzerland',
    technologies: ['Power Apps', 'Power Automate', 'Kafka', 'Word Templates', 'CI/CD'],
    description: 'Contract management app with approval workflows, PDF generation from Word templates, and Kafka integration.',
    highlights: [
      'Implemented approval workflows and PDF generation',
      'Set up CI/CD pipelines within ALM',
      'Integrated data from Kafka for real-time sync',
    ],
  },
  {
    title: 'Vehicle Cost Negotiation App',
    employer: 'Swiss Post',
    status: 'Current',
    statusColor: '#00e676',
    period: 'Ongoing',
    client: 'Switzerland',
    technologies: ['Power Apps', 'Power Automate', 'Dataverse', 'CI/CD'],
    description: 'App for negotiating vehicle costs and agreements with vendors — maintenance, insurance, lending costs.',
    highlights: [
      'Developed app screens and Dataverse configuration',
      'Consulted on field calculations for entities',
      'Set up and managed CI/CD pipelines',
    ],
  },
  {
    title: 'Enterprise Education Platform',
    employer: 'Varkey Education',
    status: 'Current',
    statusColor: '#ff6b35',
    period: 'Ongoing',
    client: '',
    technologies: ['Dynamics 365 CE', 'Dataverse', 'Power Apps', 'Power Pages', 'Power Automate', 'React'],
    description: 'Large-scale education platform where D365 CRM (CE) and Dataverse act as the central system of record and integration layer.',
    highlights: [
      'Designed CRM entities and Dataverse data models',
      'Built model-driven and canvas apps for teachers, staff, and students',
      'Developed Power Pages for parents and external users',
      'Supported CRM lifecycle changes and long-term scalability',
    ],
  },
  {
    title: 'Contract Management & Digital Signature',
    employer: 'Freelancer',
    status: 'Current',
    statusColor: '#b794f6',
    period: 'Ongoing',
    client: '',
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
    employer: 'Freelancer',
    status: 'Completed',
    statusColor: '#b794f6',
    period: 'Completed',
    client: '',
    technologies: ['Power Apps', 'Dataverse', 'Power Automate'],
    description: 'Operational system replacing manual processes with governed digital workflows.',
    highlights: [
      'Designed Dataverse schema',
      'Built Power Apps for request and management',
      'Implemented approvals, notifications, and PDF output',
    ],
  },
  {
    title: 'Document Approval Platform',
    employer: 'Freelancer',
    status: 'Completed',
    statusColor: '#b794f6',
    period: 'Completed',
    client: '',
    technologies: ['Power Apps', 'Power Automate', 'Outlook'],
    description: 'Approval platform with configurable approval matrices.',
    highlights: [
      'Implemented multi-level approval flows',
      'Integrated Outlook-based approvals',
      'Designed lifecycle and audit tracking',
    ],
  },
  {
    title: 'Copilot Studio & Agentic Consulting',
    employer: 'Freelancer',
    status: 'Research',
    statusColor: '#b794f6',
    period: 'Advisory',
    client: '',
    technologies: ['Copilot Studio', 'Bot Framework', 'Microsoft Foundry', 'AI Integration'],
    description: 'Architecture, research, and consulting on agentic AI solutions within the Power Platform ecosystem.',
    highlights: [
      'Consulted on CRM bot migration to Copilot Agents',
      'Split legacy bot into multiple CRM-aligned agents',
      'Designed knowledge agents with strict data boundaries',
      'Built education agents for CRM-driven use cases',
    ],
  },
  // ── FPT Software ──
  {
    title: 'Sales Management System Migration',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '1 year',
    client: 'Singapore',
    technologies: ['D365 CRM', 'SAP', 'SSIS', 'SSMS'],
    description: 'Migration from SAP Sales App to D365 CRM Cloud for cost savings and enhanced features.',
    highlights: [
      'End-to-end D365 CRM implementation',
      'Data migration from SAP using SSIS packages',
      'Integration between SAP and D365',
    ],
  },
  {
    title: 'Clinical Healthcare System',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '2 years',
    client: 'Singapore',
    technologies: ['D365 CRM (On-Premise)', 'Sencha', 'SSRS', 'SQL Server'],
    description: 'D365 CRM on-premise system for patient information management and healthcare processes.',
    highlights: [
      'System maintenance and change request implementation',
      'Reports development with SSRS',
      'Healthcare data compliance',
    ],
  },
  {
    title: 'Vehicle Leasing System',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '1.5 years',
    client: 'Singapore',
    technologies: ['D365 CRM (On-Premise)', 'Dynamics AX', 'SSIS'],
    description: 'D365 CRM for vehicle leasing — sales orders, quotes, and contract management, integrated with two AX systems.',
    highlights: [
      'Maintained D365 CRM and handled change requests',
      'Managed SSIS integration with two AX systems',
      'SQL Server infrastructure monitoring',
    ],
  },
  {
    title: 'D365 CRM System Migration',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '1.5 years',
    client: 'Japan',
    technologies: ['D365 CRM (Cloud & On-Premise)', 'SSIS', 'Excel Macros'],
    description: 'Migration from D365 CRM on-premise to cloud with SSIS integration for Excel reports. Led small team.',
    highlights: [
      'Led small team for migration and integration',
      'Designed SSIS integration solutions',
      'Managed one-time data migration to cloud',
    ],
  },
  {
    title: 'Real Estate Multi Systems',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '6 months',
    client: 'Vietnam',
    technologies: ['D365 CRM (Cloud)', 'SAP', 'C# Web API', 'Plugins'],
    description: 'Sales web app for real estate, integrated with SAP and D365 CRM. Rebuilt plugins and enhanced loyalty module.',
    highlights: [
      'Rebuilt CRM plugins and API source code',
      'Enhanced custom loyalty module',
      'Developed Web APIs in C#',
    ],
  },
  {
    title: 'Education Web Portal',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '6 months',
    client: 'Vietnam',
    technologies: ['ASP.NET MVC (C#)', 'Dynamics AX', 'Sencha Ext JS'],
    description: 'Web portal for an English education institution, integrated with Dynamics AX.',
    highlights: [
      'Built web application with ASP.NET MVC',
      'Developed APIs for Dynamics AX integration',
      'Front-end with Sencha Ext JS',
    ],
  },
  {
    title: 'Sales Order Integration & Approval',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '6 months',
    client: 'US',
    technologies: ['D365 CRM (Cloud)', 'Oracle', 'SSIS'],
    description: 'D365 CRM Customer Service module — two-way integration with Oracle for sales order processing.',
    highlights: [
      'Two-way Oracle and D365 CRM integration using SSIS',
      'SSIS packages for data migration',
      'CRM modifications for integration',
    ],
  },
  {
    title: 'Procurement Request App',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '6 months',
    client: 'Vietnam',
    technologies: ['Power Apps', 'Power Automate', 'SharePoint'],
    description: 'Procurement request system for ordering items, assets, and devices with automated approvals.',
    highlights: [
      'Designed solution architecture',
      'Developed Power App and approval workflows',
      'SharePoint backend for procurement data',
    ],
  },
  {
    title: 'SharePoint Form Integration',
    employer: 'FPT Software',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: '6 months',
    client: 'Japan',
    technologies: ['Power Apps', 'SharePoint'],
    description: 'Custom Power Apps forms integrated with SharePoint to replace standard forms across departments.',
    highlights: [
      'Led team member on Power Apps development',
      'Designed integration solutions',
      'Developed best practices for Power Apps',
    ],
  },
];

interface ExperienceProps {
  onProjectHover?: (projectTitle: string | null) => void;
  onProjectClick?: (projectTitle: string) => void;
}

const Experience = ({ onProjectHover, onProjectClick }: ExperienceProps) => {
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
          {employers.map((emp) => {
            const empProjects = projects.filter(p => p.employer === emp.name);
            return (
              <div key={emp.name}>
                <div className="timeline-item" style={{ marginBottom: '0' }}>
                  <div className="timeline-marker" style={{ borderColor: emp.color }}>
                    <div className="timeline-marker-inner" style={{ background: emp.color, width: '14px', height: '14px' }}></div>
                  </div>
                  <div style={{
                    padding: '12px 20px',
                    background: `linear-gradient(135deg, ${emp.color}15, transparent)`,
                    border: `1px solid ${emp.color}30`,
                    borderRadius: '12px',
                    flex: 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ color: emp.color, margin: 0, fontSize: '18px', fontWeight: 700 }}>{emp.name}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: '13px' }}>{[emp.role, emp.location].filter(Boolean).join(' · ')}</p>
                      </div>
                      <span style={{ color: emp.color, fontSize: '13px', fontWeight: 600 }}>{emp.period}</span>
                    </div>
                  </div>
                </div>
                {empProjects.map((project, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-marker" style={{ borderColor: project.statusColor }}>
                      <div className="timeline-marker-inner" style={{ background: project.statusColor }}></div>
                    </div>
                    <div
                      className="timeline-card"
                      onMouseEnter={() => onProjectHover?.(project.title)}
                      onMouseLeave={() => onProjectHover?.(null)}
                      onClick={() => onProjectClick?.(project.title)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="timeline-card-header">
                        <div>
                          <h3>{project.title}</h3>
                          <p className="timeline-role">{[project.client, project.period].filter(Boolean).join(' · ')}</p>
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
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
