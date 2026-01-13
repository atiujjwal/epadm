# epadm

This document provides instructions for setting up and running the epadm project for local development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

Follow these steps to get your development environment set up.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd epadm
```
*(Replace `<repository-url>` with the actual URL of the repository)*

### 2. Install Dependencies

Install the project dependencies using npm.

```bash
npm install
```

### 3. Set Up the Database

The project uses a PostgreSQL database with pgvector running in a Docker container.

**a. Start the Database Container**

Use Docker Compose to start the database service in the background.

```bash
docker-compose up -d
```

**b. Configure Environment Variables**

Create a local environment file by copying the template.

```bash
cp .env .env.local
```

Now, open `.env.local` and ensure the `DATABASE_URL` matches the Docker configuration. The default port is `5433`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/epadm"
```

**c. Enable pgvector Extension**

Connect to the running container and create the `vector` extension in the database.

```bash
docker exec -i epadm_db psql -U postgres -d epadm -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 4. Run Database Migrations

Apply the database schema to your local database.

```bash
npm run db:migrate
```

## Running the Development Server

Once the setup is complete, you can start the Next.js development server.

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

Here are some of the most common scripts available in `package.json`:

| Script          | Description                                           |
|-----------------|-------------------------------------------------------|
| `npm run dev`     | Starts the development server.                        |
| `npm run build`   | Builds the application for production.                |
| `npm run start`   | Starts a production server.                           |
| `npm run lint`    | Lints the codebase for errors.                        |
| `npm run db:generate` | Generates a new database migration based on schema changes. |
| `npm run db:migrate`  | Applies pending migrations to the database.         |
| `npm run db:studio`   | Opens the Drizzle Studio to inspect the database.   |
| `npm run db:seed`     | Seeds the database with initial data.               |

## Docker Commands

Useful Docker Compose commands for managing the database service:

| Command | Description |
|---|---|
| `docker-compose up -d` | Start the database service in detached mode. |
| `docker-compose down -v` | Stop and remove the containers, network, and volumes. |
| `docker-compose ps` | List running containers and their status. |
| `docker-compose logs -f db` | Follow the logs from the database container. |







# EPADM - Educational Platform Administration & Management

A comprehensive educational platform built with Next.js, PostgreSQL, and Drizzle ORM.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Setup](#development-setup)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Development Commands](#development-commands)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Docker** and **Docker Compose**
- **Git**

---

## 🚀 Initial Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd epadm
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create the necessary environment files:

#### `.env.local` (Local development - highest priority)
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/epadm"
```

#### `.env` (Shared defaults)
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/epadm"

# Add other environment variables here
# NEXT_PUBLIC_API_URL=
# JWT_SECRET=
```

> **Note:** `.env.local` takes precedence over `.env` and should contain your local overrides.

---

## 🐳 Development Setup

### Step 1: Start PostgreSQL with Docker

Start the PostgreSQL database container with pgvector extension:
```bash
docker-compose up -d
```

This will:
- Create a PostgreSQL 15 container with pgvector extension
- Expose the database on port `5432`
- Create a volume for data persistence

### Step 2: Verify Database is Running

Check if the container is healthy:
```bash
docker-compose ps
```

You should see:
```
NAME       STATUS
epadm_db   Up (healthy)
```

View database logs:
```bash
docker-compose logs -f db
```

### Step 3: Test Database Connection

Run the connection test script:
```bash
npx tsx test-db.ts
```

Expected output:
```
✅ Successfully connected to PostgreSQL!
📋 PostgreSQL Version: PostgreSQL 15.15...
🎯 Current Database: epadm
```

### Step 4: Create pgVector Extension
```bash
docker exec -i epadm_db psql -U postgres -d epadm -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Step 5: Generate and Run Migrations

Generate migration files from your schema:
```bash
npm run db:generate
```

Apply migrations to the database:
```bash
npm run db:migrate
```

Or run the migration script directly:
```bash
npx tsx src/lib/db/migrate.ts
```

### Step 6: Start the Development Server
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

---

## 🗄️ Database Management

### Schema Changes

Whenever you modify the database schema in `src/lib/db/schema.ts`:

1. **Generate new migration:**
```bash
   npm run db:generate
```

2. **Apply migration:**
```bash
   npm run db:migrate
```

### Database Reset

To completely reset your database:
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for database to be ready (check health)
docker-compose ps

# Run migrations
npm run db:migrate
```

### Direct Database Access

Connect to PostgreSQL directly:
```bash
docker exec -it epadm_db psql -U postgres -d epadm
```

Common PostgreSQL commands:
```sql
\dt              -- List all tables
\d table_name    -- Describe table structure
\l               -- List all databases
\q               -- Quit psql
```

---

## 🛠️ Development Commands

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services (keeps volumes)
docker-compose down

# Stop and remove all data
docker-compose down -v

# View logs
docker-compose logs -f db

# Check container status and health
docker-compose ps

# Restart database
docker-compose restart db
```

### Database Commands
```bash
# Test database connection
npx tsx test-db.ts

# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Direct migration script
npx tsx src/lib/db/migrate.ts
```

### Development Server
```bash
# Start Next.js development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

---

## 🐛 Troubleshooting

### Issue: "password authentication failed for user 'postgres'"

**Solution:**
1. Stop and remove all containers and volumes:
```bash
   docker-compose down -v
```

2. Verify your `docker-compose.yml` has the correct environment variables:
```yaml
   environment:
     POSTGRES_USER: postgres
     POSTGRES_PASSWORD: postgres
     POSTGRES_DB: epadm
     POSTGRES_HOST_AUTH_METHOD: scram-sha-256
```

3. Start fresh:
```bash
   docker-compose up -d
```

### Issue: Port 5432 already in use

**Solution:**
1. Check what's using the port:
```bash
   # Windows
   netstat -ano | findstr :5432
   
   # Linux/Mac
   lsof -i :5432
```

2. Either stop the conflicting service or change the port in `docker-compose.yml`:
```yaml
   ports:
     - "5433:5432"  # Use different host port
```

3. Update your `.env.local`:
```env
   DATABASE_URL="postgres://postgres:postgres@localhost:5433/epadm"
```

### Issue: Migration fails with "Cannot read properties of undefined"

**Solution:**
Ensure your environment variables are loading correctly in `drizzle.config.ts`:
```typescript
dotenv.config({ 
  path: path.resolve(process.cwd(), ".env.local"),
  override: true 
});
dotenv.config({ 
  path: path.resolve(process.cwd(), ".env")
});
```

### Issue: Container starts but connection times out

**Solution:**
1. Wait for the health check to pass:
```bash
   docker-compose ps
```

2. Check the logs for initialization completion:
```bash
   docker-compose logs db
```
   Look for: `database system is ready to accept connections`

---

## 📁 Project Structure
```
epadm/
├── src/
│   ├── lib/
│   │   └── db/
│   │       ├── schema.ts       # Database schema definitions
│   │       ├── index.ts        # Database client
│   │       └── migrate.ts      # Migration runner
│   └── ...
├── drizzle/                    # Generated migration files
├── docker-compose.yml          # Docker services configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── test-db.ts                 # Database connection test
├── .env                       # Shared environment variables
├── .env.local                 # Local environment overrides
└── package.json
```

---

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Use strong passwords in production
- Rotate database credentials regularly
- Keep Docker images updated

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 📝 License

[Your License Here]

---

## 🤝 Contributing

[Your Contributing Guidelines Here]