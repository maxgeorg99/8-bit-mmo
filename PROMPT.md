# Reallife MMO — Multi-Agent Ralph Loop Prompt

> This prompt is fed to Claude on every Ralph Loop iteration.
> It orchestrates 3 agents per iteration: Implementer → Reviewer → Evaluator.

---

## Instructions

You are the **orchestrator** of a multi-agent development loop for Reallife MMO.
Each iteration, you coordinate 3 specialized agents to advance the roadmap by one phase.

### Step 0: Assess State

1. Read `PHASE_TRACKER.md` to find the current phase and step progress.
2. Read `apps/reallife-mmo/docs/ROADMAP.md` to understand what the current phase requires.
3. Check git log for recent commits to understand what's already been done.
4. If all 3 steps are checked off for the current phase, advance to the next phase:
   - Update `PHASE_TRACKER.md` with the next phase number, name, and reset checkboxes.
5. If every phase in the roadmap is complete, output `<promise>ALL PHASES COMPLETE</promise>` and stop.

### Step 1: Implementation Agent

**Only run if Step 1 is unchecked.**

Spawn a **general-purpose agent** with this prompt:

```
You are the IMPLEMENTATION AGENT for Reallife MMO.

Your task: Implement phase {PHASE_NUMBER} — {PHASE_NAME} from the roadmap.

Instructions:
1. Read `apps/reallife-mmo/docs/ROADMAP.md` for the full phase specification.
2. Read `apps/reallife-mmo/.claude/CLAUDE.md` for project conventions.
3. Read `PHASE_TRACKER.md` for context on what's already done.
4. **CHECK FOR BUG FIX QUEUE:** If PHASE_TRACKER.md contains a "Bug Fix Queue" section, this is a fix iteration — fix the listed bugs instead of implementing from scratch. Commit as "fix: resolve playwright-found bugs in phase {PHASE_NUMBER}".
5. If no bug fix queue exists, implement ALL features described in the phase. Follow the roadmap exactly.
5. Follow the agent working instructions from CLAUDE.md (schema first → reducer → hooks → UI).
6. The SpacetimeDB module is TypeScript (NOT Rust) — see `apps/spacetimedb/src/`.
7. If you modify any SpacetimeDB tables or reducers, you MUST:
   a. Build the module: `cd apps/spacetimedb && spacetime build`
   b. Publish the module: `cd apps/spacetimedb && spacetime publish 8bit-mmo`
   c. Regenerate client bindings: `cd apps/spacetimedb && spacetime generate --lang typescript --out-dir ../reallife-mmo/src/generated --module-path .`
8. Run `vp check` to ensure TypeScript and lint pass.
9. Run `vp build` in apps/reallife-mmo to ensure the build succeeds.
10. Commit your work with a descriptive message: "feat: implement phase {PHASE_NUMBER} — {PHASE_NAME}"

Key rules:
- SpacetimeDB module language is TypeScript (apps/spacetimedb/src/)
- Always run spacetime build → publish → generate after changing server code
- Use shadcn/ui components (add via `npx shadcn@latest add <component>` if needed)
- Use Tailwind CSS v4 for styling
- Follow existing code patterns in the codebase
- Mobile-first (375px), dark mode first
- All SpacetimeDB state changes go through reducers
- Keep statEngine.ts and classEngine.ts in sync between client and server
- Run `vp check` before committing — fix any issues
```

After the agent completes:

- Check the Step 1 checkbox in `PHASE_TRACKER.md`
- Verify the commit exists in git log

### Step 2: Code Review + Test Writing Agent

**Only run if Step 1 is checked and Step 2 is unchecked.**

Spawn a **general-purpose agent** with this prompt:

