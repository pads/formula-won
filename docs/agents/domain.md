# Domain docs

## Layout

**Single-context**: this repo has one unified domain model.

- **Glossary**: `GLOSSARY.md` at the repo root
- **ADRs**: `docs/adr/` directory

## Consumer rules

### When to read the glossary

Read `GLOSSARY.md` when:
- You encounter an unfamiliar term in code, issues, or conversation
- You're about to use domain language and want to verify the canonical definition
- You're designing a new feature that touches core domain concepts

### When to read ADRs

Read `docs/adr/` when:
- You need to understand why a particular architectural choice was made
- You're proposing a change that might conflict with past decisions
- You're exploring the system's design history

### When to update domain docs

Update domain docs when:
- You add a new core concept to the system (add to `GLOSSARY.md`)
- You make a significant architectural decision (create a new ADR in `docs/adr/`)
- You discover the glossary definition doesn't match actual usage (update `GLOSSARY.md`)

Skills like `domain-modeling` will help maintain these files.
