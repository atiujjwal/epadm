# EPADM System Documentation

## Phase narrative

- **[Phase Evolution & Product Intent](./PHASE_EVOLUTION_AND_INTENT.md)** - documents what changed across all 13 development phases, why each enhancement was introduced, and how the phases combine into one centralized School Management System.

Welcome to the system architecture and module-wise documentation for the **Educational Platform Administration & Management (EPADM)** system.

This documentation is split into independent, comprehensive modules to help you understand the architectural guidelines, workflow mechanisms, database schemas, and implementation statuses.

## 📁 Documented Modules

1. **[Module 1: Multi-Tenancy & Request Context](./01_multi_tenancy_routing.md)**
   - Core architecture of shared-database multi-tenancy.
   - Next.js Middleware path rewriting (`/_root/[tenantId]`).
   - Request-scoped context propagation (`getCtx`).
   - Transactional database isolation wrapper (`withTenant`).
   
2. **[Module 2: Authentication & Session Management](./02_authentication_sessions.md)**
   - User identity schemas and password encryption (Argon2).
   - Tenant-specific role assignments (`tenant_users`).
   - Session tokens (JWT via `jose`) and cookie configurations.
   - Login, logout, and session lifecycle details.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Database Client**: [Drizzle ORM](https://orm.drizzle.team/) with [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [jose](https://github.com/panva/jose) (JWT) and [Argon2](https://github.com/ranisalt/node-argon2) (Password Hashing)
- **Validation**: [Zod](https://zod.dev/)

---

## 🔑 Base Architecture Overview

EPADM relies on two main building blocks for database structure and session context propagation:

### 1. Unified Tenant & Identity Schema
The identity layer is built on three core tables:
- `users`: Represents a person with a name, email, and password.
- `tenants`: Represents a distinct educational institution with its own configuration and sub-domain slug.
- `tenant_users`: Connects a `user` to a `tenant` with a specific `role` (e.g., `admin`, `teacher`, `student`).

### 2. Middleware-Driven Context Propagation
Next.js middleware interceptor translates paths and injects authenticated state:
```
[Client Request] 
      │
      ▼
[middleware.ts] ──(Verify JWT)──► [Inject Context Headers] ──► [Internal Rewrite]
                                                                      │
                                                                      ▼
                                                            [_root/[tenantId]/...]
                                                                      │
                                                                      ▼
                                                            [getCtx() / Services]
```
This enables pages and route endpoints to operate without having to constantly parse tokens or query tenant IDs, ensuring high performance and separation of concerns.
