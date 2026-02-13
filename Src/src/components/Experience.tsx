import { useEffect, useRef, useState, useCallback } from 'react';
import anime from 'animejs';

const employers = [
  { name: 'Varkey Education', role: 'Senior Power Platform & D365 CRM Developer', period: 'Current / Ongoing', location: '', color: '#ff6b35' },
  { name: 'Swiss Post', role: 'Power Platform', period: 'Nov 2022 – Dec 2024', location: 'Switzerland', color: '#00e676' },
  { name: 'Freelancer', role: 'Power Platform Developer', period: '', location: '', color: '#b794f6' },
  { name: 'FPT Software', role: 'Technical Consultant', period: 'Sep 2018 – Nov 2022', location: 'Ho Chi Minh', color: '#00e5ff' },
];

const projects = [
  // ── Swiss Post ──
  {
    title: 'Power Platform Governance & Development',
    employer: 'Swiss Post',
    status: 'Completed',
    statusColor: '#00e5ff',
    period: 'Completed',
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
    status: 'Completed',
    statusColor: '#00e5ff',
    period: 'Completed',
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
    status: 'Completed',
    statusColor: '#00e5ff',
    period: 'Completed',
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
    status: 'Completed',
    statusColor: '#00e5ff',
    period: 'Completed',
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

/* ── Collapsible employer group ── */
function EmployerGroup({
  emp,
  empProjects,
  isExpanded,
  onToggle,
  onProjectHover,
  onProjectClick,
}: {
  emp: typeof employers[0];
  empProjects: typeof projects;
  isExpanded: boolean;
  onToggle: () => void;
  onProjectHover?: (title: string | null) => void;
  onProjectClick?: (title: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevExpanded = useRef(isExpanded);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Skip animation on first render — just set initial state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!isExpanded) {
        el.style.display = 'none';
        el.style.height = '0';
        el.style.opacity = '0';
      }
      prevExpanded.current = isExpanded;
      return;
    }

    // Skip if state hasn't changed
    if (prevExpanded.current === isExpanded) return;
    prevExpanded.current = isExpanded;

    // Stop any running animations on this element
    anime.remove(el);
    anime.remove(el.querySelectorAll('.timeline-item'));

    if (isExpanded) {
      // Expand
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.height = '0';
      el.style.opacity = '0';

      // Force reflow so browser registers the 0 height
      void el.offsetHeight;
      const fullHeight = el.scrollHeight;

      anime({
        targets: el,
        height: [0, fullHeight],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutCubic',
        complete: () => {
          el.style.height = 'auto';
          el.style.overflow = '';
        },
      });

      // Stagger project cards sliding in
      anime({
        targets: el.querySelectorAll('.timeline-item'),
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: anime.stagger(60, { start: 80 }),
        duration: 500,
        easing: 'easeOutCubic',
      });
    } else {
      // Collapse
      el.style.overflow = 'hidden';
      const currentHeight = el.scrollHeight;
      el.style.height = currentHeight + 'px';

      anime({
        targets: el,
        height: [currentHeight, 0],
        opacity: [1, 0],
        duration: 450,
        easing: 'easeInCubic',
        complete: () => {
          el.style.display = 'none';
        },
      });
    }
  }, [isExpanded]);

  return (
    <div key={emp.name}>
      {/* Employer header — clickable toggle */}
      <div className="timeline-item" style={{ marginBottom: '0' }}>
        <div className="timeline-marker" style={{ borderColor: emp.color }}>
          <div className="timeline-marker-inner" style={{ background: emp.color, width: '14px', height: '14px' }}></div>
        </div>
        <div
          className="employer-toggle"
          onClick={onToggle}
          style={{
            padding: '12px 20px',
            background: `linear-gradient(135deg, ${emp.color}15, transparent)`,
            border: `1px solid ${emp.color}30`,
            borderRadius: '12px',
            flex: 1,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = `${emp.color}60`;
            (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = `${emp.color}30`;
            (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                className="employer-chevron"
                style={{
                  color: emp.color,
                  fontSize: '14px',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}
              >
                ▸
              </span>
              <div>
                <h3 style={{ color: emp.color, margin: 0, fontSize: '18px', fontWeight: 700 }}>{emp.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: '13px' }}>
                  {[emp.role, emp.location].filter(Boolean).join(' · ')}
                  <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '8px', fontSize: '12px' }}>
                    ({empProjects.length} project{empProjects.length !== 1 ? 's' : ''})
                  </span>
                </p>
              </div>
            </div>
            <span style={{ color: emp.color, fontSize: '13px', fontWeight: 600 }}>{emp.period}</span>
          </div>
        </div>
      </div>

      {/* Collapsible project list */}
      <div
        ref={contentRef}
        style={{
          display: isExpanded ? 'block' : 'none',
          height: isExpanded ? 'auto' : '0',
          overflow: 'hidden',
        }}
      >
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
    </div>
  );
}

const Experience = ({ onProjectHover, onProjectClick }: ExperienceProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const allExpanded = employers.every(e => expandedGroups[e.name]);
  const anyExpanded = employers.some(e => expandedGroups[e.name]);

  const toggleGroup = useCallback((name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const toggleAll = useCallback(() => {
    if (anyExpanded) {
      // Collapse all
      setExpandedGroups({});
    } else {
      // Expand all
      const all: Record<string, boolean> = {};
      employers.forEach(e => { all[e.name] = true; });
      setExpandedGroups(all);
    }
  }, [anyExpanded]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div>
            <span className="section-label experience-label">Experience</span>
            <h2 className="experience-heading" style={{ marginBottom: '16px' }}>
              Project <span className="gradient-text">Portfolio</span>
            </h2>
          </div>
          <button
            className="expand-all-btn"
            onClick={toggleAll}
            style={{
              marginTop: '28px',
              padding: '8px 20px',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: '8px',
              color: 'var(--accent-cyan)',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0, 229, 255, 0.15)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 229, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0, 229, 255, 0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0, 229, 255, 0.25)';
            }}
          >
            {anyExpanded ? '⊟ Collapse All' : '⊞ Expand All'}
          </button>
        </div>
        <div className="timeline">
          {employers.map((emp) => {
            const empProjects = projects.filter(p => p.employer === emp.name);
            return (
              <EmployerGroup
                key={emp.name}
                emp={emp}
                empProjects={empProjects}
                isExpanded={!!expandedGroups[emp.name]}
                onToggle={() => toggleGroup(emp.name)}
                onProjectHover={onProjectHover}
                onProjectClick={onProjectClick}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
