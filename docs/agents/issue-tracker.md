# Issue tracker

Issues for this repo are tracked in **GitHub Issues**.

## Creating issues

Use `gh issue create` with appropriate flags:

```bash
gh issue create --title "Title" --body "Description"
```

## Listing issues

```bash
gh issue list
```

## PRs as a request surface

**Disabled** by default. External contributors opening PRs does not automatically create triage work.

To enable: change this flag to `true` and ensure the `triage` skill treats incoming PRs as `needs-triage`.

```yaml
prs_create_triage_work: false
```
