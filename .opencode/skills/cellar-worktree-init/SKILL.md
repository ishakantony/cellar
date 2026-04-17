---
name: cellar-worktree-init
description: To ensure worktree is ready for development
---

## What I do

Check if the current directory is part of a worktree.
If current directory is not part of a worktree then tell user this skill doesn't do anything.

Look for the main repo location by executing command `git worktree list --porcelain | head -1 | awk '{print $2}'`, the result of this command will be known as $MAIN_REPO_LOCATION.

copy .env from $MAIN_REPO_LOCATION to current directory if .env doesn't exist in current directory.

run `npm install` in current directory if node_modules doesn't exist in current directory.

Skill is completed after above steps are done, tell user that the worktree is ready for development.

## When to use me

Use this when user want sto check if the current directory is ready for development and it is a worktree.
