/* Portfolio data. One entry per system.
   state: live | built | archived  - drives the lamp, the filter and the counts.
   trigger: what actually fires it in production. null if nothing does.
   Each entry reads problem -> solution -> approach. */

const GROUPS = [
  {
    id: "ventures",
    label: "Ventures & client systems",
    note: "Products I own, and work delivered to paying or partner organisations.",
    items: [
      {
        name: "Vektor AI",
        role: "Founder — SaaS product",
        period: "Jan 2025 — present",
        state: "built",
        stateLabel: "Deployed · pre-revenue",
        trigger: "on ingest + scheduled agents",
        summary: "Document intelligence for private equity and alternative asset managers.",
        problem:
          "The bottleneck at the top of a private equity deal funnel is not judgement, it is reading. An analyst spends the first days of every opportunity manually working through hundreds of pages of investment documents to find the handful of facts that decide whether the deal is worth a second meeting. The work is slow, it does not scale with deal flow, and nothing learned on one deal is retrievable on the next.",
        solution:
          "A vertical document intelligence platform. Investment documents go in; structured, searchable investment signals come out, with the source passage attached to each one. Analysts search across every document the firm has ever processed rather than re-reading the one in front of them. Deployed backend, web interface, authentication and a messaging intake channel, all built solo.",
        approach:
          "Extraction is specialised to the vertical rather than generic, because a general-purpose summariser produces text that reads well and decides nothing. Retrieval is recency-aware, so a signal from a two-year-old filing is not weighted like one from last week. A layer of agents sits on top of the index rather than inside it, which keeps the retrieval core stable while the agent behaviour changes.",
        agents: [
          "Deal screening — reads investment documents and flags risks, gaps and items to verify",
          "Document summarisation — analyst-ready briefs from long-form deal material",
          "Pre-committee briefing — synthesises deal signals ahead of decision meetings",
          "Pipeline prioritisation — ranks active deals by urgency each week",
          "Market and competitive monitoring — tracks external signals against live deals",
          "Internal quality control — reviews and improves the system's own extraction behaviour"
        ],
        skills: [
          "Document ingestion pipelines", "PDF parsing and chunking", "Vector embedding",
          "Structured extraction from unstructured documents", "Semantic search",
          "Recency-aware retrieval", "Multi-agent system design", "API design",
          "Authentication", "Cloud deployment", "Solo full-stack SaaS delivery"
        ],
        stack: ["Python", "FastAPI", "PostgreSQL + pgvector", "Claude API", "Embeddings", "Railway"]
      },
      {
        name: "Vet Discharge Copilot",
        role: "Founder — live product",
        period: "2025 — present",
        state: "live",
        stateLabel: "Live",
        trigger: "cron 0 8 * * * · webhook on form submit",
        summary: "Autonomous client follow-up and lead capture for veterinary clinics.",
        problem:
          "Independent vet practices write discharge instructions by hand at the end of a consultation, when the vet is already behind. Owners get terse clinical notes they do not understand, ring the practice the next day to ask what it meant, and the follow-up that would have caught a problem early never happens because nobody has time to make it.",
        solution:
          "The vet enters case details and gets a plain-English care plan back in under thirty seconds, ready to review and send to the owner. Behind it, three agents run daily and handle the whole post-visit communication workflow. Landing page, application form, backend, agents and CRM are all live in production.",
        approach:
          "Nothing is typed into the CRM by hand: the form submission is the CRM entry, so the data cannot drift from reality. The vet reviews before anything reaches an owner, which keeps a clinician between the model and the animal. No personal data is stored beyond the API call, which was a design constraint rather than a later fix, and there is no server to run at all: it is a serverless worker, a static front end and a Notion workspace.",
        agents: [
          "Lead capture — form submission straight into the CRM, no manual entry",
          "Follow-up drafting — spots prospects gone quiet past 48 hours and drafts the next message",
          "Daily briefing — assembles pipeline state into one morning report"
        ],
        skills: [
          "Autonomous agent design", "Cron scheduling", "CRM automation",
          "Webhook pipeline construction", "Serverless backend development",
          "Notion API provisioning", "GDPR-conscious data handling"
        ],
        stack: ["Cloudflare Workers", "Claude API", "Notion API", "Netlify", "JavaScript", "WhatsApp"]
      },
      {
        name: "MSP Discovery & Monitoring Agent",
        role: "Consultant — client system",
        period: "2026",
        state: "live",
        stateLabel: "Live · in client use",
        trigger: "scheduled task, weekly",
        summary: "Prospect discovery for a UK post-quantum cryptography consultancy.",
        problem:
          "A consultancy that migrates managed service providers to quantum-safe cryptography needs to know which MSPs exist, which ones are large enough to be worth approaching, and which ones have just done something that makes the conversation timely. That intelligence is scattered across public procurement frameworks and trade press, and gathering it by hand is a full day a week that nobody has.",
        solution:
          "An agent that mines public-sector procurement frameworks to discover MSPs matching the target profile, enriches each one into a full organisation record, then monitors them for framework wins, acquisitions, contract awards and security incidents. Everything it finds is written straight into the live CRM the team already uses.",
        approach:
          "Organisation-level data only, deliberately, so no personal data is in scope and the GDPR question never has to be argued. The CRM is a shared spreadsheet on cloud storage, so writes are copy-on-read, backed up before every change and written atomically, because the failure mode of a half-written CRM is worse than no update at all. Outreach is drafted but never sent: a human sends every message. Targeting rules live in config, not code, so the client can retarget without me.",
        agents: [
          "Discovery — mines public procurement frameworks for MSPs matching the target profile",
          "Enrichment — builds the organisation record and fills the CRM columns",
          "Monitoring — watches for wins, M&A, contracts and incidents worth a conversation",
          "Competitor tracking — logs rival moves in the same market",
          "Outreach drafting — personalised drafts only; a human sends every one"
        ],
        skills: [
          "Public procurement data mining", "Entity deduplication and enrichment",
          "Config-driven agent design", "Safe concurrent spreadsheet writes",
          "Scheduled task deployment", "GDPR scoping", "Claude Code subagents and slash commands"
        ],
        stack: ["Python", "Claude API", "openpyxl", "YAML config", "Task Scheduler"]
      },
      {
        name: "Financial Planning Practice Website",
        role: "Designer & developer — client delivery",
        period: "2026",
        state: "live",
        stateLabel: "Live · delivered",
        trigger: "on publish (CMS webhook)",
        summary: "A full site for an FCA-regulated boutique financial planning practice, built to be self-edited.",
        problem:
          "A new practice was on a page builder she could not make look like her business, and every content change meant paying someone. She is FCA-regulated, so the copy carries disclosure obligations and cannot simply be edited freely; but she is also not technical, and a site she cannot update is a site that goes stale within a month.",
        solution:
          "A complete design and build: Next.js front end with a headless CMS behind it, so the pages she owns are hers to edit and publish, and a webhook revalidates the live site within seconds. Delivered with a written editing guide, a full-site PDF prepared for compliance review, and handover.",
        approach:
          "The split matters more than the stack: editable content is only the content she is allowed to change, while the regulated disclosures stay in version-controlled code where they cannot be edited by accident. Compliance was a build constraint, not a review step, so the GDPR cookie banner, the rate-limited and schema-validated contact form and the disclosure blocks were in from the start. Imagery is architectural rather than stock finance, which is what stops it reading like a bank.",
        agents: [
          "AI-assisted build loop — plan, build, design review, code review, ship",
          "Automated security and correctness review before each deploy"
        ],
        skills: [
          "Next.js and React application development", "Headless CMS architecture and client handover",
          "Design systems and motion design", "Form security (rate limiting, schema validation, honeypot)",
          "Transactional email via Microsoft Graph", "Regulatory and GDPR compliance in the build",
          "Non-technical client enablement", "Scoping, quoting and invoicing"
        ],
        stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind v4", "Sanity CMS", "Framer Motion", "Netlify"]
      },
      {
        name: "PE Knowledge Intelligence System",
        role: "Proof of concept — Nordic impact investor",
        period: "2026",
        state: "built",
        stateLabel: "POC · phase one complete",
        trigger: null,
        summary: "Ingestion, extraction and search over an investment firm's own document estate.",
        problem:
          "An investment team generates an enormous amount of written knowledge — diligence notes, memos, sector work — and then loses it. It sits in the folder of whoever wrote it. The firm pays for the same analysis twice because the second analyst has no way of knowing the first one already did it.",
        solution:
          "A system that ingests the firm's existing document estate, extracts the knowledge trapped inside it, and makes it searchable across the whole organisation rather than one analyst at a time. Phase one delivered the full ingestion and extraction backend with a search API and a demo interface on top.",
        approach:
          "Built as a reference implementation against a real firm's document types rather than a generic demo, because the extraction schema is the entire product and a schema designed against sample data is worthless. Separated ingestion, extraction and retrieval into independent services so the extraction logic can be revised without reprocessing the corpus from scratch.",
        agents: [
          "Ingestion and parsing pipeline",
          "Structured extraction service",
          "Semantic search API"
        ],
        skills: [
          "Backend service architecture", "Database migrations", "Schema design",
          "Retrieval API design", "Demo interface development", "POC scoping against a real firm"
        ],
        stack: ["Python", "FastAPI", "PostgreSQL", "Claude API", "HTML/CSS/JS"]
      },
      {
        name: "In-Spreadsheet GenAI Copilot",
        role: "Masters project with a global consultancy",
        period: "2025",
        state: "built",
        stateLabel: "Delivered",
        trigger: null,
        summary: "A generative AI assistant living inside Microsoft Excel, for a Nordic grocery retailer.",
        problem:
          "Retail analysts live in Excel. Any AI tool that asks them to leave it, paste data into a browser and paste results back is a tool they will use twice. On top of that, enterprise IT will not install a Python or Node runtime on a few thousand retail machines to make a productivity add-on work.",
        solution:
          "A task pane add-in inside Excel itself that queries, summarises and generates content from spreadsheet data in natural language, with no local runtime dependency at all.",
        approach:
          "The tool went to the users rather than the other way round. Building it on Office.js with a direct API call, and nothing else, is what made enterprise rollout plausible: deployment is a manifest, not a software installation. That single constraint drove every other technical decision in the project.",
        agents: [
          "In-spreadsheet query agent",
          "Data summarisation module"
        ],
        skills: [
          "Office.js development", "Excel add-in architecture", "Claude API integration",
          "Zero-dependency browser AI tooling", "Enterprise AI adoption constraints"
        ],
        stack: ["Office.js", "JavaScript", "Claude API", "Microsoft Excel"]
      },
      {
        name: "RFP Automation Business Case",
        role: "Case study — asset & wealth management consultancy",
        period: "2026",
        state: "built",
        stateLabel: "Delivered",
        trigger: null,
        summary: "The economics and architecture for an AI proposal-response system, costed cold.",
        problem:
          "A consultancy answers the same regulatory and operational questions in bid after bid, and rewrites them from scratch every time because nobody can find the last good answer. The obvious fix is a searchable response database with AI drafting on top. The hard part is not building it: it is proving to a panel that it is worth funding, when the honest answer might be that it is not.",
        solution:
          "A full investment case: a twelve-sheet financial model with every formula independently recomputed and verified, phased build costs separated from run costs, and a three-scenario decision frame in which the low case is an explicit recommendation to kill the project. Paired with a clickable prototype and an architecture spec.",
        approach:
          "Ask for the pilot only and leave the rest of the budget uncommitted, so the decision is reversible. Pick the hardest content domain for the pilot rather than the easiest, because that is the sharpest test of the one feature that matters — knowing when an answer has gone stale. Two of the pilot KPIs are safety gates rather than performance metrics. The architecture carries all five agentic design patterns plus a governance gate reviewed by two models from different lineages before anything leaves the boundary.",
        agents: [
          "Orchestrator with narrow-role workers on separate context windows",
          "Generator and evaluator reflection loop",
          "Independent governance gate: prompt injection, least privilege, data boundaries, audit trail"
        ],
        skills: [
          "AI business case modelling", "Sensitivity and scenario analysis",
          "Formula verification by independent recomputation", "Agentic architecture design",
          "AI governance and security review", "Executive presentation and defence"
        ],
        stack: ["Excel", "Python", "Claude", "Codex", "HTML prototype"]
      },
      {
        name: "Warehouse Operations Analyser",
        role: "Client project — Australian logistics business",
        period: "2024",
        state: "archived",
        stateLabel: "Delivered",
        trigger: null,
        summary: "Operational warehouse data in, actionable efficiency recommendations out.",
        problem:
          "A logistics business had years of operational warehouse data and no analyst. The inefficiencies were visible in the numbers and invisible to the people running the floor, who had neither the time nor the tooling to go looking for them.",
        solution:
          "An analysis tool that ingests operational data and surfaces specific, actionable efficiency recommendations, delivered as a finished product to a non-technical operations team.",
        approach:
          "The model was the easy part. The work was in the output format: recommendations had to arrive in the language of a warehouse floor, tied to a specific process, so the team could act on them without anyone translating first. An accurate recommendation nobody acts on has delivered nothing.",
        agents: ["Data ingestion module", "Analysis layer", "Recommendation formatter"],
        skills: [
          "Client-facing AI delivery", "Operational data analysis",
          "Non-technical stakeholder communication", "Domain-appropriate output formatting"
        ],
        stack: ["Python", "LLM API"]
      }
    ]
  },
  {
    id: "independent",
    label: "Independent systems",
    note: "Built for myself, to find out whether something would work. Several of them did.",
    items: [
      {
        name: "Equity Signal Trading Bot",
        role: "Personal project",
        period: "2025 — present",
        state: "live",
        stateLabel: "Live · paper trading",
        trigger: "market schedule, paper mode",
        summary: "Public regulatory filings synthesised into equity positions by a multi-model ensemble.",
        problem:
          "Insider transactions, institutional holdings and legislative disclosures are all public. They are also fragmented across separate filing systems, published on different lags, and individually close to useless. The signal, if there is one, is in the overlap, and no single filing feed shows you that.",
        solution:
          "A system that aggregates all three sources, synthesises the combined picture into equity position signals, and executes them. It runs in paper trading mode.",
        approach:
          "An ensemble of models rather than one, because a single model's read of a filing is a single opinion presented with unearned confidence, and disagreement between models is itself information. Paper mode is not a stalling tactic: the point is to establish whether the signal is real across enough resolved cases before any capital is exposed to it.",
        agents: ["Regulatory data ingestion", "Ensemble signal synthesis", "Position generation"],
        skills: [
          "Ensemble LLM architecture", "Financial data aggregation", "Regulatory API integration",
          "Signal synthesis", "Paper trading execution"
        ],
        stack: ["Python", "Alpaca API", "EDGAR (Form 4 & 13F)", "STOCK Act data", "Multi-model ensemble"]
      },
      {
        name: "Holiday Chain Validator",
        role: "Personal tool",
        period: "2026",
        state: "built",
        stateLabel: "Built",
        trigger: "on demand (CLI)",
        summary: "Trip planning that validates the whole chain, not the individual bookings.",
        problem:
          "Metasearch finds you a cheap flight, a cheap car and a cheap room, and no tool checks whether the three of them form a trip you can actually take. The flight lands after the hire desk closes. The room is an hour from the station. Every leg is valid and the itinerary is not. Ask a language model instead and it will confidently invent a departure time.",
        solution:
          "A command line tool that normalises true total cost across flights, accommodation, vehicle hire and rail including fees, validates that the chain connects end to end, and names which constraint is binding when nothing fits.",
        approach:
          "It loses to Skyscanner on flight search and always will, so it does not try to compete there: it is built as a chain validator, not a metasearch clone. The rule above every other rule is that it never invents a price, a listing or a departure time. Every figure carries its source, URL and fetch time or is labelled an estimate, and that is enforced structurally by schema validators and an output linter that fails the run, rather than by asking the model nicely in a prompt.",
        agents: [
          "Per-domain search agents across flights, stays, vehicles and rail",
          "Chain validator — checks the itinerary connects end to end",
          "Binding-constraint reporter — says what is actually blocking the trip",
          "Provenance linter — fails the run rather than shipping an unsourced number"
        ],
        skills: [
          "Structural anti-hallucination design", "Pydantic validation and output linting",
          "Provenance tracking", "True-total-cost normalisation", "Constraint solving",
          "CLI design", "Run artefact storage", "Test suite design"
        ],
        stack: ["Python", "Pydantic", "Claude Code skill", "CLI"]
      },
      {
        name: "Prediction Market Trading Bot",
        role: "Personal project",
        period: "2024 — 2025",
        state: "archived",
        stateLabel: "Archived",
        trigger: null,
        summary: "Mispriced contracts, Kelly-sized positions and a loop that learned from its own resolutions.",
        problem:
          "Prediction markets misprice contracts regularly, but spotting a mispricing is only a third of the problem. Betting the same stake on a marginal edge and an obvious one destroys the edge, and a bot with no memory of how its past calls resolved repeats the same error indefinitely.",
        solution:
          "A bot that scanned for mispriced contracts, sized each position with a probability-weighted formula rather than a flat stake, and fed resolved outcomes back into the next decision. Returned 47.1% ROI over its run. Retired and archived in April 2026.",
        approach:
          "Kelly Criterion sizing so that conviction and stake are tied together by arithmetic instead of instinct. Every trade logged with the reasoning that produced it, so that when the market resolved, the loop had something specific to learn from rather than a bare win or loss. The learning loop is the part that carried forward into later work.",
        agents: ["Market scanner", "Position sizing module", "Post-trade learning loop"],
        skills: [
          "Prediction market mechanics", "Kelly Criterion position sizing",
          "Self-improving agent design", "Post-trade outcome logging", "Autonomous decision systems"
        ],
        stack: ["Python", "Polymarket API", "Kalshi API"]
      },
      {
        name: "Intake & Triage Automation",
        role: "Internal system",
        period: "2025",
        state: "archived",
        stateLabel: "Superseded",
        trigger: null,
        summary: "Form in, urgency classified, response generated, delivered across channels with fallback.",
        problem:
          "Inbound enquiries arrive at all hours, and the urgent ones look exactly like the routine ones until somebody reads them. Waiting for a human to triage means the urgent ones wait too.",
        solution:
          "A pipeline that ingests form submissions, classifies urgency, generates a response, and delivers it across multiple channels with graceful fallback when one channel fails.",
        approach:
          "Three versions. The third exists because the first two taught me something: the managed workflow platform it was built on was introducing latency that silently blocked the AI API calls downstream — no error, just nothing. Diagnosing that and migrating off the platform was more of the work than building the pipeline, and it is the reason later systems run on infrastructure I control rather than a workflow builder.",
        agents: ["Emergency classifier", "Response generation step", "Multi-channel delivery router"],
        skills: [
          "Workflow automation", "Webhook payload parsing", "Triage logic",
          "Multi-channel delivery with fallback", "Production failure diagnosis", "Platform migration"
        ],
        stack: ["Webhooks", "Claude API", "SMTP", "n8n", "Custom runtime"]
      },
      {
        name: "Generative Media Commerce Pipeline",
        role: "Personal project",
        period: "2024 — 2025",
        state: "archived",
        stateLabel: "Archived",
        trigger: null,
        summary: "Prompt to product listing with no human step in between.",
        problem:
          "Generating a sellable image is one step of about six. The rest — writing a title that gets found, tagging it, describing it, listing it — is the part that actually takes the time, and it is the part everyone leaves manual.",
        solution:
          "A pipeline in which an orchestration agent drafts optimised image prompts, triggers generation, then routes finished assets straight to live product listings complete with title, tags and description. Nothing manual in the middle.",
        approach:
          "Treat the listing, not the image, as the unit of output. Once the finished listing is what the pipeline is judged on, prompt drafting and metadata generation stop being separate tools and become steps in one agent chain that either produces a live listing or does not.",
        agents: ["Prompt engineering agent", "Image generation trigger", "Listing publication agent"],
        skills: [
          "End-to-end agentic pipeline design", "Image prompt engineering",
          "Generative media optimisation", "Commerce API integration", "Asset routing"
        ],
        stack: ["Python", "Midjourney", "Etsy API"]
      },
      {
        name: "Morning Intelligence Agent",
        role: "Personal tool",
        period: "2024 — 2025",
        state: "archived",
        stateLabel: "Superseded",
        trigger: null,
        summary: "Calendar, email, weather, markets and an IPO watchlist, in one report before breakfast.",
        problem:
          "The information needed to start a day sensibly is spread across five apps, and checking all five every morning costs twenty minutes and delivers no synthesis — just five separate lists to hold in your head.",
        solution:
          "A briefing agent that aggregates calendar, email, weather, market data and a tracked IPO pipeline into a single structured morning report, generated on a daily schedule.",
        approach:
          "Each source is its own discrete agent step rather than one monolithic prompt. That meant a broken weather API never took the whole briefing down with it, and any single source could be swapped or added without rebuilding the pipeline. That modularity is the pattern that carried forward into everything I have built since.",
        agents: [
          "Calendar agent", "Email triage agent", "Market data agent",
          "IPO tracker agent", "Briefing synthesis agent"
        ],
        skills: [
          "Multi-source data aggregation", "Modular agent architecture",
          "Email and calendar API integration", "Market data handling", "Daily autonomous execution"
        ],
        stack: ["Python", "Google Calendar API", "Gmail API", "Market data APIs"]
      }
    ]
  }
];

