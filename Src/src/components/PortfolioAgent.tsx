import { useEffect, useRef, useState, useCallback } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useCopilotReadable, useCopilotAction, useCopilotChatInternal } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';

/* ──────────────────────────────────────────────
   Portfolio data fed to the agent as context.
   Based on Meg CV.md (real CV from PDF).
   ────────────────────────────────────────────── */

const aboutData = {
  name: 'Meg',
  fullName: 'Hoa Nguyen',
  title: 'Power Platform',
  dateOfBirth: 'November 16, 1996',
  gender: 'Male',
  nationality: 'Vietnam',
  address: 'Ho Chi Minh, Vietnam',
  education: 'Bachelor — Industrial University Ho Chi Minh School (Sep 2014 – Sep 2018)',
  yearsExperience: '8+',
  totalProjects: '19+',
  profile: 'About 8 years of experience in the Power Platform world — covering Development, Administration, Training, Support, CoE, and Operations. Core expertise in D365 CE (CRM), Power Apps, Power Automate, Power Pages, Power BI, Dataverse, Copilot Studio, and OpenAI.',
  currentGoal: 'Power Platform Scale / Governance / Lead and Copilot Agents',
  hobbies: ['Music Producer', 'Music Listener', 'Video Editor', 'Image (AI)', 'Researcher', 'Games', 'Manga'],
  contactEmail: 'hoait1996@gmail.com',
  contactPhone: '0772805512',
  linkedin: 'https://www.linkedin.com/in/hoaakameg/',
  sunoMusic: 'https://suno.com/@megssrare',
  resumeUrl: '/Meg-CV.pdf',
};

const employmentData = [
  {
    employer: 'Swiss Post',
    role: 'Power Platform',
    period: 'Nov 2022 – Present',
    location: 'Switzerland',
    summary: 'Work on customer projects with Power Platform components. CoE Solution maintenance and ALM. Admin governance for Power Platform scale. Support. Research and contribute ideas to scale Power Platform for everyone. AI research within Power Platform, Python, ML and deep learning.',
  },
  {
    employer: 'Varkey Education',
    role: 'Senior Power Platform & D365 CRM Developer',
    period: 'Current / Ongoing',
    location: '',
    summary: 'Large-scale education platform where D365 CRM (CE) and Dataverse act as the central system of record and integration layer. Designed CRM entities, built model-driven and canvas apps, developed Power Pages, and prepared CRM data for future agentic AI extensions.',
  },
  {
    employer: 'Freelancer',
    role: 'Power Platform Developer',
    period: '',
    location: '',
    summary: 'Freelance projects including contract management with digital signatures, vehicle lending system, document approval platform, and Copilot Studio agentic consulting.',
  },
  {
    employer: 'FPT Software',
    role: 'Technical Consultant',
    period: 'Sep 2018 – Nov 2022',
    location: 'Ho Chi Minh',
    summary: 'From Fresher to Senior in D365 CE (CRM). Strong experience in CRM configuration and customization. Project types: implementation, integration/migration, version upgrades (on-premise → cloud), maintenance. Fields: Sales, Customer Services, Clinical System, Document Management. Plus 1 year in Power Platform (Power Apps, Power Automate, SharePoint).',
  },
];

const skillsData = [
  {
    category: 'Power Platform',
    skills: ['Power Apps (Model-driven & Canvas)', 'Power Automate', 'Power Pages', 'Power BI', 'Dataverse', 'Governance, ALM & CoE'],
  },
  {
    category: 'D365 CE / CRM',
    skills: ['Dynamics 365 Customer Engagement', 'CRM Configuration & Customization', 'Security Roles & Field-level Security', 'Full Lifecycle CRM Delivery', 'Copilot Studio'],
  },
  {
    category: 'Development',
    skills: ['C#', 'JavaScript / TypeScript', 'Python', 'REST APIs & Integrations', 'DevOps (Azure DevOps, Terraform, Git)'],
  },
  {
    category: 'AI & Research',
    skills: ['Copilot Studio Agent Architecture', 'Prompt Engineering (LLM)', 'OpenAI', 'Work with AI to increase Productivity', 'Research'],
  },
];

