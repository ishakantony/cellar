---
name: cellar-ensure-stability
description: Ensure stability of the codebase by doing checks on everything
---

## What I do

- Run `npm run check:all`
- Analyze the results and provide feedback on any issues found
- Ask user if they want to fix the issues or ignore them
- If user wants to fix the issues, fix them and provide feedback on the changes made, run `npm run check:all` again to ensure all issues are resolved
- If user wants to ignore the issues, provide feedback on the potential risks

DO NOT EVER do git commit unless user explicitly asks you to do so, even if you have fixed the issues. Always ask user for confirmation before committing any changes.

## When to use me

Use this when user wants to ensure stability of the codebase
