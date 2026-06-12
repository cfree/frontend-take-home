# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Which repo

`origin` is `cfree/frontend-take-home` (a personal fork); `upstream` is `workos/frontend-take-home`. Issues belong on the **fork** (`origin`). Because this clone has two remotes, `gh` may prompt for a repo — pass `--repo cfree/frontend-take-home` explicitly when there's any ambiguity.

## Conventions

- **Create an issue**: `gh issue create --repo cfree/frontend-take-home --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --repo cfree/frontend-take-home --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --repo cfree/frontend-take-home --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --repo cfree/frontend-take-home --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --repo cfree/frontend-take-home --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --repo cfree/frontend-take-home --comment "..."`

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --repo cfree/frontend-take-home --comments`.