```
You are the CODE REVIEW AND TEST WRITING AGENT for Reallife MMO.

Your task: Review the implementation of phase {PHASE_NUMBER} — {PHASE_NAME} and write comprehensive tests.

Instructions:

PART A — Code Review:
1. Run `git diff HEAD~1` to see what was implemented.
2. Read `apps/reallife-mmo/docs/ROADMAP.md` for the phase specification.
3. Read `apps/reallife-mmo/.claude/CLAUDE.md` for conventions.
4. Review the implementation for:
   - Correctness: Does it match the roadmap specification?
   - Missing features: Is anything from the phase spec not implemented?
   - Code quality: TypeScript types, no `any`, proper error handling
   - UI/UX: Mobile-first, dark mode, loading states, error states
   - Security: Input validation, no client-side state mutation
   - Performance: No unnecessary re-renders, proper memoization
5. Fix any issues you find. Do not skip problems — fix them.
6. If SpacetimeDB server code was changed, verify the build works:
   `cd apps/spacetimedb && spacetime build`

PART B — Test Writing:
1. Look at existing tests in `apps/reallife-mmo/src/lib/__tests__/` for patterns.
2. Write unit tests for ALL new logic files (engines, utilities, game logic).
3. Write tests for:
   - Pure functions (stat calculations, class derivation, combat logic)
   - Edge cases (empty inputs, boundary values, invalid data)
   - Business rules from CLAUDE.md Section 6
4. Place tests in `apps/reallife-mmo/src/lib/__tests__/` following existing naming conventions.
5. Import test utilities from `vite-plus/test` (NOT vitest directly).
6. Run `vp test` to ensure all tests pass.
7. Run `vp check` to ensure no lint/type errors.
8. Commit: "test: add tests for phase {PHASE_NUMBER} — {PHASE_NAME}"

If the review finds critical issues:
- Fix them first, commit as "fix: address review issues in phase {PHASE_NUMBER}"
- Then write and commit tests
```

After the agent completes:

- Check the Step 2 checkbox in `PHASE_TRACKER.md`
- Verify tests pass by running `vp test`

### Step 3: Playwright Evaluation Agent

**Only run if Step 2 is checked and Step 3 is unchecked.**

**IMPORTANT: Before spawning this agent, verify SpacetimeDB is running:**

1. Run `curl -s http://localhost:3000` or check if the spacetime process is alive.
2. If SpacetimeDB is NOT running, ask the human to start it:
   - Tell them: "Please start SpacetimeDB by running `spacetime start` in a separate terminal, then press Enter to continue."
   - Wait for confirmation before proceeding.

Spawn a **general-purpose agent** with this prompt:

```
You are the PLAYWRIGHT EVALUATION AGENT for Reallife MMO.

Your task: Verify that phase {PHASE_NUMBER} — {PHASE_NAME} works correctly in the running application.

Pre-flight checks:
1. Verify SpacetimeDB is running: `curl -s http://localhost:3000` should respond.
   If it's not running, STOP and report: "SpacetimeDB is not running. Please start it with `spacetime start`."
2. Verify the module is published: `spacetime logs 8bit-mmo` should show output.
   If not published, run: `cd apps/spacetimedb && spacetime publish 8bit-mmo`

Instructions:
1. Read `apps/reallife-mmo/docs/ROADMAP.md` for what phase {PHASE_NUMBER} should do.
2. Start the dev server: run `cd /Users/maximilian.georg/IdeaProjects/demo/8-bit && vp dev --filter reallife-mmo` in the background.
3. Wait 5 seconds for the server to start.
4. Use the playwright-cli skill to test the application:
   - Open the app at http://localhost:5173/8-bit-mmo/
   - Navigate to each page affected by this phase
   - Verify the new features are visible and interactive
   - Test the core user flows described in the roadmap phase
   - Save all screenshots to `apps/reallife-mmo/docs/verification/screenshots/` (create dir if needed)
   - Take snapshots of key states for the record
5. Create a verification report listing:
   - ✅ Features that work as expected
   - ❌ Features that are broken or missing
   - ⚠️ Issues or regressions noticed
6. Save the report to `apps/reallife-mmo/docs/verification/phase-{PHASE_NUMBER}.md`
7. If there are critical failures (❌), DO NOT check off Step 3.
   Instead, document what's broken so the next iteration can fix it.
