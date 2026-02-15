# CYFOverflow  
**CYFOverflow** is a full-stack Q&A platform that allows users to ask questions, share knowledge, and vote on answers—designed to foster a collaborative technical community.  

---

## Key Technologies

| Category       | Technology               | Description |
|----------------|-------------------------|------------|
| Backend (API)  | Node.js, Express.js      | Fast and robust server handling RESTful endpoints. |
| Database       | PostgreSQL               | Reliable relational database for users, questions, and answers. |
| Authentication | bcrypt, JWT             | Secure password hashing and token-based authentication. |
| Frontend       | React (Vite)            | Modern, fast client-side application with responsive design. |
| Routing        | React Router            | Dynamic client-side navigation for a seamless user experience. |
| Validation     | Joi                     | Schema-based input validation for secure and consistent data handling. |
| Rich Text Editor | TinyMCE               | WYSIWYG editor enabling users to create and format rich text content.  |

---

## Collaborators

- **Ali**
- **Sheetal**  
- **Eyuel**  

---

## Features

- User registration and authentication with hashed passwords  
- Post, answer, edit, and vote on questions  
- Real-time updates with client-side rendering  
- Mobile-first, accessible UI following WCAG guidelines  
- Admin tools for managing content and users  

---

## Getting Started

### Prerequisites

- Node.js 20.x LTS  
- PostgreSQL 15.x running locally  

### Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgres://your_user:your_password@localhost:5432/cyfoverflow
JWT_SECRET=your_strong_jwt_secret_here
PGSSLMODE=disable
````

> Generate a strong JWT secret:
> `python3 -c 'import secrets; print(secrets.token_hex(32))'`

### Install Dependencies

```bash
npm install
```

### Database Setup

Make sure PostgreSQL is running, then run migrations:

```bash
npm run migrate
```

---

## Development Scripts

| Script     | Command              | Description                                          |
| ---------- | -------------------- | ---------------------------------------------------- |
| dev        | `npm run dev`        | Start frontend + backend concurrently in watch mode. |
| serve      | `npm run serve`      | Build client and run in local production mode.       |
| lint       | `npm run lint`       | Check and format code with ESLint + Prettier.        |
| test       | `npm run test`       | Run unit and integration tests.                      |
| test:cover | `npm run test:cover` | Run tests with coverage output.                      |
| e2e        | `npm run e2e`        | Run end-to-end tests using Playwright.               |
| ship       | `npm run ship`       | Pre-push: runs lint, test, then e2e.                 |

---

## Deployment

### Coolify

1. Create PostgreSQL & Git resources in the production environment.
2. Set environment variables (`PGSSLMODE=disable`, `DATABASE_URL`).
3. Enable healthcheck endpoint (`/healthz`).
4. Configure GitHub webhook for automatic deployment.

---

## Security

* Only essential PII is collected: Name, Email, Hashed Password
* Passwords hashed with bcrypt and never stored in plain text
* Authentication required for user access
* All validation and security logic handled on the backend

---

## License

MIT License © CodeYourFuture Team
