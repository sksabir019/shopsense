# AI coding instructions

## Project
Product Catalogue MVP. Frontend: React + TypeScript. Backend: Node.js + TypeScript + Express.

## Non-negotiable architecture rules
- Browser code must never call Fake Store API. All product data flows through `/api/v1` on our backend.
- Keep HTTP controllers thin. Business rules belong in services.
- Services depend on interfaces, not concrete external providers.
- External product API DTOs must be mapped to our own domain types at the provider boundary.
- Validate all untrusted input at runtime with Zod. TypeScript types alone are not validation.
- Never expose secrets or internal stack traces in API responses.
- Use dependency injection/composition at application startup; avoid hidden global service state.
- Keep the MVP small. Do not add auth, cart, payments, admin UI, microservices, or a database unless explicitly approved.

## Quality rules
- Add or update tests for changed behavior.
- Handle loading, empty, success, and error states in the UI.
- Use accessible labels and semantic HTML.
- Do not swallow errors. Log server-side context without logging sensitive personal data.
- Keep environment variables documented in `.env.example`.
- Before finishing, run typecheck, lint (if configured), and tests; report commands and results honestly.

## Product decisions
- Featured products are selected by configured product IDs, not inferred from ratings.
- Category pages show featured products in that category separately from the remaining products.
- Search is case-insensitive and matches title, description, and category.
- Enquiry submission is only successful when accepted by the backend. Email delivery failures must not be falsely reported as successful delivery.
