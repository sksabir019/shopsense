# AI usage notes

## Tools and model
- AI assistant: GitHub Copilot in Visual Studio Code using the Copilot SDK.
- Other tools used: Docker Compose, terminal/Python commands, and VS Code diagnostics/test tooling.
- Model name/version: Claude Sonnet 5.5 (owner-reported).
- VS Code version: latest at the time of work; exact build number not recorded.
- Other AI tools/models: none (owner-reported).

## Agent instructions
- `AGENTS.md` contains the project architecture, quality, and scope rules. Git status during this work showed it as untracked; include and commit it for the submission.

## Plan
- The challenge acceptance criteria and `AGENTS.md` were used as the working specification.
- No separate plan/spec file was created.
- Work proceeded through backend provider/API implementation, frontend integration, focused tests, Docker configuration, and acceptance-criteria review.

## Prompts and key moments
These are paraphrases of actual requests from the implementation conversation:
1. Review the existing codebase against the Product Catalogue acceptance criteria without making changes.
2. Implement the necessary changes and then review them against the requirements.
3. Investigate search failures, including why a search for `jewelery` returned no products.
4. Perform a final requirements and best-practices review.
5. Address the review findings: make Docker use Mailpit by default, guarantee five featured products, add enquiry abuse protection, and test SMTP delivery.

## AI mistakes caught
- The initial search implementation matched title and description but not category, so searching `jewelery` returned no results. Category matching and a regression test were added.
- Featured-product selection silently omitted configured IDs unavailable from the provider. Configuration now requires exactly five unique IDs and the API returns an explicit upstream error rather than a partial list.
- Gmail as the default Docker mail server would have required reviewers to configure an account. Mailpit is now the default, with Gmail as an opt-in Compose override.

## Review ownership
All generated code must be reviewed, run, tested, and understood by the repository owner before submission.

## Time spent
- Approximate total: 3 hours (owner-reported).
- Planning: approximately 30 minutes.
- Implementation: approximately 2 hours.
- Testing and documentation: approximately 30 minutes combined.
