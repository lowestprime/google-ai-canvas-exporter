# Execution Plans for this repository

Use an ExecPlan for complex userscript changes, browser behavior changes, selector migrations, markdown-export changes, and multi-step debugging.

An ExecPlan must be self-contained and must include:

1. Purpose
   - What user-visible problem is being solved.
   - What behavior should be observable after the change.

2. Evidence read
   - Source files, logs, screenshots, examples, fixtures, and prior versions examined.
   - Specific selectors/functions involved.

3. Current behavior
   - Reproduction steps.
   - Why the current code behaves incorrectly.

4. Target behavior
   - Exact desired UI, detection, export, and formatting behavior.

5. Implementation plan
   - Files to edit.
   - New helper functions.
   - Functions to replace or remove.
   - Compatibility and rollback considerations.

6. Validation plan
   - Automated tests.
   - Fixture tests.
   - Browser/manual tests.
   - Performance checks.

7. Progress log
   - Timestamped checkpoints.
   - Decisions made.
   - Blockers and resolutions.

During implementation, keep the ExecPlan updated. Do not stop after writing a plan unless the user explicitly asks to approve it first. When coding starts, proceed milestone by milestone, test after each meaningful change, and update the progress log.