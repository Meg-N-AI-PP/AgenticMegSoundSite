# Phase 1 — Portfolio Website Documentation

> **Project:** Meg — Personal Portfolio Website  
> **Phase:** 1 — Core Portfolio with Agentic UI  
> **Date:** February 10, 2026  
> **Status:** ✅ Completed

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Component Architecture](#component-architecture)
5. [Component Details](#component-details)
6. [Image Assets](#image-assets)
7. [Animations & Interactions](#animations--interactions)
8. [Design System](#design-system)
9. [Contact Information](#contact-information)
10. [How to Run](#how-to-run)
11. [Future Considerations](#future-considerations)

---

## Overview

Phase 1 delivers a modern, single-page portfolio website for **Meg** — a Senior Microsoft Power Platform & Dynamics 365 CRM Developer with 8+ years of experience. The site showcases professional skills, project experience, certifications, and contact information.

The design follows an **agentic aesthetic** — dark space-themed background with cyan/purple gradients, glass-morphism cards, neural network particle animations, and smooth scroll-triggered reveals. This visual language aligns with the future direction of integrating agentic AI capabilities into the Power Platform ecosystem.

### Key Deliverables

- ✅ Responsive single-page portfolio website
- ✅ Modern agentic-themed UI with dark mode design
- ✅ Smooth animations using anime.js library
- ✅ Interactive particle background (neural network effect)
- ✅ All CV information presented across structured sections
- ✅ Contact information with social links
- ✅ Mobile-friendly responsive design

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | ^18.3.1 | UI component framework |
| **TypeScript** | ^5.6.3 | Type-safe development |
| **Vite** | ^6.0.3 | Build tool & dev server |
| **anime.js** | ^3.2.2 | Animation library |
| **CSS3** | — | Custom styling (no UI framework) |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@types/react` | ^18.3.12 | React type definitions |
| `@types/react-dom` | ^18.3.1 | ReactDOM type definitions |
| `@vitejs/plugin-react` | ^4.3.4 | Vite React plugin |

---

## Project Structure

```
Src/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config (root)
├── tsconfig.app.json             # TypeScript config (app)
├── tsconfig.node.json            # TypeScript config (node)
├── public/
│   └── images/                   # Static image assets
│       ├── meg-robo-1-image.jpg  # Profile image
│       ├── Power_App.png         # Power Apps icon
│       ├── Power_Automate.jpg    # Power Automate icon
│       ├── Power_Page.svg        # Power Pages icon
│       ├── Microsoft_Power_Platform_logo.svg
│       ├── Microsoft_Copilot_Icon.svg.png
│       ├── Azure.jpg
│       ├── New_Power_BI_Logo.svg.png
│       ├── meg-robo-icon.png
│       └── robot.webp
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root app component
    ├── App.css                   # Global styles & design system
    ├── vite-env.d.ts             # Vite type declarations
    ├── animejs.d.ts              # anime.js type declarations
    └── components/
        ├── AgenticBackground.tsx # Particle canvas background
        ├── Navbar.tsx            # Navigation bar
        ├── Hero.tsx              # Landing/hero section
        ├── About.tsx             # About me section
        ├── Skills.tsx            # Skills grid section
        ├── Experience.tsx        # Project timeline section
        ├── Certifications.tsx    # Certifications section
        └── Footer.tsx            # Footer with contact links
```

---

## Component Architecture

```
<App>
├── <AgenticBackground />          ← Fixed canvas particle background
├── <Navbar />                     ← Sticky top navigation bar
└── <main>
│    ├── <Hero />                  ← Full-viewport landing section
│    ├── <About />                 ← Bio, stats & highlight cards
│    ├── <Skills />                ← 4-category skill grid
│    ├── <Experience />            ← 5-project vertical timeline
│    └── <Certifications />        ← PL-400 certification spotlight
└── <Footer />                     ← Contact, approach & copyright
```

### Data Flow

All components are **self-contained** — CV data is embedded directly within each component. No external API calls, routing, or global state management is used. This keeps the Phase 1 architecture simple and maintainable while allowing future phases to introduce data layers.

---

## Component Details

### 1. AgenticBackground

| Property | Detail |
|---|---|
| **File** | `src/components/AgenticBackground.tsx` |
| **Purpose** | Full-viewport interactive particle canvas creating a "neural network" ambiance |
| **Animation Engine** | Native `requestAnimationFrame` (not anime.js) |

**Features:**
- Responsive canvas that resizes with the browser window
- Up to 80 particles with density based on viewport area
- Connection lines drawn between particles within 160px (cyan, with opacity falloff)
- **Mouse repulsion** — particles push away within 180px of the cursor
- Each particle has sine-based opacity/size pulsation
- Glow halo effect around each particle (4× size, low opacity)
- Velocity damping (0.995) and screen-edge wrapping
- Fixed position behind all content (`z-index: 0`)

---

### 2. Navbar

| Property | Detail |
|---|---|
| **File** | `src/components/Navbar.tsx` |
| **Purpose** | Sticky top navigation with smooth-scroll links |
| **Nav Links** | About, Skills, Experience, Certifications |

**Features:**
- Scroll detection — adds `scrolled` class after 50px for glass-morphism background + blur effect
- Smooth scroll to sections on click
- Mobile hamburger menu toggle (slides in from right)
- Gradient underline hover effect on links

**Animations (anime.js):**
- Logo slides in from left (`translateX: [-30, 0]`)
- Nav links fade in + slide down with 100ms stagger

---

### 3. Hero

| Property | Detail |
|---|---|
| **File** | `src/components/Hero.tsx` |
| **Purpose** | Full landing section with name, title, CTAs, social links, and profile visual |

**Content Displayed:**
- Availability badge: "Available for Engagements" with pulsing green dot
- Name: **"Meg"** (per-character animated)
- Title: Senior Microsoft Power Platform & Dynamics 365 CRM Developer
- Description: 8+ years experience summary
- CTA buttons: "View My Work" → #experience, "Explore Skills" → #skills
- Social links: Email, Zalo, LinkedIn, Suno Music
- Profile image: `meg-robo-1-image.jpg` with gradient ring and glow
- 6 floating tech icons orbiting the profile image

**Floating Tech Icons:**
| Position | Icon | Image |
|---|---|---|
| Top right | Power Apps | `Power_App.png` |
| Right middle | Power Automate | `Power_Automate.jpg` |
| Bottom right | Power Pages | `Power_Page.svg` |
| Bottom left | Power Platform | `Microsoft_Power_Platform_logo.svg` |
| Left middle | Copilot | `Microsoft_Copilot_Icon.svg.png` |
| Top left | Azure | `Azure.jpg` |

**Animations (anime.js timeline):**
1. Badge fades in + slides up
2. Title characters stagger in with 3D rotateX effect (60ms delay each)
3. Subtitle slides up
4. Description slides up
5. CTA group slides up
6. Social link icons pop in with scale + stagger
7. Profile image container scales in
8. Tech icons pop in with stagger
9. Scroll indicator fades in

**Infinite Animations:**
- Profile image: floating up/down (`translateY` oscillation, 3.5s)
- Each tech icon: unique floating pattern with different durations (2.6s–3.4s)
- Glow pulse: opacity + scale oscillation (2.5s)
- Gradient ring: continuous rotation (8s CSS animation)

---

### 4. About

| Property | Detail |
|---|---|
| **File** | `src/components/About.tsx` |
| **Purpose** | Professional summary, stats, and approach highlight cards |

**Content Displayed:**
- 3 paragraphs covering CRM expertise, lifecycle experience, and AI focus
- **Stats:** 8+ Years Experience · 5+ Major Projects · PL-400 Certified
- **4 Highlight Cards:**
  - 🎯 Business-First Approach
  - 🏗️ Scalable Architecture
  - 🤖 AI-Ready Solutions
  - 🛡️ Governance First

**Animations (anime.js + IntersectionObserver @ 0.15):**
- Section label slides from left
- Heading slides up
- Paragraphs stagger up (150ms delay)
- Stats scale in with stagger
- Highlight cards slide in from right with stagger

---

### 5. Skills

| Property | Detail |
|---|---|
| **File** | `src/components/Skills.tsx` |
| **Purpose** | 4-category skill grid with themed color-accented cards |

**Skill Categories:**

| Category | Icon | Accent Color | Skills (5 each) |
|---|---|---|---|
| Dynamics 365 CRM / CE | 🔷 | Cyan (#00e5ff) | D365 CE, Customer Service, Custom Entities, Security Roles, Full Lifecycle |
| Power Platform | ⚡ | Purple (#7c3aed) | Power Apps, Power Automate, Dataverse, Power Pages, Governance/ALM |
| Development & Integration | ⚙️ | Green (#00e676) | C#, JavaScript, REST APIs, Azure Functions, Service Bus |
| AI & Agentic Solutions | 🤖 | Orange (#ff6b35) | Copilot Studio, Bot Migration, Multi-agent, Knowledge Agents, Foundry |

**Features:**
- CSS custom property (`--card-color`) per card for theming
- Colored skill dots matching category accent
- Card glow effect on hover
- Gradient top border on hover

**Animations (anime.js + IntersectionObserver @ 0.1):**
- Section label slides from left
- Heading slides up
- Skill cards stagger in with scale + translateY (150ms delay, 1000ms duration)

---

### 6. Experience

| Property | Detail |
|---|---|
| **File** | `src/components/Experience.tsx` |
| **Purpose** | Vertical timeline of 5 projects with status badges and tech tags |

**Projects:**

| # | Project | Status | Color | Key Technologies |
|---|---|---|---|---|
| 1 | Enterprise Education Platform | Current | 🟢 Green | D365 CE, Dataverse, Power Apps, Power Pages, Power Automate, React |
| 2 | Contract Management & Digital Signature | Current | 🟢 Green | Canvas Apps, SharePoint, Power Automate, Adobe Sign, Dataverse |
| 3 | Vehicle Lending System | Completed | 🔵 Cyan | Power Apps, Dataverse, Power Automate |
| 4 | Document Approval Platform | Completed | 🔵 Cyan | Power Apps, Power Automate, Outlook |
| 5 | Copilot Studio & Agentic Consulting | Research | 🟣 Purple | Copilot Studio, Bot Framework, Foundry, AI Integration |

**Features:**
- Vertical timeline with gradient line (cyan → purple → glass-border)
- Status-colored markers and badges
- Tech tag chips (mono font, cyan-tinted)
- Highlight bullet lists with `▹` markers
- Card slides right on hover

**Animations (anime.js + IntersectionObserver @ 0.05):**
- Section label slides from left
- Heading slides up
- Timeline items stagger slide in from left (200ms delay, 1000ms duration)

---

### 7. Certifications

| Property | Detail |
|---|---|
| **File** | `src/components/Certifications.tsx` |
| **Purpose** | PL-400 certification spotlight card with animated SVG badge |

**Content Displayed:**
- SVG star + circle badge with cyan-to-purple gradient
- "PL-400" badge text
- Microsoft Certified — Power Platform Developer Associate
- Status: Current — Planned Renewal (pulsing green dot)
- Power Platform logo

**Animations (anime.js + IntersectionObserver @ 0.25):**
- Section label slides from left
- Heading slides up
- Card scales in (0.8 → 1)
- SVG badge rotates continuously (20s CSS animation)
- Glow effect pulses infinitely (opacity + scale oscillation)

---

### 8. Footer

| Property | Detail |
|---|---|
| **File** | `src/components/Footer.tsx` |
| **Purpose** | Three-column footer with bio, work approach, and contact links |

**Content Displayed:**

| Column | Content |
|---|---|
| Main | "Meg" with hexagon logo, title, career focus statement |
| Work Approach | 5 points: business-first, data ownership, Dataverse evolution, governance, AI-ready |
| Let's Connect | Email, Zalo, LinkedIn, Suno Music links + "Back to Top" button |

**Footer Bottom:** `© 2026 Meg. Crafted with passion for Power Platform.`

**Animations (anime.js + IntersectionObserver @ 0.2):**
- All children stagger fade in + slide up (150ms stagger, 800ms duration)

---

## Image Assets

| File | Source | Used In | Status |
|---|---|---|---|
| `meg-robo-1-image.jpg` | Media/Images | Hero (profile photo) | ✅ Active |
| `Power_App.png` | Media/Images (renamed from .7c939c07...) | Hero floating icon | ✅ Active |
| `Power_Automate.jpg` | Media/Images | Hero floating icon | ✅ Active |
| `Power_Page.svg` | Media/Images | Hero floating icon | ✅ Active |
| `Microsoft_Power_Platform_logo.svg` | Media/Images | Hero floating icon + Certifications | ✅ Active |
| `Microsoft_Copilot_Icon.svg.png` | Media/Images | Hero floating icon | ✅ Active |
| `Azure.jpg` | Media/Images | Hero floating icon | ✅ Active |
| `robot.webp` | Media/Images | Favicon | ✅ Active |
| `meg-robo-icon.png` | Media/Images | — | ⬜ Available |
| `New_Power_BI_Logo.svg.png` | Media/Images | — | ⬜ Available |

---

## Animations & Interactions

### Animation Library Usage

| Technique | Components |
|---|---|
| **anime.js timeline** | Hero (sequential entrance) |
| **anime.js + IntersectionObserver** | About, Skills, Experience, Certifications, Footer |
| **anime.js on mount** | Navbar |
| **requestAnimationFrame canvas** | AgenticBackground |
| **CSS keyframes** | Badge dot pulse, ring rotation, scroll indicator, badge rotation |

### Interaction Patterns

| Interaction | Behavior |
|---|---|
| **Scroll** | Navbar glass effect, section reveal animations |
| **Mouse move** | Particle repulsion on canvas background |
| **Hover — Cards** | Translate up, glow effect, border highlight, gradient top border |
| **Hover — Timeline** | Card slides right with shadow |
| **Hover — Tech icons** | Scale up 1.2× with cyan glow |
| **Hover — Social links** | Lift up with cyan glow shadow |
| **Hover — Nav links** | Gradient underline animation |
| **Click — Nav/CTA** | Smooth scroll to target section |
| **Click — Contact links** | Opens mailto/tel/external URLs |

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#06061a` | Page background |
| `--bg-secondary` | `#0c0c2e` | Section backgrounds |
| `--bg-card` | `rgba(12, 12, 46, 0.6)` | Card backgrounds |
| `--accent-cyan` | `#00e5ff` | Primary accent (links, highlights) |
| `--accent-purple` | `#7c3aed` | Secondary accent (gradients) |
| `--accent-green` | `#00e676` | Status indicators (active/current) |
| `--accent-orange` | `#ff6b35` | AI/Agentic category accent |
| `--accent-gradient` | `135deg, #00e5ff → #7c3aed` | Gradient text, buttons, borders |
| `--text-primary` | `#e8e8ff` | Main text |
| `--text-secondary` | `#9999bb` | Body text |
| `--text-muted` | `#666688` | Labels, captions |
| `--glass-bg` | `rgba(255,255,255, 0.03)` | Glass-morphism fill |
| `--glass-border` | `rgba(255,255,255, 0.08)` | Glass-morphism border |

### Typography

| Font | Usage |
|---|---|
| **Inter** (300–900) | Primary sans-serif for all UI text |
| **JetBrains Mono** (400–600) | Monospace for labels, tags, badges, code-style text |

### Breakpoints

| Width | Adjustments |
|---|---|
| ≤ 1024px | Reduced hero image size, 2-column skills grid |
| ≤ 768px | Mobile nav drawer, single-column layouts, stacked hero, reduced section padding |
| ≤ 480px | Single-column highlight cards, stacked stats, full-width CTAs |

---

## Contact Information

| Channel | Detail | Link |
|---|---|---|
| **Email** | hoait1996@gmail.com | mailto:hoait1996@gmail.com |
| **Zalo** | +84 0772805512 | tel:+840772805512 |
| **LinkedIn** | hoaakameg | https://www.linkedin.com/in/hoaakameg/ |
| **Suno Music** | @megssrare | https://suno.com/@megssrare |

Contact links appear in two locations:
1. **Hero section** — Icon-only social link buttons below CTAs
2. **Footer** — Full labeled contact links with icons

---

## How to Run

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Install & Start

```bash
cd Src
npm install
npm run dev
```

The dev server runs at **http://localhost:5173** with Hot Module Replacement (HMR).

### Build for Production

```bash
npm run build
```

Output is generated in `Src/dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## Future Considerations

Phase 1 was built with future extensibility in mind:

- **React + TypeScript** provides a strong foundation for adding routing, state management, and API integration in later phases
- **Component-based architecture** makes it easy to add new sections or modify existing ones
- **Vite** supports fast builds and modern tooling for larger applications
- **Agentic visual theme** aligns with future AI/agent integration plans
- **Data is currently embedded** in components — can be extracted to a data layer or CMS in future phases
- **anime.js** is already integrated for complex animations and can be reused for new interactive features

### Potential Phase 2+ Enhancements
- Dynamic data from a backend or CMS
- Blog or case study pages
- Integration with agentic AI models (chatbot, copilot)
- Multi-page routing with React Router
- Dark/light theme toggle
- Internationalization (i18n)
- Analytics integration
