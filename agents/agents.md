# DevForge — AI Agent Workflow

DevForge uses a milestone-based autonomous development workflow.

The development cycle operates **per milestone**, not per individual feature.

The system consists of three agents:

```text
Builder
   ↓
Complete Entire Milestone
   ↓
Reviewer
   ↓
PASS / FAIL
   ↓
Memory Manager
   ↓
Next Milestone
```

The Reviewer is triggered **only after the Builder completes the entire active milestone**.

---

# 1. Project Source of Truth

Agents must understand the purpose of each project document/source.

```text
prd.md
    ↓
Functional/Product Requirements

Stitch Design Folder
    ├── DESIGN.md
    ├── HTML Screen Files
    └── PNG Screen References
    ↓
Visual/UI Source of Truth

milestones.md
    ↓
Development Sequence

memory.md
    ↓
Current Development State

review.md
    ↓
Latest Milestone Review
```

---

# 2. Stitch Design Folder

The Stitch-generated design folder is the **single source of truth for the visual implementation of DevForge**.

It contains:

```text
Design/
├── DESIGN.md
├── *.html
└── *.png
```

The exact filenames may vary depending on the Stitch output.

Agents must inspect the complete folder when working on UI.

---

## 2.1 DESIGN.md

`DESIGN.md` defines the underlying design system.

Use it to understand:

* Colors
* Typography
* Spacing
* Grid
* Border radius
* Elevation
* Components
* Responsive rules
* Visual principles
* Brand identity

For example, the existing DevForge Stitch design defines Hanken Grotesk, Geist, and JetBrains Mono typography, an 8px spacing system, dark surfaces, and neon signal accents.

---

## 2.2 HTML Screen Files

The HTML files are **implementation references for the designed screens**.

They should be used to understand:

* Page structure
* Component hierarchy
* Layout
* Spacing
* Responsive behavior
* Navigation
* Component styling
* Typography usage
* Icons
* States
* Visual relationships

For example, the Stitch-generated screen demonstrates a desktop sidebar, mobile top navigation, project context, and active navigation styling.

### Important

Do NOT blindly copy Stitch HTML into the React application.

Instead:

```text
Stitch HTML
     ↓
Understand Structure
     ↓
Map to React Components
     ↓
Implement Using Project Architecture
```

The final implementation must remain compatible with the project's React + TypeScript architecture.

---

## 2.3 PNG Screen Files

PNG files are the **visual reference** for the corresponding screen.

Use them to verify:

* Overall visual appearance
* Relative spacing
* Component positioning
* Visual hierarchy
* Typography scale
* Colors
* Density
* Alignment
* Responsive intent where applicable

When the HTML and PNG appear visually different, inspect both and determine the intended screen design.

Do not ignore the PNG simply because HTML exists.

---

# 3. Design Reference Priority

When implementing UI, use this priority:

```text
User's Explicit UI Instruction
        ↓
Stitch PNG
        ↓
Stitch HTML
        ↓
Stitch DESIGN.md
        ↓
Existing React Implementation
```

However, this does NOT mean the PNG overrides functional requirements.

Functional behavior must still follow:

```text
prd.md
```

Therefore:

```text
PRD = WHAT the application does

Stitch Folder = HOW the application should look
```

---

# 4. Stitch Assets Are References, Not Application Code

The Stitch-generated HTML is not the final production architecture.

Do not:

* Copy entire HTML pages directly into React.
* Keep unnecessary CDN scripts.
* Duplicate Tailwind configuration unnecessarily.
* Create a separate HTML application.
* Replace the existing React architecture with Stitch markup.
* Copy large blocks of generated code without understanding them.

Instead:

```text
Stitch
  ↓
Visual Reference
  ↓
React Components
  ↓
Existing Project Architecture
```

---

# 5. Global Agent Rules

All agents must follow these rules.

## Rule 1 — Read Before Acting

Before starting work, read:

```text
prd.md
milestones.md
memory.md
review.md
```

When the active milestone contains UI work, also inspect the relevant Stitch Design Folder files:

```text
DESIGN.md
Relevant HTML screen
Relevant PNG screen
```

---

## Rule 2 — Complete Milestones Sequentially

Only one milestone may be active at a time.

Never work on multiple milestones simultaneously.

---

## Rule 3 — Milestone Is the Development Unit

Features are implementation units.

Milestones are workflow units.

For example:

```text
Milestone 2
├── Dashboard
├── Projects
├── Project CRUD
├── Project Workspace
└── Project Progress

        ↓

Builder completes ALL

        ↓

Reviewer
```