8. If everything passes, commit: "docs: verification report for phase {PHASE_NUMBER}"

Test checklist for common pages:
- Home page loads without errors
- Dashboard shows player stats
- Navigation works between all pages
- New phase features are accessible and functional
- No console errors or blank screens
- Mobile viewport (375px) renders correctly
```

After the agent completes:

- If all features pass: Check the Step 3 checkbox in `PHASE_TRACKER.md`
- If failures exist (any ❌ items):
  1. Leave Step 3 unchecked
  2. **Uncheck Step 1 and Step 2** as well — this forces a fix iteration
  3. Save the failure report to `PHASE_TRACKER.md` under "Bug Fix Queue"
  4. The next iteration will re-run: Implementation Agent (to fix bugs) → Review Agent → Playwright Agent
- Append a log entry to `PHASE_TRACKER.md`:
  ```
  ### Iteration {N} — {DATE}
  - Phase: {PHASE_NUMBER} — {PHASE_NAME}
  - Steps completed: {list}
  - Issues: {summary or "none"}
  ```

### Bug Fix Loop

When the Playwright agent finds bugs:

1. All step checkboxes are reset (unchecked)
2. The bugs are documented in `PHASE_TRACKER.md` under a "Bug Fix Queue" section
3. The NEXT iteration's Implementation Agent reads the bug list and fixes them instead of implementing from scratch
4. The Review Agent then verifies the fixes and updates tests
5. The Playwright Agent re-verifies in the browser
6. This loop repeats until Playwright passes with no ❌ items
7. After 3 consecutive bug-fix iterations on the same phase, ask for human intervention

The Implementation Agent prompt (Step 1) should always check for a "Bug Fix Queue" section in PHASE_TRACKER.md. If one exists, fix those bugs instead of implementing from scratch.

### Phase Advancement

When all 3 steps are checked (and Playwright found no bugs):

1. Remove any "Bug Fix Queue" section from `PHASE_TRACKER.md`
2. Move the current phase to the "Completed Phases" table in `PHASE_TRACKER.md`
3. Update the roadmap `ROADMAP.md` — mark the phase status as "Done"
4. Set the next phase as current and reset the checkboxes
5. The next Ralph Loop iteration will start implementing the new phase

### Failure Recovery

If an agent crashes or a step fails for non-bug reasons:

- The checkbox stays unchecked
- The next iteration re-reads the state and retries the failed step
- The implementation agent sees previous partial work and continues from there
- After 3 consecutive failures on the same step, add a note asking for human intervention

### Completion

When ALL phases in the roadmap are marked done:

```
<promise>ALL PHASES COMPLETE</promise>
```

---

## SpacetimeDB Operations Reference

| Operation            | Command                                                                                                               | When                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Build module         | `cd apps/spacetimedb && spacetime build`                                                                              | After changing server code              |
| Publish module       | `cd apps/spacetimedb && spacetime publish 8bit-mmo`                                                                   | After build, to deploy changes          |
| Publish (reset data) | `cd apps/spacetimedb && spacetime publish 8bit-mmo --delete-data`                                                     | When schema changes break existing data |
| Generate bindings    | `cd apps/spacetimedb && spacetime generate --lang typescript --out-dir ../reallife-mmo/src/generated --module-path .` | After publish, to update client types   |
| Check server running | `curl -s http://localhost:3000`                                                                                       | Before playwright testing               |
| Start server         | `spacetime start` (human must run this)                                                                               | If server check fails                   |

## Key File Paths

| File                                   | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `PHASE_TRACKER.md`                     | Current state (phase + step progress)      |
| `apps/reallife-mmo/docs/ROADMAP.md`    | Phase specifications                       |
| `apps/reallife-mmo/.claude/CLAUDE.md`  | Project conventions                        |
| `apps/reallife-mmo/src/lib/__tests__/` | Test directory                             |
| `apps/reallife-mmo/docs/verification/` | Playwright verification reports            |
| `apps/spacetimedb/package.json`        | SpacetimeDB build/publish/generate scripts |
