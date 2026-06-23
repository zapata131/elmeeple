---
name: github_issue_solve
description: "Automated workflow for analyzing a GitHub issue, assigning the assignee, setting up the feature branch, planning the TDD execution, and commenting the plan on the issue."
---

# GitHub Issue Solve Skill: Backlog Initialization and Branching

This skill is automatically loaded to guide the **Architect** and **Builder** through the initialization phase of resolving a GitHub issue. It enforces backlog hygiene, automated branch isolation, and TDD planning.

---

## 1. Trigger
Use this skill whenever the user requests to:
*   "Work on issue #X" or "solve issue #X"
*   "Create a new feature for Y" or "fix bug Z" (in which case a GitHub issue must be created first!)

---

## 2. Step-by-Step Workflow

### Step 2.1: Issue Identification and Analysis
1.  **Identify the Issue Number (`$ISSUE_NUMBER`)**:
    *   If the user did not provide an issue number, use the `gh` CLI to search for matching issues, or create a new issue first using:
        ```bash
        gh issue create --title "feature/bug description" --body "Como [Rol], Quiero [Funcionalidad], Para [Beneficio]" --label "enhancement"
        ```
    *   Once the issue number is established, assign it to `$ISSUE_NUMBER`.
2.  **Fetch Issue Details**: Run the command to inspect the issue body and title:
    ```bash
    gh issue view $ISSUE_NUMBER
    ```
3.  **Validate the Agile User Story**:
    *   Verify that the issue body contains a clear User Story using the framework: `Como [Rol], Quiero [Funcionalidad], Para [Beneficio]`.
    *   If it is missing, edit the issue to add a high-value User Story before writing code.
4.  **Self-Assign the Issue**: Link yourself as the assignee to indicate active work:
    ```bash
    gh issue edit $ISSUE_NUMBER --add-assignee "@me"
    ```

### Step 2.2: Branch Isolation
1.  **Sync Workspace with Remote Main**:
    *   `git checkout main`
    *   `git pull origin main`
2.  **Formulate the Branch Name**:
    *   Branch format: `feature/issue-$ISSUE_NUMBER-$SHORT_TITLE` (for features) or `fix/issue-$ISSUE_NUMBER-$SHORT_TITLE` (for bugs).
    *   Convert the issue title to a brief, lowercase, kebab-case string (e.g., `feature/issue-37-onboarding-session-prefill`).
3.  **Checkout the Feature Branch**:
    *   Verify if the branch already exists locally: `git branch --list "*issue-$ISSUE_NUMBER*"`
    *   If it exists, check it out: `git checkout [branch-name]`
    *   If not, create and switch to it: `git checkout -b feature/issue-$ISSUE_NUMBER-$SHORT_TITLE`

### Step 2.3: TDD Planning and Issue Commenting
1.  **Research the Codebase**: Map the affected files and dependencies using codebase tools.
2.  **Formulate a Step-by-Step Plan**: Outline a plan that prioritizes **strict Test-Driven Development (TDD)**:
    *   Define the exact Jest or Playwright tests that will be written *first*.
    *   Specify the implementation files to create or modify.
    *   Include post-flight documentation updates (`HANDOFF.md`, `DESIGN.md`).
3.  **Publish the Plan on GitHub**: Post the plan as a comment on the issue to establish full backlog traceability:
    ```bash
    gh issue comment $ISSUE_NUMBER --body "### 🚀 Plan de ejecución (TDD)
    * **Rama:** \`feature/issue-$ISSUE_NUMBER-$SHORT_TITLE\`
    * **Pruebas (TDD):** [Lista de pruebas a escribir primero]
    * **Implementación:** [Lista de archivos a modificar]"
    ```
