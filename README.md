# Product Catalogue

A small product catalogue MVP built with React + TypeScript and Node.js + TypeScript.

## Architecture

- `frontend`: React application. It communicates only with our backend API.
- `backend`: Express modular monolith with product and enquiry modules.
- `ProductProvider`: isolates the product source. `FakeStoreProductProvider` is the initial adapter.
- `EmailProvider`: isolates notification delivery. `SmtpEmailProvider` sends through the configured SMTP server.
- Product data is mapped into our own `Product` domain type at the provider boundary.

## Requirements

- Node.js 22+
- npm 10+
- Internet access for Fake Store API (or replace the provider with a local test double)
- Docker Desktop for the containerized setup

## Run locally with Docker

```bash
docker compose pull
docker compose up -d
```

The Compose file uses `sksabiruddin450/shopsense-backend:latest` and `sksabiruddin450/shopsense-frontend:latest`. The default setup uses Mailpit and does not require SMTP credentials.
Make both Docker Hub repositories public for reviewers to pull without Docker Hub credentials. If they are private, users need an authorized `docker login`.

- Frontend: http://localhost:5173
- Backend health via the frontend proxy: http://localhost:5173/api/v1/health
- Mailpit inbox: http://localhost:8025. The default setup needs no email account or credentials.

Build and publish a versioned image pair from the repository root:

```bash
docker login
IMAGE_TAG=1.0.0 docker compose build --pull
IMAGE_TAG=1.0.0 docker compose push
```

Run a specific release with `IMAGE_TAG=1.0.0 docker compose pull` followed by `IMAGE_TAG=1.0.0 docker compose up -d`. The default `latest` tag is convenient for review; use immutable release tags for deployments.

To opt into Gmail SMTP, configure `backend/.env` from `.env.example`, then use the Gmail Compose override:

```bash
cp .env.example backend/.env
# Set the Gmail account, App Password, sender, and sales inbox.
docker compose -f docker-compose.yml -f docker-compose.gmail.yml pull
docker compose -f docker-compose.yml -f docker-compose.gmail.yml up -d
```

The Compose stack is a single-host reference deployment. Set `FRONTEND_ORIGIN` to the public site origin and `HTTP_PORT` to the listener port. Set `TRUST_PROXY_HOPS` to the actual trusted proxy count (one for the bundled Nginx proxy; two when an ALB is in front of it). The backend port is internal to the Compose network. For production email, replace Mailpit with an approved SMTP service and inject credentials from the deployment platform's secret manager rather than committing or baking them into an image.

## Run without Docker

```bash
cp .env.example backend/.env
npm install
npm run dev
```

Run frontend and backend in separate terminals if preferred:

```bash
npm run dev:backend
npm run dev:frontend
```

## API

- `GET /api/v1/health`
- `GET /api/v1/products/featured`
- `GET /api/v1/products/search?q=term`
- `GET /api/v1/products/:id`
- `GET /api/v1/categories`
- `GET /api/v1/categories/:category/products`
- `POST /api/v1/enquiries`

Successful responses use a `data` envelope; API errors use an `error` object with a stable code and safe message. Invalid input returns `400`, and unknown products, categories, or API routes return `404`.

## Configuration

See `.env.example`. Never commit `.env` or real credentials. `FEATURED_PRODUCT_IDS` must contain exactly five unique positive product IDs selected by the business. The initial default is `1,2,3,4,5` for the proof of concept; the API reports an upstream error rather than returning a partial featured list if a configured product is missing.

For Gmail SMTP, enable 2-Step Verification on the account, create a Google App Password, and set `SMTP_USER` to the full Gmail address, `SMTP_PASS` to the App Password, `MAIL_FROM` to that account, and `SALES_INBOX` to the sales recipient. Grouping whitespace in Gmail App Passwords is removed automatically. Port 587 uses `SMTP_SECURE=false`; port 465 uses `SMTP_SECURE=true`. Do not use the account's regular password. The backend loads `backend/.env` first and falls back to the project-root `.env`; never commit either file.

## Quality commands

```bash
npm run typecheck
npm test
npm run build
```

## Current MVP boundaries

No authentication, admin panel, cart, checkout, payments, database, or production email queue. The in-memory enquiry rate limit is per backend process; deployments with multiple replicas should use a shared store. Enquiry email delivery is synchronous in this initial MVP; production should persist enquiries and use a transactional outbox/background worker so provider outages do not lose notifications.

## Known next improvements

- Add a durable enquiry repository and outbox worker for production.
- Consider server-side cache invalidation and stale-if-error behavior.
