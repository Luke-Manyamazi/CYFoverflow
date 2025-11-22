# CYFoverflow

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

CYFoverflow is a community-driven Q&A platform, inspired by Stack Overflow, built by the CodeYourFuture team. It allows users to ask questions, share knowledge, and engage in a technical community.

This project uses the **Starter Kit v2** template, providing modern tools and configurations for rapid development.

---

## Key Technologies

| Category       | Technology              | Description                                                          |
| -------------- | ----------------------- | -------------------------------------------------------------------- |
| Backend (API)  | Express.js, Node.js LTS | Robust server implementation with Node 20.x support.                 |
| Database       | PostgreSQL with pg      | Reliable relational database for storing users, questions, messages. |
| Authentication | bcrypt, JWT             | Secure password hashing and token-based user authentication.         |
| Frontend       | React with Vite         | Fast, modern client-side application build process.                  |
| Routing        | React Router            | Dynamic client-side navigation.                                      |

---

## Getting Started

### Prerequisites

- **Node.js 20.x LTS**
- **PostgreSQL** running locally

### Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgres://your_user:your_password@localhost:5432/cyfoverflow
JWT_SECRET=a_very_secure_secret_key_here
PGSSLMODE=disable
```

> Generate a strong JWT secret:
> `python3 -c 'import secrets;print(secrets.token_hex(32))'`

### Install Dependencies

```bash
npm install
```

### Database Setup

Run your migration scripts after ensuring PostgreSQL is running:

```bash
npm run migrate
```

---

## Development Scripts

| Script     | Command              | Description                                                                                     |
| ---------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| dev        | `npm run dev`        | Start frontend + backend concurrently in watch mode (frontend proxied to backend on port 3100). |
| serve      | `npm run serve`      | Build client and run in local production mode.                                                  |
| lint       | `npm run lint`       | Check and format code with ESLint + Prettier.                                                   |
| test       | `npm run test`       | Run unit and integration tests (Vitest + SuperTest + TestContainers).                           |
| test:cover | `npm run test:cover` | Run tests with coverage output.                                                                 |
| e2e        | `npm run e2e`        | Run end-to-end tests with Playwright in production mode.                                        |
| ship       | `npm run ship`       | Pre-push: runs lint, test, then e2e.                                                            |

---

## Deployment

### Coolify

1. Create PostgreSQL & Git resources in the production environment.
2. Set environment variables (`PGSSLMODE=disable`, `DATABASE_URL`).
3. Enable healthcheck (`/healthz`, code 301).
4. Configure GitHub webhook for automatic deployment.

### Render

1. Click [Deploy to Render].
2. Provide a service group name.
3. Set `DATABASE_URL` and `JWT_SECRET` in environment variables.

---

## Security

- Only collect essential PII: Name, Email, Hashed Password.
- Authentication required for access.
- Passwords hashed with **bcrypt**, never stored in plain text.
- All validation and security logic handled on the backend.

---

## Contributing

Contributions are welcome! Please open an issue or pull request.

---

## License

MIT License © CodeYourFuture Team

```

This version has:
- Badges for Node.js, React, PostgreSQL, and License
- Clean sections: Overview, Tech Stack, Setup, Scripts, Deployment, Security, Contributing, License
- GitHub-ready formatting

```