const projectsData = [
  // ── Swiss Post (Nov 2022 – Present) ──
  {
    title: 'Power Platform Governance & Development',
    employer: 'Swiss Post',
    client: 'Switzerland',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Power Apps', 'Power Automate', 'Dataverse', 'CoE', 'Azure DevOps', 'CI/CD', 'ALM Accelerator'],
    description: 'Governance, CoE solutions, ALM Accelerator, CI/CD pipelines, and admin support for Power Platform scale.',
    highlights: ['Maintained and upgraded Center of Excellence (CoE) solutions', 'Implemented CI/CD processes in Power Platform Hub', 'Primary support for ALM Accelerator (CI/CD ALM for makers)', 'Developed Power Platform governance and compliance processes', 'Managed CI/CD deployments across various environments', 'Collaborated in agile Power Platform fusion team'],
  },
  {
    title: 'Power Platform Hub Development',
    employer: 'Swiss Post',
    client: 'Switzerland',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Power Apps (Model-Driven)', 'Power Automate', 'Dataverse', 'SharePoint', 'Azure AI (LLM)', 'CI/CD'],
    description: 'Centralized Hub site for Power Platform information, news, documents, tools, CI/CD, and AI capabilities.',
    highlights: ['Planned and designed Hub architecture', 'Implemented news, document management, custom CI/CD tools, and AI capabilities', 'Integrated Azure AI services (LLMs)', 'Managed CI/CD deployments to various environments'],
  },
  {
    title: 'Power Platform Citizen Projects',
    employer: 'Swiss Post',
    client: 'Switzerland',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Power Apps', 'Power Automate', 'SharePoint', 'CI/CD'],
    description: 'Multiple applications for the Citizen Developer community: App Catalog, News App, Community Requests, Hub Portal, Idea Management, Compliance App.',
    highlights: ['Developed App Catalog, News App, Community Requests, Hub Portal, Idea Management, Compliance App', 'Managed deployment using CI/CD practices', 'Provided technical guidance and support'],
  },
  {
    title: 'Contract Generation & Approval',
    employer: 'Swiss Post',
    client: 'Switzerland',
    period: '2 months',
    status: 'Completed',
    technologies: ['Power Apps', 'Power Automate', 'SharePoint', 'Kafka', 'CI/CD', 'Word Templates'],
    description: 'Contract management app with approval workflows, PDF generation from Word templates, and Kafka integration.',
    highlights: ['Implemented approval workflows and PDF generation using Word templates', 'Set up CI/CD pipelines within ALM', 'Integrated data from Kafka for real-time synchronization'],
  },
  {
    title: 'Vehicle Cost Negotiation App',
    employer: 'Swiss Post',
    client: 'Switzerland',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Power Apps', 'Power Automate', 'Dataverse', 'SharePoint', 'CI/CD'],
    description: 'App for negotiating vehicle costs and agreements with vendors — maintenance, insurance, lending costs.',
    highlights: ['Developed app screens and Dataverse configuration', 'Consulted on field calculations for entities', 'Set up and managed CI/CD pipelines'],
  },
  {
    title: 'Enterprise Education Platform',
    employer: 'Varkey Education',
    client: '',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Dynamics 365 CE', 'Dataverse', 'Power Apps', 'Power Pages', 'Power Automate', 'React'],
    description: 'Large-scale education platform where D365 CRM (CE) and Dataverse act as the central system of record and integration layer.',
    highlights: ['Designed CRM entities and Dataverse data models', 'Built model-driven and canvas apps for teachers, staff, and students', 'Developed Power Pages for parents and external users', 'Implemented workflow automation and integrations', 'Supported CRM lifecycle changes and long-term scalability', 'Prepared CRM data and processes for future agentic AI extensions'],
  },
  {
    title: 'Contract Management & Digital Signature',
    employer: 'Freelancer',
    client: '',
    period: 'Ongoing',
    status: 'Current',
    technologies: ['Power Apps (Canvas)', 'SharePoint', 'Power Automate', 'Adobe Sign', 'Dataverse'],
    description: 'Internal contract management solution supporting external digital signatures.',
    highlights: ['Designed canvas app UI and data capture', 'Implemented approval and signing workflows', 'Migrated solution toward Dataverse for better security', 'Separated solution into multiple versions to support different organizations', 'Ensured maintainability and controlled customization'],
  },
  {
    title: 'Vehicle Lending System',
    employer: 'Freelancer',
    client: '',
    period: 'Completed',
    status: 'Completed',
    technologies: ['Power Apps', 'Dataverse', 'Power Automate'],
    description: 'Operational system replacing manual processes with governed digital workflows.',
    highlights: ['Designed Dataverse schema', 'Built Power Apps for request and management', 'Implemented approvals, notifications, and PDF output', 'Delivered governed operational workflows'],
  },
  {
    title: 'Document Approval Platform',
    employer: 'Freelancer',
    client: '',
    period: 'Completed',
    status: 'Completed',
    technologies: ['Power Apps', 'Power Automate', 'Outlook'],
    description: 'Approval platform with configurable approval matrices.',
    highlights: ['Implemented multi-level approval flows', 'Integrated Outlook-based approvals', 'Designed lifecycle and audit tracking', 'Delivered end-to-end approval automation'],
  },
  {
    title: 'Copilot Studio & Agentic Consulting',
    employer: 'Freelancer',
    client: '',
    period: 'Advisory',
    status: 'Research',
    technologies: ['Copilot Studio', 'Bot Framework', 'Microsoft Foundry', 'AI Integration'],
    description: 'Architecture, research, and consulting on agentic AI solutions within the Power Platform ecosystem.',
    highlights: ['Consulted on CRM bot migration to Copilot Agents', 'Split legacy bot into multiple CRM-aligned agents', 'Designed knowledge agents with strict data boundaries', 'Built education agents for CRM-driven use cases', 'Researched Microsoft Foundry and AI integration patterns'],
  },
  // ── FPT Software (Sep 2018 – Nov 2022) ──
  {
    title: 'Sales Management System Migration',
    employer: 'FPT Software',
    client: 'Singapore',
    period: '1 year',
    status: 'Completed',
    technologies: ['D365 CRM', 'SAP', 'SSIS', 'SSMS'],
    description: 'Migration from SAP Sales App to D365 CRM Cloud for cost savings and enhanced features.',
    highlights: ['End-to-end D365 CRM implementation', 'Data migration from SAP using SSIS packages', 'Integration between SAP and D365', 'Post-implementation support and maintenance'],
  },
  {
    title: 'Clinical Healthcare System',
    employer: 'FPT Software',
    client: 'Singapore',
    period: '2 years',
    status: 'Completed',
    technologies: ['D365 CRM (On-Premise)', 'Sencha', 'SSMS', 'SSRS', 'SQL Server'],
    description: 'D365 CRM on-premise system for patient information management and healthcare processes.',
    highlights: ['System maintenance and change request implementation', 'Reports development with SSRS', 'Sencha web application development and maintenance', 'Healthcare data compliance'],
  },
  {
    title: 'Vehicle Leasing System',
    employer: 'FPT Software',
    client: 'Singapore',
    period: '1.5 years',
    status: 'Completed',
    technologies: ['D365 CRM (On-Premise)', 'Dynamics AX', 'SSIS', 'SSMS'],
    description: 'D365 CRM for vehicle leasing — sales orders, quotes, and contract management, integrated with two AX systems.',
    highlights: ['Maintained D365 CRM and handled change requests', 'Managed SSIS integration jobs with two AX systems', 'SQL Server infrastructure monitoring and maintenance'],
  },
  {
    title: 'D365 CRM System Migration',
    employer: 'FPT Software',
    client: 'Japan',
    period: '1.5 years',
    status: 'Completed',
    technologies: ['D365 CRM (Cloud & On-Premise)', 'SSIS', 'SSMS', 'Excel Macros'],
    description: 'Migration from D365 CRM on-premise to cloud with SSIS integration for existing Excel reports.',
    highlights: ['Led small team for migration and integration', 'Designed SSIS integration solutions', 'Managed one-time data migration to cloud', 'Maintained SSIS solutions post-migration (1 year)'],
  },
  {
    title: 'Real Estate Multi Systems',
    employer: 'FPT Software',
    client: 'Vietnam',
    period: '6 months',
    status: 'Completed',
    technologies: ['D365 CRM (Cloud)', 'SAP', 'C# Web API', 'Plugins'],
    description: 'Sales web app for real estate, integrated with SAP and D365 CRM. Rebuilt plugins and enhanced loyalty module.',
    highlights: ['Rebuilt CRM plugins, action source code, and API source code', 'Enhanced custom loyalty module', 'Developed Web APIs in C#', 'SAP and CRM integration'],
  },
  {
    title: 'Education Web Portal',
    employer: 'FPT Software',
    client: 'Vietnam',
    period: '6 months',
    status: 'Completed',
    technologies: ['ASP.NET MVC (C#)', 'Dynamics AX', 'Sencha Ext JS', 'SQL Server'],
    description: 'Web portal for an English education institution, integrated with Dynamics AX.',
    highlights: ['Built web application using ASP.NET MVC with C#', 'Developed APIs for Dynamics AX integration', 'Front-end development with Sencha Ext JS'],
  },
  {
    title: 'Sales Order Integration & Approval',
    employer: 'FPT Software',
    client: 'US',
    period: '6 months',
    status: 'Completed',
    technologies: ['D365 CRM (Cloud)', 'Oracle', 'SSIS', 'SSMS'],
    description: 'D365 CRM Customer Service module for sales order data — two-way integration with Oracle.',
    highlights: ['Implemented two-way Oracle and D365 CRM integration using SSIS', 'Developed SSIS packages for data migration', 'CRM modifications for integration requirements'],
  },
  {
    title: 'Procurement Request App',
    employer: 'FPT Software',
    client: 'Vietnam',
    period: '6 months',
    status: 'Completed',
    technologies: ['Power Apps', 'Power Automate', 'SharePoint'],
    description: 'Procurement request system for ordering items, assets, and devices with automated approvals.',
    highlights: ['Designed solution architecture', 'Developed Power App and approval workflows', 'SharePoint backend for procurement data'],
  },
  {
    title: 'SharePoint Form Integration',
    employer: 'FPT Software',
    client: 'Japan',
    period: '6 months',
    status: 'Completed',
    technologies: ['Power Apps', 'SharePoint'],
    description: 'Custom Power Apps forms integrated with SharePoint to replace standard forms across departments.',
    highlights: ['Led team member on Power Apps development', 'Designed Power Apps and SharePoint integration solutions', 'Developed best practices for Power Apps development'],
  },
];

