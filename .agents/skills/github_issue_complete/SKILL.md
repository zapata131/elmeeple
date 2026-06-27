---
name: github_issue_complete
description: "Automated workflow for validating the codebase via unit and E2E tests, committing, pushing, opening a Pull Request linking the issue, updating handoffs, and merging into main."
---

# GitHub Issue Complete Skill: Verification, PR Creation, and Merging

This skill is automatically loaded to guide the **Builder** and **Reviewer** through the completion phase of a feature or bug fix. It enforces our three-tier testing standards, documentation synchronization, and Pull Request automation.

---

## 1. Trigger
Use this skill whenever:
*   The implementation is complete and ready for QA review.
*   You want to open a Pull Request and merge the branch into `main`.

---

## 2. Step-by-Step Workflow

### Step 2.1: Three-Tier Verification Gate
Before committing any code, you must execute and pass the following quality gates:
1.  **Unit & Integration Tests**: Run Jest to verify all components and server actions pass:
    ```bash
    npm run test
    ```
2.  **Linter & Type Checks**: Ensure there are no code style or compilation errors:
    ```bash
    npm run lint
    ```
3.  **System & E2E Walkthroughs (Visual QA)**:
    *   Run the unified walkthrough test runner to automatically verify all main features on both **Desktop (1280x800)** and **Mobile (390x844)** viewports:
        ```bash
        ./scripts/test-all-features.sh
        ```
    *   Verify that the browser console is completely free of runtime errors, Leaflet image 404s, or NextAuth context warnings.

### Step 2.2: Documentation Synchronization (Mandatory Post-Flight)
You must keep our technical documentation updated in real-time. Ensure the following files are synchronized:
1.  **[HANDOFF.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/HANDOFF.md)**: Update the sprint memo with completed files, active branch, test status, and clear next steps.
2.  **[DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/DESIGN.md)**: Document any architectural changes, schema additions, visual tokens, or technical design decisions.
3.  **[AGENTS.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple/AGENTS.md)**: Record any new development conventions, AI personas, or engineering learnings.

### Step 2.3: Stage, Commit, and Push
1.  **Stage All Changes**: Include code, tests, and updated documentation:
    ```bash
    git add .
    ```
2.  **Formulate a Google-Style Commit Message**:
    *   Use sentence case, active voice, and second person where applicable.
    *   Include the issue number in the commit footer.
    *   Example commit message:
        ```
        refactor: simplify onboarding step 1 and pre-fill details from session

        Closes #37. Aligns step 1 with the authenticated onboarding flow, removing redundant typing, and updating unit tests.
        ```
    *   Commit the code:
        ```bash
        git commit -m "refactor: simplify onboarding step 1 and pre-fill details from session (closes #37)"
        ```
3.  **Push to Remote**: Push the branch to the origin repository:
    ```bash
    git push origin [current-branch-name]
    ```

### Step 2.4: Pull Request Automation
1.  **Create the Pull Request**: Use the `gh` CLI to open a Pull Request against `main`:
    ```bash
    gh pr create --title "feat: brief title matching style guide" --body "### Descripcion
    Resolves #$ISSUE_NUMBER. Briefly describe what this PR changes.

    ### Pruebas realizadas
    * Unit tests (Jest): 100% green.
    * E2E walkthrough (Playwright): Verified on Desktop and Mobile viewports.
    * Screen recordings/screenshots captured in artifacts."
    ```
2.  **Comment on the GitHub Issue**: Update the issue thread to link the PR and notify stakeholders.

### Step 2.5: Merging into Main
Once the Pull Request is approved by the **Reviewer**:
1.  **Checkout and Pull Main**:
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Merge the Feature Branch**:
    ```bash
    git merge [feature-branch-name]
    ```
3.  **Push to Remote Main**:
    ```bash
    git push origin main
    ```
4.  **Cleanup Local Branch**:
    ```bash
    git branch -d [feature-branch-name]
    ```
