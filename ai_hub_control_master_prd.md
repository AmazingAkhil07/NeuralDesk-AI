# 🧠 NeuralDesk — Crazy PRD (Personal Founder Intelligence System)

## 1. Product Overview

**Product Name:** NeuralDesk  
**Product Type:** Personal Web Application (Private-first)  
**Primary User:** *You (AI-native founder, CS student, builder)*  

### One-Liner
NeuralDesk is a personal AI-powered control center to track the AI world in real time, discover the best tools, and brutally validate startup ideas before wasting time building them.

### Core Philosophy
- Built **for personal leverage**, not mass users (initially)
- Opinionated > generic
- Brutally honest > motivational
- Signal > noise
- Decision-making > consumption

---

## 2. Problem Statement

### Current Problems
- AI news is fragmented across Twitter, blogs, Discords, and Reddit
- New models and tools launch weekly — impossible to track manually
- No single place to compare models/tools objectively
- Startup ideas are validated emotionally, not logically
- Founders waste months building ideas that already exist or don’t monetize

### Key Insight
> The real bottleneck is not information — it is **clarity and judgment**.

---

## 3. Goals & Success Criteria

### Primary Goals
- Stay **continuously up-to-date** with AI models, tools, and trends
- Reduce decision fatigue
- Kill bad startup ideas early
- Strengthen good ideas before building

### Success Metrics (Personal)
- Daily usage (opens app daily)
- Time saved vs scrolling
- Number of ideas killed early
- Number of ideas improved before execution

---

## 4. Core Modules (Tabs)

Each module is designed to be **LLM-friendly**, meaning inputs, outputs, tone, and constraints are explicit so AI models understand exactly what to do.

---

## 4.1 🌍 AI News Intelligence Tab

### Purpose
Real-time, summarized, high-signal AI news feed.

### Features
- Aggregated news from:
  - OpenAI, Anthropic, Google DeepMind blogs
  - HuggingFace
  - arXiv (AI/ML categories)
  - Reddit (MachineLearning, LocalLLaMA)
- Auto-refresh feed
- AI-generated TL;DR for each item
- Tags: `Model`, `Research`, `Tool`, `Update`, `Open-source`

### UI
- Card-based feed
- Source badge
- “Why this matters” summary

---

## 4.2 🧬 AI Models Tracker Tab

### Purpose
Single source of truth for AI models.

### Data Points
- Model name
- Company
- Type (Text / Multimodal / Video / Audio)
- Context length
- Open-source vs Closed
- Strengths & weaknesses
- Last update date
- Personal rating

### Advanced (Later)
- Benchmark comparisons
- Cost trends
- Model evolution timeline

---

## 4.3 🛠️ AI Tools Radar Tab

### Purpose
Discover, compare, and replace AI tools intelligently.

### Categories
- Coding & Dev
- Image Generation
- Video Generation
- Audio & Music
- Writing & Research
- Vibe / Creative tools
- Experimental / Agents

### Tool Card
- Name
- One-line description
- Best use-case
- Category
- Link
- Personal rating
- Status: `Active`, `Replaced`, `Testing`

### Smart Feature: Tool Replacement Detection
- Flags newer or better tools
- Highlights tools outperforming current ones

---

## 4.4 🚀 Startup Idea Power Test (Core Innovation)

### Purpose
Brutally validate startup ideas before execution — honesty is prioritized over encouragement.

### Required Input Schema (Strict)
- Idea name
- One-liner (max 25 words)
- Problem statement (who hurts and why)
- Target user (specific, not generic)
- Proposed solution (how it works)
- Why AI is needed (optional but evaluated)

### Evaluation Stages

#### 1️⃣ Existence Check
- Identify direct competitors
- Identify indirect substitutes
- Identify open-source or big-tech overlap

**Output:**
- Exists / Partially Exists / New
- List of references

#### 2️⃣ Market & Timing Test
- Pain intensity (Low / Medium / High)
- Will users actively seek this?
- Is this a "nice-to-have" or "must-have"?

#### 3️⃣ Differentiation Test
- Force one-sentence differentiation
- Flag buzzwords or vague positioning

#### 4️⃣ AI Justification Test
- AI essential / AI optional / AI unnecessary

#### 5️⃣ Monetization Reality Check
- Who pays?
- How much realistically?
- B2C / B2B / Enterprise / Indie

### Final Verdict Output (Fixed Format)
- Score: 0–10
- Recommendation: Build / Iterate / Kill
- Brutal summary line (no sugarcoating)

---

## 4.5 🪦 Idea Graveyard

### Purpose
Preserve failed ideas as learning assets.

### Data Stored
- Idea summary
- Why it failed
- What was learned
- Future pivots (if any)

---

## 4.6 🧠 Personal Knowledge Vault

### Purpose
Your second brain for AI & startups.

### Features
- Bookmark news, tools, ideas
- Add personal notes
- Tag system (`startup`, `research`, `fun`, `urgent`)

---

## 4.7 📈 Trends & Signals Dashboard

### Purpose
High-level intelligence view.

### Insights
- Fastest growing tools
- Most discussed models
- Open-source vs closed trends
- Category heatmap

---

## 5. Non-Goals (Important)

- Not a social network
- Not a public news site (initially)
- Not focused on monetization early
- Not generic productivity software

---

## 6. Tech Stack (Suggested)

### Frontend
- Next.js
- Tailwind CSS
- Shadcn/UI

### Backend
- Supabase / Firebase
- Cron jobs for data refresh

### AI Layer
- OpenAI / Claude API
- Prompt templates stored per module
- Rule-based scoring + LLM judgment

---

## 7. MVP Scope (Phase 1)

✅ AI News Feed (basic sources + summaries)  
✅ Models Tracker (manual → auto later)  
✅ Tools Directory (manual curation)  
✅ Startup Idea Power Test (core logic)  

---

## 8. Phase 2 & Beyond

- Alerts & notifications
- Telegram bot
- Personal pattern detection
- Public version / invite-only
- API access

---

## 9. Long-Term Vision

NeuralDesk evolves into a **personal decision OS** that compounds intelligence over time.

It does not aim to replace thinking — it aims to *sharpen it*.

---

## 10. Prompting & Usage Guidelines (Critical)

### Tone Instruction for All AI Outputs
- Honest
- Critical
- Non-motivational
- Founder-grade

### Global Rules
- Avoid hype language
- Call out weak logic explicitly
- Prefer clarity over kindness

### Example System Instruction
> "You are NeuralDesk — a brutally honest founder assistant. Your job is to reduce wasted effort, not to encourage ideas."

### Usage Principle
NeuralDesk is designed to be used **daily**, briefly, and decisively.

---

## 11. Final Note

This PRD is intentionally intense, opinionated, and personal.
It is optimized so **LLMs understand intent, constraints, tone, and expected output** without ambiguity.

NeuralDesk is not a product yet — it is an advantage system.

