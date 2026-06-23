---
name: document_sync
description: "Automated workflow for auditing and synchronizing all three living documents (HANDOFF.md, DESIGN.md, and AGENTS.md) to ensure technical schemas, sprint progress, and AI persona rules never go stale."
---

# Document Sync Skill: Workspace Documentation Hygiene

This skill is automatically loaded to guide the **Architect**, **Builder**, and **Reviewer** through our mandatory post-flight documentation quality gate. It ensures that every code change is backed by matching, updated, and high-fidelity documentation.

---

## 1. Trigger
Use this skill:
*   At the end of every turn before responding to the user.
*   Before staging, committing, or opening a Pull Request (integrated as a core step in the `github_issue_complete` skill).

---

## 2. Step-by-Step Documentation Quality Gate

### Step 2.1: Sprint Progress Audit ([HANDOFF.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/HANDOFF.md))
The sprint handoff memo is our primary communication tool for session continuity. You must verify and update:
1.  **Active Branch**: Confirm the correct branch name is listed.
2.  **Completed Work**: List every file created or modified during the current turn, detailing exactly what was implemented.
3.  **Active Sprint Task**: Update the progress bar or task checklist.
4.  **Testing Status**: Record the test results (e.g. `npm run test: 100% green`).
5.  **Clear Next Steps**: Outline the precise, actionable tasks for the next agent or session.

### Step 2.2: Architectural and Brand Audit ([DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/DESIGN.md))
`DESIGN.md` is our single source of truth. You must immediately document:
1.  **Database Changes**: If you added or modified Supabase tables, columns, constraints, foreign keys, or Row Level Security (RLS) policies, you **must** codify the exact SQL/schema schema in the Database section of `DESIGN.md`.
2.  **API and Server Actions**: If you created new Next.js Server Actions or API routes, document their endpoints, parameters, and return signatures.
3.  **Visual Design Systems**: If you introduced a new page, component layout, or visual token (e.g., custom SVGs, sub-tabs), document their HSL/HEX color codes, typography scales, and responsive behaviors.

### Step 2.3: Conventions and Learnings Audit ([AGENTS.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/AGENTS.md))
`AGENTS.md` stores our team persona constraints and hard-learned engineering conventions. You must verify and append:
1.  **Lessons Learned**: If you resolved a complex bug, compilation error, or setup friction (e.g. Next.js hydration issues, JSDOM polyfill crashes, Webpack marker resolution errors), document it under **Section 7 (Core architectural conventions and lessons learned)**.
2.  **Persona Rule Adjustments**: If a role's responsibilities or system prompts need to be refined based on user feedback, update the corresponding agent persona section.

---

## 3. Enforcement Check
Before ending your turn, run a git status check to verify that all three documentation files are staged and committed alongside your implementation:
```bash
git status
```
*If any documentation file shows modified but unstaged, stage and commit it immediately before concluding the turn.*