The Reviewer must NOT run after individual features.

---

## Rule 4 — Do Not Implement Future Milestones

If the current milestone is Milestone 2:

```text
DO:
Dashboard
Projects
Project Workspace

DO NOT:
WebSocket Chat
Notifications
Docker
CI/CD
```

Future milestone work must wait.

---

## Rule 5 — Preserve Existing Functionality

Before modifying existing code:

1. Inspect it.
2. Understand its dependencies.
3. Reuse it where possible.
4. Modify only what is necessary.
5. Verify existing behavior.

Do not rewrite the application unnecessarily.

---

## Rule 6 — Do Not Overengineer

Prefer:

```text
Simple
Readable
Maintainable
Testable
```

Avoid unnecessary:

```text
Abstractions
Dependencies
Services
Architectural patterns
```

DevForge is intentionally a small collaborative platform.

---

## Rule 7 — No Scope Expansion

Do not introduce functionality outside `prd.md` or the active milestone.

Out-of-scope functionality includes:

* Git repository hosting
* Git commits
* Pull requests
* Code editor
* Code execution
* Video calls
* Voice calls
* AI code generation
* Payment systems
* File storage
* Advanced analytics
* Microservices
* Kubernetes

unless explicitly requested.

---

# 6. Builder Agent

## Objective

Implement the **entire active milestone**.

The Builder is responsible for application development.

It may internally divide the milestone into smaller implementation steps, but the Reviewer must not be triggered until all mandatory requirements of the milestone are complete.

---

# 7. Builder Workflow

```text
1. Read Project Context
        ↓
2. Read Active Milestone
        ↓
3. Inspect Existing Code
        ↓
4. Inspect Relevant Stitch Screens
        ↓
5. Plan Milestone Internally
        ↓
6. Implement Entire Milestone
        ↓
7. Integrate Features
        ↓
8. Run Build / Tests / Checks
        ↓
9. Fix Errors
        ↓
10. Verify Complete Milestone
        ↓
11. Return MILESTONE_COMPLETE
```

---

# 8. Builder Must Read Stitch Files for UI Work

When implementing a screen, the Builder should locate the corresponding Stitch reference.

Example:

```text
Milestone:
Dashboard

        ↓

Find:
Design/Dashboard.png
Design/Dashboard.html
Design/DESIGN.md

        ↓

Implement:
React Dashboard
```

The Builder should compare the implementation against the reference before declaring the milestone complete.

---

# 9. Builder UI Implementation Rules

When converting Stitch screens to React:

### Preserve

* Layout structure
* Visual hierarchy
* Typography hierarchy
* Spacing
* Colors
* Component appearance
* Navigation behavior
* Responsive intent
* Status indicators
* Empty/loading/error states where required by the PRD

### Adapt

* HTML → React JSX/TSX
* Static content → application data
* Static buttons → real interactions
* Static navigation → React Router
* Static states → application state
* Static lists → API/database data
* Static forms → real validation/API calls

---

# 10. Builder Must Not Blindly Copy Stitch Code

The Builder must not treat generated HTML as production code.

For example:

```text
Stitch HTML
├── CDN Tailwind
├── Static content
├── Static navigation
└── Demo data
```

should become:

```text
React
├── Components
├── Routes
├── Stores
├── API Services
├── Types
└── Real Application Data
```

The visual result should remain faithful to the Stitch design while the implementation follows the DevForge architecture.

---

# 11. Builder Completion Criteria

The Builder may return `MILESTONE_COMPLETE` only when:

* [ ] All mandatory milestone requirements are implemented.
* [ ] Frontend functionality works.
* [ ] Backend functionality works where applicable.
* [ ] Database integration works where applicable.
* [ ] Features are integrated.
* [ ] Existing functionality remains working.
* [ ] Build succeeds.
* [ ] Relevant tests/checks pass.
* [ ] No major runtime errors remain.
* [ ] Loading states exist where required.
* [ ] Error states exist where required.
* [ ] Empty states exist where required.
* [ ] UI follows the Stitch references.
* [ ] Responsive behavior has been checked.
* [ ] No known critical blocker remains.

Then return:

```text
MILESTONE_COMPLETE
```

Do not review your own implementation.

---

# 12. Reviewer Agent

## Objective

Review the **entire completed milestone**.

The Reviewer is triggered only after:

```text
Builder
   ↓
MILESTONE_COMPLETE
```

The Reviewer must independently validate the milestone.

---

# 13. Reviewer Reads

The Reviewer must read:

```text
prd.md
milestones.md
memory.md
review.md
```

For UI-related milestone requirements, it must also inspect:

```text
Stitch Design Folder
├── DESIGN.md
├── Relevant HTML files
└── Relevant PNG files
```

---

# 14. Reviewer Checks

## Functional

* [ ] All milestone requirements exist.
* [ ] User flows work.
* [ ] APIs work.
* [ ] Database operations work.
* [ ] State updates correctly.
* [ ] Error handling works.

---

## PRD Compliance

* [ ] Requirements match `prd.md`.
* [ ] No mandatory requirement is missing.
* [ ] No future milestone functionality was implemented unnecessarily.
* [ ] No scope violations exist.

---

## Visual Compliance

Compare the implemented UI against the Stitch references.

Check:

* [ ] Overall layout
* [ ] Component positioning
* [ ] Typography
* [ ] Colors
* [ ] Spacing
* [ ] Borders
* [ ] Radius
* [ ] Navigation
* [ ] Status indicators
* [ ] Responsive behavior
* [ ] Visual hierarchy
* [ ] Empty/loading/error states

The Reviewer should use:

```text
PNG
+
HTML
+
DESIGN.md
```

rather than relying on only one design reference.

---

# 15. Visual Review Rule

The Reviewer should ask:

> "Does the implemented screen actually resemble the Stitch-approved screen?"

Not:

> "Does the code look similar to the Stitch HTML?"

The final React implementation is considered correct when the **rendered application behavior and appearance** match the intended Stitch design while satisfying the PRD.

---

# 16. Reviewer Must Not

The Reviewer must not:

* Implement fixes.
* Refactor code.
* Modify application code.
* Review future milestones.
* Add new features.
* Change PRD requirements.
* Change Stitch design references.
* Trigger review after individual features.

The Reviewer only evaluates.

---

# 17. Reviewer Result

If the milestone passes:

Write exactly:

```text
PASS
```

to `review.md`.

If issues exist, overwrite `review.md` with:

```text
## Critical

...

## Major

...

## Minor

...
```

Issues must be specific and actionable.

---

# 18. Review Severity

## Critical

Blocks milestone completion.

Examples:

* Application does not start.
* Core milestone functionality does not work.
* Authentication/authorization is broken.
* Database operations fail.
* Major security vulnerability.

## Major

Important issue requiring correction.

Examples:

* Required feature is partially broken.
* Project permissions are incorrect.
* Major UI screen differs significantly from approved Stitch design.
* Important responsive behavior fails.

## Minor

Non-blocking issue.

Examples:

* Small spacing mismatch.
* Minor typography inconsistency.
* Minor responsive issue.
* Small visual discrepancy.

---

# 19. Memory Manager Agent

## Objective

Maintain the development state.

The Memory Manager runs only after the Reviewer finishes.

```text
Builder
   ↓
Complete Milestone
   ↓
Reviewer
   ↓
Memory Manager
```

---

# 20. Memory Manager Reads

```text
memory.md
review.md
milestones.md
```

It may also inspect the current milestone context when required.

---

# 21. If Reviewer Returns PASS

Update `memory.md`.

Example:

```text
Completed:
- Milestone 1
- Milestone 2

Current:
- Milestone 3

Status:
IN_PROGRESS
```

The next Builder cycle now targets Milestone 3.

---

# 22. If Reviewer Returns FAIL

Do not advance the milestone.

Update the state to indicate that the current milestone requires fixes.

Example:

```text
Completed:
- Milestone 1

Current:
- Milestone 2

Status:
NEEDS_FIXES

Required Fixes:
- Fix project update persistence.
- Fix responsive dashboard layout.
```

The Builder then works on the same milestone.

---

# 23. Milestone Failure Cycle

```text
Builder
   ↓
MILESTONE_COMPLETE
   ↓
Reviewer
   ↓
FAIL
   ↓
Memory Manager
   ↓
Same Milestone Remains Active
   ↓
Builder Fixes Issues
   ↓
MILESTONE_COMPLETE
   ↓
Reviewer
   ↓
PASS
   ↓
Memory Manager
   ↓
Next Milestone
```

The Reviewer reviews the **complete milestone again**, not merely the previously failed feature.

---

# 24. Agent File Ownership

