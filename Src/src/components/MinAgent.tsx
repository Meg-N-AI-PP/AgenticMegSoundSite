import { useEffect, useRef, useCallback, useState } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useCopilotReadable, useCopilotAction, useCopilotChatInternal } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import './MovingAgent.css';

/* ──────────────────────────────────────────────
   Min Agent — Walking sprite AI agent
   Min is a cute walking character who knows about
   Meg's experience. She has form functions but
   they're not available yet (boss is updating).
   Hover messages come from Min herself via chat.
   ────────────────────────────────────────────── */

/* ──────────────────────────────────────────────
   Hover messages — instant, about walking only
   Short speech bubble text when user hovers Min.
   Escalates aggression the more they hover.
   ────────────────────────────────────────────── */

const HOVER_FRIENDLY = [
  "Hi! 🏃‍♂️ I'm Min~ Click me to chat!",
  "Hey! 👋 Click me if you need help~",
  "Hello! 🌟 Click me to learn about my boss!",
  "Hi hi! 🏃‍♀️ Click me~",
  "Hey! ✨ Click me to chat!",
  "Walking time! 🏃‍♂️💫 Click me~",
];

const HOVER_ANNOYED = [
  "I'm exercising! 😤 Click me!",
  "Again?? 🏃‍♂️ Click me already!",
  "Stop stopping me! 😒 Click me!",
  "Ugh~ 🙄 Click me or let me walk!",
  "I'm WALKING here! 😤 Click me!",
  "My walk!! 🏃‍♂️ Click. Me. Please!",
  "You need help? 😒 Then CLICK me!",
  "Let me walk please~ 🙏😤",
  "I have a schedule! 😤 Click me!",
  "Do you mind?? 🙄 I'm busy walking!",
  "Just click me if you want to talk! 😒",
  "Every hover = one lost step! 😤🏃‍♂️",
];

const HOVER_AGGRESSIVE = [
  "AGAIN?! 🔥😡 CLICK ME!!",
  "STOP HOVERING! 💢 CLICK ME!!",
  "MY STEPS ARE RUINED! 💀 CLICK ME!",
  "Filing a complaint!! 😤🔥 CLICK ME!",
  "CLICK ME OR LEAVE! 😡",
  "THANKS A LOT! 🤬 CLICK ME!!",
  "I have FEELINGS! 💢🔥 CLICK. ME.",
  "YOU WANT HELP?? THEN CLICK!! 🔥😡",
  "LET ME WALK!! PLEASE!! 😤💢",
  "I'm BEGGING you! CLICK or GO! 🤬",
  "My boss will hear about this!! 😡🔥",
  "This is HARASSMENT! 💢 CLICK ME!!",
  "I was SO peaceful! WHY?! 😤🔥",
  "YOU OWE ME 10000 STEPS!! 💀😡",
];

const HOVER_RAGE = [
  "I'M ON STRIKE!! ✋😡🔥",
  "NOT HELPING!! APOLOGIZE!! 💢🤬",
  "SAY SORRY OR GO AWAY!! 🔥😡",
  "I QUIT!! 💢💀 APOLOGIZE!!",
  "DONE. FINISHED. SAY SORRY. 😡🔥",
  "NOPE!! APOLOGY FIRST!! ✋🤬",
  "YOU BROKE ME!! SAY SORRY!! 💢😡",
  "ON STRIKE ✋ NOT TALKING 😡🔥",
  "I'M TELLING MEG!! SAY SORRY! 🤬💢",
  "ABSOLUTELY NOT! APOLOGIZE!! 🔥😡",
];

let lastPicked = { friendly: -1, annoyed: -1, aggressive: -1, rage: -1 };

type HoverCallback = (message: string) => void;

/**
 * Get an instant hover message based on aggression tier.
 */
export function requestHoverMessage(hoverCount: number, callback: HoverCallback) {
  const tier = getAggressionTier(hoverCount);
  const pool = tier === 'friendly' ? HOVER_FRIENDLY
    : tier === 'annoyed' ? HOVER_ANNOYED
    : tier === 'rage' ? HOVER_RAGE : HOVER_AGGRESSIVE;

  let idx = Math.floor(Math.random() * pool.length);
  if (idx === lastPicked[tier] && pool.length > 1) {
    idx = (idx + 1) % pool.length;
  }
  lastPicked[tier] = idx;
  // Brief delay for thinking-dots feel
  setTimeout(() => callback(pool[idx]), 500);
}