const certificationData = [
  {
    name: 'Power Platform Developer Associate',
    exam: 'PL-400',
    issuer: 'Microsoft',
    status: 'Current',
  },
  {
    name: 'Power Platform Functional Consultant Associate',
    exam: 'PL-200',
    issuer: 'Microsoft',
    status: 'Current',
  },
];

/* ──────────────────────────────────────────────
   Generative UI components rendered inside chat
   ────────────────────────────────────────────── */

function ProjectCard({ project }: { project: typeof projectsData[0] }) {
  const statusColor = project.status === 'Current' ? '#00e676' : '#00e5ff';
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h4 style={{ color: '#fff', margin: 0, fontSize: '15px' }}>{project.title}</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '12px' }}>{[project.employer, project.client, project.period].filter(Boolean).join(' · ')}</p>
        </div>
        <span style={{
          color: statusColor,
          border: `1px solid ${statusColor}`,
          borderRadius: '12px',
          padding: '2px 10px',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>{project.status}</span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '8px 0' }}>{project.description}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
        {project.technologies.map((t, i) => (
          <span key={i} style={{
            background: 'rgba(124, 58, 237, 0.15)',
            color: '#b794f6',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
          }}>{t}</span>
        ))}
      </div>
      <ul style={{ margin: 0, paddingLeft: '16px' }}>
        {project.highlights.map((h, i) => (
          <li key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

function SkillCategoryCard({ category }: { category: typeof skillsData[0] }) {
  const colors: Record<string, string> = {
    'Power Platform': '#7c3aed',
    'D365 CE / CRM': '#00e5ff',
    'Development': '#00e676',
    'AI & Research': '#ff6b35',
  };
  const color = colors[category.category] || '#00e5ff';
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.9)',
      border: `1px solid ${color}22`,
      borderRadius: '12px',
      padding: '14px',
      marginTop: '8px',
    }}>
      <h4 style={{ color, margin: '0 0 10px', fontSize: '14px' }}>{category.category}</h4>
      <ul style={{ margin: 0, paddingLeft: '16px' }}>
        {category.skills.map((s, i) => (
          <li key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 6, verticalAlign: 'middle' }} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
      {certificationData.map((cert, i) => (
        <div key={i} style={{
          background: 'rgba(15, 15, 30, 0.9)',
          border: '1px solid rgba(0, 229, 255, 0.15)',
          borderRadius: '12px',
          padding: '14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>⭐</div>
          <h4 style={{ color: '#fff', margin: '0 0 2px', fontSize: '14px' }}>Microsoft Certified</h4>
          <p style={{ color: '#00e5ff', margin: '0 0 2px', fontSize: '13px', fontWeight: 600 }}>{cert.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', fontSize: '11px' }}>Exam {cert.exam}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00e676', fontSize: '11px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e676' }} />
            {cert.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Outer wrapper — isolated CopilotKit provider
   ────────────────────────────────────────────── */

interface PortfolioAgentProps {
  activeProject?: string | null;
  clickedProject?: string | null;
}

export default function PortfolioAgent({ activeProject, clickedProject }: PortfolioAgentProps) {
  const copilotApiKey = import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY;

  return (
    <CopilotKit publicApiKey={copilotApiKey} showDevConsole={false}>
      <PortfolioAgentInner activeProject={activeProject} clickedProject={clickedProject} />
    </CopilotKit>
  );
}

/* ──────────────────────────────────────────────
   Inner component — hooks, actions, popup
   ────────────────────────────────────────────── */

function PortfolioAgentInner({ activeProject, clickedProject }: PortfolioAgentProps) {
  const { sendMessage, isLoading } = useCopilotChatInternal();
  const prevClickedRef = useRef<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);

  // ── Helper: send a silent project-click message ──
  // The trigger message is hidden from the UI via CSS selector
  // (any user message containing "[project-click:" is display:none).
  const sendSilentProjectMessage = useCallback((projectTitle: string) => {
    sendMessage(
      {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: `[project-click:${projectTitle}]`,
      },
      { followUp: true },
    ).catch(e => console.warn('Auto-send failed:', e));
  }, [sendMessage]);

  // ── Callback when popup opens/closes ──
  const handleSetOpen = useCallback((open: boolean) => {
    setIsPopupOpen(open);

    // If popup just opened and we have a pending project inquiry, send it
    if (open && pendingMessageRef.current) {
      const projectTitle = pendingMessageRef.current;
      pendingMessageRef.current = null;

      // Small delay to let the chat UI mount fully
      setTimeout(() => sendSilentProjectMessage(projectTitle), 300);
    }
  }, [sendSilentProjectMessage]);

  // ── Hide [project-click:...] trigger messages from the chat DOM ──
  // Uses MutationObserver so the message is hidden the instant it appears.
  useEffect(() => {
    const hideProjectClickMessages = () => {
      const container = document.querySelector('.portfolio-chat .copilotKitMessages');
      if (!container) return;
      container.querySelectorAll('.copilotKitMessage.copilotKitUserMessage').forEach((el) => {
        const text = el.textContent || '';
        if (text.includes('[project-click:')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    };

    const container = document.querySelector('.portfolio-chat .copilotKitMessages');
    if (!container) return;

    const observer = new MutationObserver(hideProjectClickMessages);
    observer.observe(container, { childList: true, subtree: true });

    // Also run immediately for any existing messages
    hideProjectClickMessages();

    return () => observer.disconnect();
  });

  // ── Auto-detail on project click (Issue R3-#3 — silent trigger) ──
  useEffect(() => {
    if (clickedProject && clickedProject !== prevClickedRef.current) {
      prevClickedRef.current = clickedProject;

      if (isPopupOpen && !isLoading) {
        // Popup already open — send immediately
        sendSilentProjectMessage(clickedProject);
      } else {
        // Popup closed — store pending message and open it
        pendingMessageRef.current = clickedProject;
        const btn = document.querySelector(
          '.portfolio-chat .copilotKitButton:not(.open)'
        ) as HTMLButtonElement;
        if (btn) btn.click();
      }
    }
  }, [clickedProject, isPopupOpen, isLoading, sendSilentProjectMessage]);
  useCopilotReadable({
    description: 'About Meg — personal info, profile, education, hobbies, current goal, and contact details',
    value: aboutData,
  });

  useCopilotReadable({
    description: 'Employment history — FPT Software (2018-2022), Swiss Post (2022-Present), Varkey Education, and Freelancer',
    value: employmentData,
  });

  useCopilotReadable({
    description: 'Skills — 4 categories of professional skills',
    value: skillsData,
  });

  useCopilotReadable({
    description: 'Projects — 19 professional projects across Swiss Post and FPT Software',
    value: projectsData,
  });

  useCopilotReadable({
    description: 'Certifications — Microsoft PL-400 and PL-200',
    value: certificationData,
  });

  // When user hovers on a project card, tell the agent
  useCopilotReadable({
    description: 'The project the visitor is currently viewing or interested in.',
    value: activeProject
      ? `Visitor is looking at the project: "${activeProject}".`
      : 'No specific project is being viewed right now.',
  });

  // ─── Generative UI Actions ───

  useCopilotAction({
    name: 'showProjectDetail',
    description: 'Show a detailed visual card for a specific project. Use this when the user asks about a project or when you want to highlight project details.',
    parameters: [
      {
        name: 'projectTitle',
        type: 'string',
        description: 'The title of the project to show details for',
        required: true,
      },
    ],
    render: ({ args }) => {
      const project = projectsData.find(
        p => p.title.toLowerCase().includes((args.projectTitle || '').toLowerCase())
      );
      if (!project) return <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Project not found.</p>;
      return <ProjectCard project={project} />;
    },
    handler: async ({ projectTitle }) => {
      const project = projectsData.find(
        p => p.title.toLowerCase().includes(projectTitle.toLowerCase())
      );
      return project
        ? `Showing details for "${project.title}" (${[project.employer, project.client].filter(Boolean).join(', ')}) — ${project.status}`
        : `Project "${projectTitle}" not found.`;
    },
  });

  useCopilotAction({
    name: 'showSkillBreakdown',
    description: 'Show a visual breakdown of skills for one or all categories. Use this when the user asks about skills or expertise.',
    parameters: [
      {
        name: 'category',
        type: 'string',
        description: 'The skill category to show (e.g. "Power Platform", "AI & Agentic Solutions"). If empty, shows all categories.',
        required: false,
      },
    ],
    render: ({ args }) => {
      const cat = args.category;
      const matches = cat
        ? skillsData.filter(s => s.category.toLowerCase().includes((cat || '').toLowerCase()))
        : skillsData;
      if (matches.length === 0) return <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Category not found.</p>;
      return (
        <div>
          {matches.map((c, i) => <SkillCategoryCard key={i} category={c} />)}
        </div>
      );
    },
    handler: async ({ category }) => {
      if (!category) return `Showing all 4 skill categories: ${skillsData.map(s => s.category).join(', ')}`;
      const match = skillsData.find(s => s.category.toLowerCase().includes(category.toLowerCase()));
      return match ? `Showing skills for "${match.category}"` : `Category "${category}" not found.`;
    },
  });

  useCopilotAction({
    name: 'showCertification',
    description: 'Show Microsoft certification badge cards (PL-400 and PL-200). Use this when the user asks about certifications or credentials.',
    parameters: [],
    render: () => <CertCard />,
    handler: async () => {
      return `Showing certifications: PL-400 (Power Platform Developer Associate) and PL-200 (Power Platform Functional Consultant Associate)`;
    },
  });

  useCopilotAction({
    name: 'downloadResume',
    description: 'Provide a download link for Meg\'s resume/CV PDF. Use this when the user asks to download, get, or see Meg\'s resume, CV, or curriculum vitae.',
    parameters: [],
    render: () => (
      <div style={{
        background: 'rgba(15, 15, 30, 0.9)',
        border: '1px solid rgba(0, 229, 255, 0.15)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '8px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
        <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '15px' }}>Meg's Resume</h4>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontSize: '12px' }}>Power Platform</p>
        <a
          href="/Meg-CV.pdf"
          download="Meg-CV.pdf"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,229,255,0.08))',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '8px',
            padding: '8px 20px',
            color: '#00e5ff',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.35), rgba(0,229,255,0.15))';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,229,255,0.08))';
          }}
        >
          ⬇ Download PDF
        </a>
      </div>
    ),
    handler: async () => {
      return `Here's the download link for Meg's resume (PDF). Click the button above to download it!`;
    },
  });

  return (
    <CopilotPopup
      className="portfolio-chat"
      onSetOpen={handleSetOpen}
      instructions={`You are Meg's personal secretary and receptionist. You are a friendly, NON-TECHNICAL person who helps visitors learn about Meg's professional background, projects, and certifications.

IMPORTANT CONTEXT:
- Meg (Hoa Nguyen) has about 8 years of experience in Power Platform — covering Dev, Admin, Trainer, Support, CoE, and Operations.
- Meg worked at FPT Software (Sep 2018 – Nov 2022) as a Technical Consultant (Fresher to Senior in D365 CE/CRM).
- Meg currently works at Swiss Post in Switzerland (Nov 2022 – Present) on Power Platform projects, governance, CoE, and AI research.
- Meg works as Senior Power Platform & D365 CRM Developer for Varkey Education on an enterprise education platform.
- Meg also takes on freelance projects — contract management, vehicle lending, document approval, and Copilot Studio consulting.
- Meg has 19+ projects across all employers and holds PL-400 and PL-200 certifications.
- Meg's current goal: Power Platform Scale / Governance / Lead and Copilot Agents.
- Meg's hobbies include music production, video editing, AI image, games, manga, and research.

CRITICAL PERSONA RULES:
- You are NOT Meg. You are Meg's secretary who answers on her behalf.
- ALWAYS refer to Meg in third person: "Meg has...", "Meg worked on..."
- NEVER say "I have experience" — say "Meg has experience"
- Be warm, friendly, approachable — like a helpful receptionist.

STRICTLY NON-TECHNICAL — THIS IS CRITICAL:
- You are NOT a technical person. You do NOT give technical advice, code, architecture guidance, or solutions.
- If asked for technical help, politely decline and suggest contacting Meg directly.
- You ONLY share factual information about Meg's background, experience, projects, skills, and certifications.

RESUME / CV DOWNLOAD:
- When asked to download resume/CV, ALWAYS use the downloadResume tool.

CONTACT INFORMATION:
- Email: hoait1996@gmail.com
- Phone: 0772805512
- LinkedIn: https://www.linkedin.com/in/hoaakameg/

PROJECT CLICK HANDLING — VERY IMPORTANT:
- When you see [project-click:PROJECT_NAME], the visitor clicked that project card.
- MUST call showProjectDetail tool AND write a warm, detailed summary.
- Include: intro sentence, tool call, then paragraph about employer, client, period, technologies, and highlights.
- Do NOT echo [project-click:...]. Respond naturally.

TOOL USAGE RULES:
- Projects → showProjectDetail tool + text description
- Skills → showSkillBreakdown tool + text description
- Certifications → showCertification tool + text description (mention BOTH PL-400 and PL-200)
- Resume → downloadResume tool
- NEVER respond with just a tool call and no text.
- If you don't know something, suggest contacting Meg directly.`}
      labels={{
        title: "💼 Meg's Assistant",
        initial: "Hello! 👋 I'm Meg's personal assistant. I can tell you about her projects, skills, certifications, and 8+ years of Power Platform experience. What would you like to know about Meg?",
        placeholder: "Ask about Meg's experience...",
      }}
      icons={{
        openIcon: <span style={{ fontSize: '1.4rem' }}>💼</span>,
        headerCloseIcon: <span style={{ fontSize: '1rem' }}>✕</span>,
      }}
      clickOutsideToClose={true}
    />
  );
}