const STACK = [
  ["LLM & AI APIs", "Anthropic Claude API, OpenAI API, Google Gemini, multi-model ensembles"],
  ["Agent tooling", "Claude Code (skills, subagents, slash commands, MCP), Codex, n8n, Openclaw, Hermes"],
  ["Languages", "Python, JavaScript, TypeScript"],
  ["Backend & serverless", "Cloudflare Workers, FastAPI, Node.js, Railway"],
  ["Frontend", "Next.js 16, React 19, Tailwind v4, Framer Motion, HTML/CSS/JS"],
  ["Data & retrieval", "PostgreSQL, pgvector, vector embeddings, semantic search, recency-weighted ranking"],
  ["Hosting & CMS", "Netlify, Vercel, Sanity CMS, GitHub Pages"],
  ["Automation & comms", "Webhooks, cron, WhatsApp API, Microsoft Graph, SMTP, Gmail and Calendar APIs, Tally"],
  ["Finance data", "Alpaca Markets, EDGAR (Form 4 and 13F), STOCK Act disclosures, Polymarket, Kalshi"],
  ["Enterprise & office", "Office.js, Excel add-ins, Notion API, Google Workspace, openpyxl"],
  ["Methods", "Multi-agent orchestration, reflection loops, ensemble design, Kelly sizing, provenance enforcement, prompt engineering"],
  ["Tools", "VS Code, Cursor, Git and GitHub, Obsidian"]
];