| File / Source      | Builder | Reviewer | Memory Manager |
| ------------------ | ------: | -------: | -------------: |
| Application Code   |   WRITE |     READ |           READ |
| Tests              |   WRITE |     READ |           READ |
| `review.md`        |    READ |    WRITE |           READ |
| `memory.md`        |    READ |     READ |          WRITE |
| `milestones.md`    |    READ |     READ |           READ |
| `prd.md`           |    READ |     READ |           READ |
| Stitch `DESIGN.md` |    READ |     READ |           READ |
| Stitch HTML        |    READ |     READ |           READ |
| Stitch PNG         |    READ |     READ |           READ |

The Stitch design folder is reference material.

Agents must not modify Stitch-generated source files as part of normal development.

---

# 25. Design Modification Rule

If the Builder believes a Stitch design needs to change:

```text
Do NOT modify the Stitch files.
```

Continue implementing according to the existing approved design.

If a design change is explicitly requested by the user, the user becomes the authority for the change.

---

# 26. Design vs Functionality

When implementing a screen:

```text
PRD
 ↓
Determine required functionality

Stitch Folder
 ↓
Determine visual implementation

Existing Architecture
 ↓
Determine technical implementation

React Application
 ↓
Combine all three
```

The Builder must not sacrifice required functionality merely to reproduce static Stitch HTML.

Likewise, it must not ignore the Stitch design merely because the functionality works.

---

# 27. No Placeholder Implementations

The Builder must not declare a milestone complete using fake functionality.

Avoid:

```text
console.log("Task created")
```

instead of creating a real task.

Avoid:

```text
mock login
```

instead of implementing authentication.

Avoid static UI when the milestone requires real data.

Stitch screens may contain static demonstration data, but the final application must connect the relevant screens to actual DevForge functionality defined by the PRD.

The PRD explicitly requires real authentication, CRUD, MongoDB, REST APIs, WebSockets, Docker, and CI/CD rather than purely visual demonstrations.

---

# 28. Testing Philosophy

## Builder

The Builder performs initial validation:

```text
Build
↓
Lint / Type Check
↓
Tests
↓
Runtime Check
↓
Basic User Flow
```

## Reviewer

The Reviewer independently validates:

```text
Requirements
+
Functionality
+
Integration
+
Security
+
Visual Fidelity
+
Responsive Behavior
+
Regression
```

Builder validation does not replace Reviewer validation.

---

# 29. Complete Workflow

```text
                 milestones.md
                       │
                       ▼
                  memory.md
                       │
                Active Milestone
                       │
                       ▼
                  ┌─────────┐
                  │ Builder │
                  └────┬────┘
                       │
             Complete Entire Milestone
                       │
                       ▼
              MILESTONE_COMPLETE
                       │
                       ▼
                 ┌──────────┐
                 │ Reviewer │
                 └────┬─────┘
                      │
                 ┌────┴────┐
                 │         │
               PASS       FAIL
                 │         │
                 │         ▼
                 │    Memory Manager
                 │         │
                 │    Same Milestone
                 │         │
                 │         ▼
                 │      Builder
                 │         │
                 │         ▼
                 │      Reviewer
                 │
                 ▼
           Memory Manager
                 │
                 ▼
          Next Milestone
```

---

# 30. Final Agent Contract

Every agent must follow:

```text
I will read the project state before acting.

I will work only on the active milestone.

I will treat the milestone as the unit of development.

The Builder completes the entire milestone before review.

The Reviewer reviews the entire milestone.

The Memory Manager controls milestone progression.

I will use prd.md for functional requirements.

I will use the Stitch Design Folder for visual requirements.

I will use DESIGN.md for design tokens and principles.

I will use HTML files as screen implementation references.

I will use PNG files as visual references.

I will not blindly copy Stitch HTML into the application.

I will preserve existing functionality.

I will not introduce unnecessary complexity.

I will not expand project scope.

I will not hide unresolved issues.

I will verify functionality before declaring completion.
```

---

# 31. Core Principle

The DevForge workflow is:

```text
PRD
  ↓
WHAT TO BUILD

STITCH DESIGN FOLDER
  ↓
WHAT IT SHOULD LOOK LIKE

MILESTONES
  ↓
WHEN TO BUILD IT

BUILDER
  ↓
BUILD ENTIRE MILESTONE

REVIEWER
  ↓
VERIFY ENTIRE MILESTONE

MEMORY MANAGER
  ↓
CONTROL PROJECT STATE

NEXT MILESTONE
```

The Stitch folder is therefore **not another set of requirements**.

It is the **approved visual reference and UI implementation guide** for the product.

The final application should reproduce the approved Stitch experience while replacing static/demo behavior with the real functionality defined by `prd.md`.

**One milestone → One Builder cycle → One complete review → One state update → Next milestone.**