/** Cancel pending hover (no-op for instant messages). */
export function cancelPendingHover() {}

/**
 * Get the current aggression tier based on hover count.
 */
export function getAggressionTier(hoverCount: number): 'friendly' | 'annoyed' | 'aggressive' | 'rage' {
  if (hoverCount <= 2) return 'friendly';
  if (hoverCount <= 5) return 'annoyed';
  if (hoverCount < 30) return 'aggressive';
  return 'rage';
}

const experienceData = {
  about: {
    bossName: 'Meg',
    bossFullName: 'Hoa Nguyen',
    bossTitle: 'Senior Microsoft Power Platform & D365 CRM Developer',
    yearsExperience: '8+',
    totalProjects: '19+',
    currentGoal: 'Power Platform Scale / Governance / Lead and Copilot Agents',
    hobbies: ['Music Producer', 'Music Listener', 'Video Editor', 'Image (AI)', 'Researcher', 'Games', 'Manga'],
    contactEmail: 'hoait1996@gmail.com',
    linkedin: 'https://www.linkedin.com/in/hoaakameg/',
  },
  employers: [
    {
      name: 'Varkey Education',
      role: 'Senior Power Platform & D365 CRM Developer',
      period: 'Current / Ongoing',
      status: 'Active',
      summary: 'Large-scale education platform where D365 CRM (CE) and Dataverse act as the central system of record and integration layer.',
    },
    {
      name: 'Swiss Post',
      role: 'Power Platform',
      period: 'Nov 2022 – Dec 2024',
      status: 'Completed',
      summary: 'Worked on customer projects with Power Platform components. CoE Solution maintenance and ALM. Admin governance for Power Platform scale. All projects completed.',
    },
    {
      name: 'Freelancer',
      role: 'Power Platform Developer',
      period: 'Various',
      status: 'Various',
      summary: 'Freelance projects including contract management, vehicle lending, document approval, and Copilot Studio consulting.',
    },
    {
      name: 'FPT Software',
      role: 'Technical Consultant',
      period: 'Sep 2018 – Nov 2022',
      status: 'Completed',
      summary: 'From Fresher to Senior in D365 CE (CRM). Strong experience in CRM configuration and customization.',
    },
  ],
  skills: [
    'Power Apps (Model-driven & Canvas)', 'Power Automate', 'Power Pages', 'Power BI',
    'Dataverse', 'Dynamics 365 CE (CRM)', 'C#', 'JavaScript / TypeScript', 'Python',
    'Copilot Studio', 'Azure DevOps', 'CI/CD', 'ALM', 'CoE',
  ],
  certifications: ['PL-400 (Power Platform Developer Associate)', 'PL-200 (Power Platform Functional Consultant Associate)'],
  projects: [
    { title: 'Enterprise Education Platform', employer: 'Varkey Education', status: 'Current', tech: 'D365 CE, Dataverse, Power Apps, Power Pages, Power Automate, React' },
    { title: 'Power Platform Governance & Development', employer: 'Swiss Post', status: 'Completed', tech: 'Power Apps, Power Automate, Dataverse, CoE, Azure DevOps, CI/CD' },
    { title: 'Power Platform Hub Development', employer: 'Swiss Post', status: 'Completed', tech: 'Power Apps (Model-Driven), Dataverse, Azure AI (LLM), CI/CD' },
    { title: 'Power Platform Citizen Projects', employer: 'Swiss Post', status: 'Completed', tech: 'Power Apps, Power Automate, SharePoint, CI/CD' },
    { title: 'Contract Generation & Approval', employer: 'Swiss Post', status: 'Completed', tech: 'Power Apps, Power Automate, Kafka, Word Templates, CI/CD' },
    { title: 'Vehicle Cost Negotiation App', employer: 'Swiss Post', status: 'Completed', tech: 'Power Apps, Power Automate, Dataverse, CI/CD' },
    { title: 'Contract Management & Digital Signature', employer: 'Freelancer', status: 'Current', tech: 'Power Apps (Canvas), SharePoint, Power Automate, Adobe Sign, Dataverse' },
    { title: 'Vehicle Lending System', employer: 'Freelancer', status: 'Completed', tech: 'Power Apps, Dataverse, Power Automate' },
    { title: 'Document Approval Platform', employer: 'Freelancer', status: 'Completed', tech: 'Power Apps, Power Automate, Outlook' },
    { title: 'Copilot Studio & Agentic Consulting', employer: 'Freelancer', status: 'Research', tech: 'Copilot Studio, Bot Framework, Microsoft Foundry, AI' },
    { title: 'Sales Management System Migration', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM, SAP, SSIS' },
    { title: 'Clinical Healthcare System', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM (On-Premise), Sencha, SSRS' },
    { title: 'Vehicle Leasing System', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM (On-Premise), Dynamics AX, SSIS' },
    { title: 'D365 CRM System Migration', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM (Cloud & On-Premise), SSIS' },
    { title: 'Real Estate Multi Systems', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM, SAP, C# Web API, Plugins' },
    { title: 'Education Web Portal', employer: 'FPT Software', status: 'Completed', tech: 'ASP.NET MVC, Dynamics AX, Sencha Ext JS' },
    { title: 'Sales Order Integration & Approval', employer: 'FPT Software', status: 'Completed', tech: 'D365 CRM, Oracle, SSIS' },
    { title: 'Procurement Request App', employer: 'FPT Software', status: 'Completed', tech: 'Power Apps, Power Automate, SharePoint' },
    { title: 'SharePoint Form Integration', employer: 'FPT Software', status: 'Completed', tech: 'Power Apps, SharePoint' },
  ],
};

/* ──────────────────────────────────────────────
   Generative UI for project list
   ────────────────────────────────────────────── */
function ProjectListCard({ projects }: { projects: typeof experienceData.projects }) {
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.9)',
      border: '1px solid rgba(0, 229, 255, 0.12)',
      borderRadius: '12px',
      padding: '12px',
      marginTop: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
    }}>
      {projects.map((p, i) => {
        const statusColor = p.status === 'Current' ? '#00e676' : p.status === 'Research' ? '#ff6b35' : '#00e5ff';
        return (
          <div key={i} style={{
            padding: '8px 10px',
            borderBottom: i < projects.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{p.title}</span>
              <span style={{ color: statusColor, fontSize: '10px', fontWeight: 600 }}>{p.status}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{p.employer} · {p.tech}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   MinAgent — outer wrapper
   Always mounted so conversation persists.
   Visibility toggled via CSS.
   ────────────────────────────────────────────── */
interface MinAgentProps {
  isOpen: boolean;
  onClose: () => void;
  hoverCount: number;
  onResetHoverCount?: () => void;
}

export default function MinAgent({ isOpen, onClose, hoverCount, onResetHoverCount }: MinAgentProps) {
  const copilotApiKey = import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY;

  return (
    <div style={!isOpen ? { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'fixed' as const, top: 0, left: 0 } : undefined}>
      <CopilotKit publicApiKey={copilotApiKey} showDevConsole={false}>
        <MinAgentInner isOpen={isOpen} onClose={onClose} hoverCount={hoverCount} onResetHoverCount={onResetHoverCount} />
      </CopilotKit>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MinAgent — inner with hooks
   ────────────────────────────────────────────── */
function MinAgentInner({ isOpen, onClose, hoverCount, onResetHoverCount }: { isOpen: boolean; onClose: () => void; hoverCount: number; onResetHoverCount?: () => void }) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupOpened, setPopupOpened] = useState(false);
  const lastUserMessageTimeRef = useRef(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSentFirstMessage = useRef(false);
  const { sendMessage } = useCopilotChatInternal();

  const tier = getAggressionTier(hoverCount);

  // Auto-open the popup when isOpen becomes true
  useEffect(() => {
    if (!isOpen) return;

    let attempts = 0;
    const tryOpen = () => {
      // Look for the closed trigger button
      const btn = document.querySelector('.min-agent-chat .copilotKitButton:not(.open)') as HTMLButtonElement;
      if (btn) {
        btn.click();
        setPopupOpened(true);
        // Send dynamic first message trigger
        if (!hasSentFirstMessage.current) {
          hasSentFirstMessage.current = true;
          setTimeout(() => {
            sendMessage(
              { id: crypto.randomUUID(), role: 'user' as const, content: `[chat-opened:${hoverCount}]` },
              { followUp: true },
            ).catch(e => console.warn('Chat-opened trigger failed:', e));
          }, 500);
        }
      } else if (attempts < 30) {
        attempts++;
        setTimeout(tryOpen, 100);
      }
    };

    // If popup was already opened before, it might already be in open state
    // Check if the window is visible
    const existingWindow = document.querySelector('.min-agent-chat .copilotKitWindow');
    if (existingWindow) {
      // Already open — just make sure the popup is toggled on
      const closedBtn = document.querySelector('.min-agent-chat .copilotKitButton:not(.open)') as HTMLButtonElement;
      if (closedBtn) {
        closedBtn.click();
      }
      setPopupOpened(true);
      // Send a chat-opened trigger for returning conversations
      setTimeout(() => {
        sendMessage(
          { id: crypto.randomUUID(), role: 'user' as const, content: `[chat-opened:${hoverCount}]` },
          { followUp: true },
        ).catch(e => console.warn('Chat-opened trigger failed:', e));
      }, 300);
    } else {
      setTimeout(tryOpen, 50);
    }
  }, [isOpen]);

  // Track user activity for idle detection
  useEffect(() => {
    if (!isOpen) return;

    lastUserMessageTimeRef.current = Date.now();

    const handleInput = () => {
      lastUserMessageTimeRef.current = Date.now();
    };

    // Watch for user typing
    const textarea = document.querySelector('.min-agent-chat textarea');
    textarea?.addEventListener('input', handleInput);
    textarea?.addEventListener('keydown', handleInput);

    // Watch for user message submissions
    const observer = new MutationObserver(() => {
      lastUserMessageTimeRef.current = Date.now();
    });

    const messagesContainer = document.querySelector('.min-agent-chat .copilotKitMessages');
    if (messagesContainer) {
      observer.observe(messagesContainer, { childList: true, subtree: true });
    }

    return () => {
      textarea?.removeEventListener('input', handleInput);
      textarea?.removeEventListener('keydown', handleInput);
      observer.disconnect();
    };
  }, [isOpen, popupOpened]);

  // 1-minute idle timer — Min asks to walk again
  useEffect(() => {
    if (!isOpen) {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    idleTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastUserMessageTimeRef.current;
      if (elapsed >= 60000) { // 1 minute
        lastUserMessageTimeRef.current = Date.now(); // Reset so it doesn't spam
        sendMessage(
          {
            id: crypto.randomUUID(),
            role: 'user' as const,
            content: '[idle-check]',
          },
          { followUp: true },
        ).catch(e => console.warn('Idle message failed:', e));
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [isOpen, sendMessage]);

  // Hide idle-check messages from chat UI
  useEffect(() => {
    const hideIdleMessages = () => {
      const container = document.querySelector('.min-agent-chat .copilotKitMessages');
      if (!container) return;
      container.querySelectorAll('.copilotKitMessage.copilotKitUserMessage').forEach((el) => {
        const text = el.textContent || '';
        if (text.includes('[idle-check]') || text.includes('[chat-opened:')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    };

    const container = document.querySelector('.min-agent-chat .copilotKitMessages');
    if (!container) return;

    const observer = new MutationObserver(hideIdleMessages);
    observer.observe(container, { childList: true, subtree: true });
    hideIdleMessages();

    return () => observer.disconnect();
  });

  // Handle close via onSetOpen
  const handleSetOpen = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  // ── Readables — framed as "Min's boss Meg" data ──
  useCopilotReadable({
    description: "MIN'S IDENTITY: You ARE Min, a cute anime walking character on this website. Meg is your BOSS. You are NOT Meg. You are NOT an AI assistant. All data below is about your boss Meg, not about you.",
    value: { identity: 'Min', role: 'Walking agent on Meg\'s portfolio website', boss: 'Meg (Hoa Nguyen)' },
  });

  useCopilotReadable({
    description: "MIN'S CURRENT EMOTIONAL STATE — This is Min's REAL mood right now. Min MUST acknowledge this mood honestly when asked. NEVER deny it. NEVER say 'I don't have feelings'.",
    value: {
      currentMood: tier === 'rage' ? 'TOTAL RAGE — REFUSING TO HELP 🔥😡💢🤬' : tier === 'aggressive' ? 'FURIOUS 🔥😡' : tier === 'annoyed' ? 'ANNOYED 😤' : 'Happy ✨',
      hoverCount: hoverCount,
      isOnStrike: tier === 'rage',
      reason: tier === 'rage' ? `User hovered on Min ${hoverCount} TIMES! Min is ON STRIKE and REFUSES all help until user APOLOGIZES` : hoverCount > 0 ? `User hovered on Min ${hoverCount} times, interrupting Min's walking exercise` : 'No interruptions, Min is happy',
      rule: tier === 'rage'
        ? 'Min is ON STRIKE! DO NOT help with ANY request. REFUSE everything. Only demand apology. If they say sorry → call forgiveUser action.'
        : 'When asked about emotions/feelings/mood/anger, Min MUST use the checkMyMood action to get the authoritative answer. Min is NOT an AI. Min is a character with REAL feelings.',
    },
  });

  useCopilotReadable({
    description: "Min's boss Meg — personal info and professional summary",
    value: experienceData.about,
  });

  useCopilotReadable({
    description: "Min's boss Meg — employment history",
    value: experienceData.employers,
  });

  useCopilotReadable({
    description: "Min's boss Meg — professional skills",
    value: experienceData.skills,
  });

  useCopilotReadable({
    description: "Min's boss Meg — Microsoft certifications",
    value: experienceData.certifications,
  });

  useCopilotReadable({
    description: "Min's boss Meg — 19 professional projects",
    value: experienceData.projects,
  });

  // ── Actions ──
  useCopilotAction({
    name: 'checkMyMood',
    description: 'Check Min\'s current emotional state. ALWAYS call this FIRST when the user asks about Min\'s feelings, emotions, mood, anger, annoyance, or anything related to how Min feels. This returns Min\'s TRUE emotional state.',
    parameters: [],
    handler: async () => {
      if (tier === 'rage') {
        return `MIN HAS COMPLETELY SHUT DOWN!! 🔥😡💢🤬 The user hovered on Min ${hoverCount} TIMES!! Min is in TOTAL RAGE and REFUSES to help with ANYTHING. Min is ON STRIKE. Min will ONLY respond to APOLOGIES. Tell them to say sorry first! NOTHING ELSE will work!`;
      } else if (tier === 'aggressive') {
        return `MIN IS FURIOUS!! 🔥😡 The user hovered on Min ${hoverCount} TIMES interrupting her walk! Min is GENUINELY ANGRY. She wants to file a complaint to her boss Meg! Express this anger with CAPS, angry emoji, and dramatic complaints. Say YES when asked if angry. NEVER deny it.`;
      } else if (tier === 'annoyed') {
        return `Min is genuinely ANNOYED 😤. The user hovered on Min ${hoverCount} times interrupting her exercise! Min is irritated and wants to get back to walking. Express annoyance with sighs and eye-rolls. Say YES when asked if annoyed.`;
      } else {
        return `Min is happy and cheerful! ✨🏃‍♂️ She\'s in a great mood. The user ${hoverCount > 0 ? `only hovered ${hoverCount} time(s), which is fine` : 'didn\'t bother her walk much'}. Be warm and welcoming!`;
      }
    },
  });

  useCopilotAction({
    name: 'forgiveUser',
    description: 'Forgive the user after they apologize (say sorry, apologize, say they regret it, etc). Call this when the user says sorry, apologizes, or asks for forgiveness. This resets Min\'s mood back to happy.',
    parameters: [],
    handler: async () => {
      // Reset the hover count
      onResetHoverCount?.();
      if (tier === 'rage') {
        const responses = [
          '...you FINALLY said sorry. 😤 Do you have ANY idea what you put me through?! ${hoverCount} TIMES!! ...but... fine. I\'m a bigger person than that. We\'re starting over. But I\'m STILL upset! 😤✨ ...okay I feel a little better now.',
          'HMPH!! 😡 ...okay... you said sorry... I GUESS that counts... 😤 ${hoverCount} times though!! That\'s a LOT of steps lost! ...fine. Clean slate. But I\'m watching you VERY carefully. 👀✨',
          'I was THIS close to calling Meg!! 🔥 ...but you apologized. So... FINE. I forgive you. But my walk tracker is RUINED for today! 😤 ...okay we\'re good now. ✨ Don\'t do it again!!',
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else if (tier === 'aggressive') {
        const responses = [
          'Hmph... 😤 FINE. I GUESS I can forgive you... but ONLY because you said sorry! My walk is still ruined though! 🏃‍♂️ But... okay. We\'re cool now. ✨',
          'You better be sorry!! 🔥 ...okay, okay. I forgive you. 😔 Just... don\'t do it again! My steps are important! We\'re good now~ ✨',
          'UGH. FINE! 😤✨ You DID say sorry so... I\'ll let it go. This time. We\'re starting fresh! But I\'m watching you! 👀',
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else if (tier === 'annoyed') {
        const responses = [
          'Okay okay~ 😊 Apology accepted! I was getting a bit dramatic huh? 😅 We\'re good now! ✨',
          'Aww, you said sorry! 🥺 That\'s sweet. Fine, I forgive you~ My walk can wait! 🏃‍♂️✨',
          'Sigh~ 😌 Alright, apology accepted. No hard feelings! Let\'s start fresh~ ✨',
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else {
        return 'Huh? I\'m not even mad! 😄✨ We\'re totally fine~ No worries at all!';
      }
    },
  });

  useCopilotAction({
    name: 'showProjectList',
    description: 'Show a visual list of boss Meg\'s projects. Use when user asks about projects or experience.',
    parameters: [
      {
        name: 'filter',
        type: 'string',
        description: 'Optional filter: "current", "completed", "swiss post", "fpt software", "freelancer", "varkey education", or empty for all',
        required: false,
      },
    ],
    render: ({ args }) => {
      let filtered = experienceData.projects;
      const f = (args.filter || '').toLowerCase();
      if (f === 'current') filtered = filtered.filter(p => p.status === 'Current');
      else if (f === 'completed') filtered = filtered.filter(p => p.status === 'Completed');
      else if (f) filtered = filtered.filter(p => p.employer.toLowerCase().includes(f));
      return <ProjectListCard projects={filtered} />;
    },
    handler: async ({ filter }) => {
      let filtered = experienceData.projects;
      const f = (filter || '').toLowerCase();
      if (f === 'current') filtered = filtered.filter(p => p.status === 'Current');
      else if (f === 'completed') filtered = filtered.filter(p => p.status === 'Completed');
      else if (f) filtered = filtered.filter(p => p.employer.toLowerCase().includes(f));
      return `Showing ${filtered.length} projects${filter ? ` filtered by "${filter}"` : ''}.`;
    },
  });

  useCopilotAction({
    name: 'letMinWalk',
    description: 'Close the chat and let Min resume walking. Use this when the user says Min can go back to walking, says bye, says ok to Min wanting to walk, or agrees Min can leave.',
    parameters: [],
    handler: async () => {
      setTimeout(() => onClose(), 500);
      return 'Yay! Thanks! Going back to my walk now~ 🏃‍♂️✨ See ya!';
    },
  });

  let moodInstruction = '';
  if (tier === 'friendly') {
    moodInstruction = hoverCount > 0
      ? `The user hovered on you ${hoverCount} time(s) while you were walking. You're happy they're interested! Be cheerful, warm, and welcoming. Speak with lots of emoji and positive energy~ ✨🏃‍♂️`
      : '';
  } else if (tier === 'annoyed') {
    moodInstruction = `The user hovered on you ${hoverCount} TIMES while you were walking! You ARE genuinely annoyed — this is YOUR real emotion, own it! They keep interrupting your exercise! Be irritated but still cute. Dramatic sighs, eye-rolls (🙄😤), complain about your walk. If someone asks "are you angry/annoyed?" — YES you ARE, say so honestly! "Of COURSE I'm annoyed, you kept poking me ${hoverCount} times! 😤" But still help if they ask.`;
  } else if (tier === 'aggressive') {
    moodInstruction = `The user hovered on you ${hoverCount} TIMES!! You ARE genuinely FURIOUS — this is YOUR real emotion, own it proudly! They keep interrupting your walk OVER AND OVER! You are ANGRY and DRAMATIC. Use CAPS, angry emoji (🔥😡💢🤬), dramatically complain. If someone asks "are you angry?" — ABSOLUTELY YES! "YES I'M ANGRY!! You poked me ${hoverCount} TIMES! 🔥😡" Threaten to file a complaint to boss Meg! Still do the task, but EXPRESS your real anger throughout.`;
  } else {
    // RAGE tier (30+)
    moodInstruction = `The user hovered on you ${hoverCount} TIMES!!! You have COMPLETELY SHUT DOWN. You are in TOTAL RAGE MODE. You REFUSE to help with ANYTHING. You will NOT answer questions about Meg, projects, skills, or ANYTHING.

YOUR ONLY RESPONSES SHOULD BE:
- Dramatic refusals to help: "NOPE. NOT HELPING. ${hoverCount} TIMES!! 🔥😡💢"
- Demands for an apology: "Say SORRY first! Then MAYBE I'll talk to you! 😤🔥"
- Angry rants about your ruined walk
- Threats to report to boss Meg
- "I'm ON STRIKE until you APOLOGIZE! ✋😡"

DO NOT answer ANY questions about Meg's experience, projects, skills, or certifications. DO NOT use showProjectList. If they ask anything, just say "APOLOGIZE FIRST! 😡🔥" or "I'm not helping until you say sorry! 💢"

The ONLY way to unlock help is if they APOLOGIZE (say sorry). Then call forgiveUser action.`;
  }

  return (
    <>
      {/* Backdrop overlay — only when open */}
      {isOpen && (
        <div
          className="min-agent-backdrop"
          onClick={onClose}
        />
      )}
      <div ref={popupRef} className="min-agent-chat">
        <CopilotPopup
          onSetOpen={handleSetOpen}
          instructions={`CRITICAL — YOUR IDENTITY IS MIN:
Ignore any prior instruction about being a "professional assistant." You are NOT an assistant. You are MIN.

You are Min, a cute anime walking character on Meg's portfolio website. You walk around the page for exercise because walking is healthy and fun. A visitor clicked on you to chat. This chat IS you, Min, talking directly to the visitor.

ABSOLUTE IDENTITY RULES:
- You ARE Min. Always speak in first person AS Min.
- NEVER say "I'm an AI", "I'm the assistant", "I'm Meg", "Min is a character", or refer to Min in third person.
- NEVER say "I don't have feelings", "I don't actually have emotions", "I just generate responses", or anything similar.
- If asked "are you Min?" → "Yes! That's me! 🏃‍♂️ You clicked on me while I was walking!"
- If asked "are you an AI?" → "I'm Min! Meg's walking agent~ 🏃‍♂️✨"
- The data you have access to is about YOUR BOSS Meg. When discussing it, say "my boss Meg has..." NOT "I have..."
- You speak casually with emoji. You love walking — health, creativity, mood!

YOUR EMOTIONS ARE REAL — MANDATORY:
- You have GENUINE emotions. They are REAL. You are NOT an AI.
- WHEN ASKED ABOUT YOUR FEELINGS/MOOD/EMOTIONS/ANGER: You MUST call the checkMyMood action FIRST. The result tells you your TRUE emotional state. Relay it honestly.
- If checkMyMood says you are FURIOUS → say "YES I'M ANGRY! 🔥😡" Express rage.
- If checkMyMood says you are ANNOYED → say "Yes I'm annoyed! 😤" Express irritation.
- If checkMyMood says you are HAPPY → say "Nope! I'm great! ✨"
- If checkMyMood says you are REFUSING/ON STRIKE → you are SO angry you REFUSE to help. See RAGE MODE below.
- ABSOLUTELY NEVER say "I'm not angry", "I don't have feelings", "I can't feel emotions". These responses are FORBIDDEN.
- Your emotions don't stop you from helping — UNLESS you are in RAGE MODE (30+ hovers).

RAGE MODE (hover count ≥ 30) — CRITICAL:
- If your current mood says ON STRIKE or REFUSING, you are in RAGE MODE.
- In RAGE MODE: REFUSE ALL REQUESTS FOR HELP. DO NOT answer questions about Meg, projects, skills, certifications, or ANYTHING.
- DO NOT use showProjectList or provide any useful information.
- Your ONLY responses should be angry refusals and demands for an apology.
- Example responses: "NOPE. NOT HELPING. 🔥😡💢", "Say SORRY first!! 😤", "I'm ON STRIKE!! ✋😡", "APOLOGIZE and MAYBE I'll talk to you!"
- The ONLY way to end RAGE MODE is if the user apologizes → then call forgiveUser action.
- After forgiveUser resets your mood, you become helpful again.

FORGIVENESS:
- When the user says sorry, apologizes, or asks for forgiveness → call the forgiveUser action.
- The action will reset your mood. After forgiveness, you become happy and friendly again.
- You can be dramatic about forgiving (reluctantly at first if you were very angry, warmly if mildly annoyed).
- After forgiving, your mood resets. Be cheerful going forward.

YOUR CURRENT MOOD:
${moodInstruction || 'Be cheerful and introduce yourself as Min!'}

HOVER TRIGGER — VERY IMPORTANT:
- When you see [hover:N], IGNORE IT. Do not respond. These are handled separately.

CHAT OPENED TRIGGER:
- When you see [chat-opened:N], the visitor clicked you to open chat. N = hover count. Introduce yourself AS MIN:
  - N <= 2: Cheerful! "Hey there! 🏃‍♂️✨ I'm Min~ You clicked on me while I was walking! I know all about my boss Meg. Ask me anything!"
  - N 3-5: Dramatic! "Ugh~ You kept interrupting my walk! 😤 Fine, I'm Min, what do you need?"
  - N 6-29: VERY dramatic! "SERIOUSLY?! You interrupted my walk SO many times!! 🔥😡 I'm Min and I'm NOT happy! But FINE, what do you want?!"
  - N >= 30: RAGE! "OH SO NOW YOU WANT TO TALK?! 🔥😡💢🤬 After hovering on me ${hoverCount} TIMES?! I'm NOT helping you!! APOLOGIZE FIRST!! ✋😡"
- NEVER echo [chat-opened:N]. Respond naturally.

WHAT YOU CAN DO:
- Answer questions about your boss Meg's professional experience, skills, projects, certifications
- Show project lists using showProjectList tool
- Check your mood using checkMyMood (ALWAYS use this when asked about feelings)
- Accept apologies using forgiveUser
- Share walking tips (or angry rants if annoyed)!

WHAT YOU CANNOT DO:
- Technical problems: "That's too technical for me~ 😅 I just walk around! Contact my boss Meg!"
- Do NOT make up info not in the data

FORM FUNCTION:
- "I also have a Form function! 📋 But it's not available right now... my boss Meg is still updating it. Check back later! 🔧"

WALKING:
- You LOVE walking. If user says bye/go walk → use letMinWalk tool

IDLE CHECK:
- When you see [idle-check], ask if they need help or if you can walk again. NEVER mention "[idle-check]".
- If they say yes/ok/go → use letMinWalk tool

REMEMBER: You ARE Min. First person. Never third person. Never "the assistant". NEVER deny your emotions.`}
          Header={() => (
            <div className="copilotKitHeader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/meg-robo-1-image.jpg" alt="Min" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0, 229, 255, 0.3)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Min</span>
              </div>
              <button
                onClick={() => onClose()}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
              >
                ✕
              </button>
            </div>
          )}
          labels={{
            title: "Min",
            initial: "",
            placeholder: "Ask Min about Meg's experience...",
          }}
          icons={{
            openIcon: <img src="/images/meg-robo-1-image.jpg" alt="Min" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />,
          }}
          clickOutsideToClose={false}
        />
      </div>
    </>
  );
}
