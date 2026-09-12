# CYFOverflow

> A full-stack technical Q&A platform where developers can ask questions, share knowledge, vote on answers, and collaborate with a community.

## Overview

CYFOverflow is a Stack Overflow–style community application built as a full-stack project during CodeYourFuture. It demonstrates practical experience across frontend development, REST APIs, authentication, relational data modelling, validation, testing, and deployment.

## Features

- User registration and authentication
- Ask, edit, and answer questions
- Vote on questions and answers
- Rich-text question and answer authoring
- Admin tools for managing users and community content
- Responsive, mobile-first interface
- Backend validation and authenticated API access
- Automated unit/integration and end-to-end testing
- Production deployment workflow with health-check support

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Validation | Joi |
| Editor | TinyMCE |
| Testing | Vitest, Playwright |
| Tooling | ESLint, Prettier, Husky |
| Deployment | Coolify |

## Architecture

```text
React + Vite
     │
     ▼
Express REST API
     │
     ├── Authentication / Authorization
     ├── Request Validation
     └── Community Business Logic
             │
             ▼
         PostgreSQL
```

The repository is organized as a workspace containing the web client, API, end-to-end tests, and shared linting/tooling configuration.

## Getting Started

### Prerequisites

- Node.js 20+ (22+ recommended)
- PostgreSQL
- npm

### Installation

```bash
git clone https://github.com/Luke-Manyamazi/CYFoverflow.git
cd CYFoverflow
npm install
```

Configure the database connection and authentication environment variables required by the API, then run migrations:

```bash
npm run migration
```

Start the application in development mode:

```bash
npm run dev
```

## Quality & Testing

The project includes linting, formatting, unit/integration testing, and Playwright end-to-end testing. The `ship` command runs the main pre-release checks together:

```bash
npm run ship
```

## Deployment

The application is structured for deployment with a Node.js API and PostgreSQL database. The original deployment setup uses Coolify with a health-check endpoint and GitHub-triggered deployment.

## Engineering Highlights

- Full-stack JavaScript application with separated web and API workspaces
- JWT-based authentication and bcrypt password hashing
- Relational PostgreSQL data model
- Server-side validation with Joi
- Automated testing across multiple levels
- Production-oriented linting, formatting, and pre-release checks
- Responsive UI designed for a community product

## Project Context

CYFOverflow was developed as a collaborative CodeYourFuture project, providing hands-on experience building and shipping a complete community product rather than a standalone frontend exercise.

## License

MIT License © CodeYourFuture Team
