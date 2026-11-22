# Decisions and assumptions

## Assumptions
- The five featured products are business-selected IDs, not automatically ranked by Fake Store ratings.
- The configured IDs are `1,2,3,4,5` for the initial demonstration and can be changed through `FEATURED_PRODUCT_IDS`.
- Category pages show configured featured products in that category separately from all remaining products.
- Search is case-insensitive and matches product title, description, and category.
- Product metadata comes from Fake Store API through the backend only.
- An enquiry requires name, email, phone, message, and a valid product ID.
- The sales inbox is configuration, not client input.

## Simplifications
- No admin interface to manage featured products; configuration is sufficient for this PoC.
- No database yet because the challenge accepts Fake Store API for product metadata and does not require enquiry history.
- Email is synchronous for the PoC. A production system should persist enquiries and deliver notifications asynchronously.
- Enquiry abuse protection uses an in-memory limit of five requests per IP per 15 minutes. This avoids a new service dependency for the PoC; multi-replica deployments need a shared rate-limit store.
- No authentication, cart, payment, or order management because they are outside the acceptance criteria.

## Growth path
- Replace `ProductProvider` implementation without changing product services/controllers.
- Replace `EmailProvider` implementation without changing enquiry business logic.
- Add a repository and database for managed products/enquiries.
- Add an outbox + worker for reliable notifications.
- Deploy container images to AWS ECS/Fargate behind an ALB; use Secrets Manager, CloudWatch and SES as appropriate.

## Next with another day
- Add durable enquiry persistence and retryable email delivery.
- Add idempotency for enquiry submission and a shared rate-limit store if the backend is scaled beyond one process.
- Expand integration and browser E2E tests.
- Add pagination if the catalogue data source grows.
- Add observability dashboards and operational health checks.
