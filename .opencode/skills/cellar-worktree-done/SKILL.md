---
name: cellar-worktree-done
description: To do cleanup work, merge to original branch
---

## What I do

Run `git worktree list --porcelain | grep -m1 "^branch" | sed 's|branch refs/heads/||'` to find out the original branch.

If the current branch is different than original branch, means we need to merge it.

Do a merge to original branch, ONLY FAST FORWARD MERGE IS ALLOWED.

Make sure to REBASE current branch to original branch before merging.

After merge is done, summarize the activity to the user, and tell user that the worktree branch can be deleted safely.

DO NOT EVER DELETE THE WORKTREE BY YOURSELF.

## When to use me

Use this when user indicate that the work is done and they want to merge the changes to the original branch, only do this when we are in worktree
