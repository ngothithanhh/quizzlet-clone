# Local Development Setup Guide - MySQL

## 1. Environment Variables ✅
Created `.env.local` in the project root with all required variables.

**Update these with real values:**
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` - Get from [Google Cloud Console](https://console.cloud.google.com/)
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET` - Get from [GitHub Settings > Developer settings](https://github.com/settings/developers)
- `AUTH_EMAIL_FROM` - Any email for testing (e.g., `test@example.com`)
- `AUTH_SECRET` - Can keep the placeholder for dev
- `S3_*` variables - Optional for local testing

## 2. Database Setup - MySQL

### Option A: Docker (Recommended)
```bash
# Start MySQL container
cd packages/db
docker-compose up -d

# Verify it's running
docker-compose ps
```

The MySQL container will be available at `localhost:3306`
- Username: `quizzlet`
- Password: `quizzlet_password`
- Database: `quizzlet_clone`

### Option B: Local MySQL (if already installed)
```bash
# Create database and user
mysql -u root -p -e "CREATE DATABASE quizzlet_clone;"
mysql -u root -p -e "CREATE USER 'quizzlet'@'localhost' IDENTIFIED BY 'quizzlet_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON quizzlet_clone.* TO 'quizzlet'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Update .env.local
DATABASE_URL=mysql://quizzlet:quizzlet_password@localhost:3306/quizzlet_clone
```

### Option C: Cloud MySQL (PlanetScale, AWS RDS, etc.)
```bash
# Get connection string from provider and update .env.local
DATABASE_URL=mysql://username:password@your-host/database
```

## 3. Install Dependencies
```bash
pnpm install
```

## 4. Setup Database Schema
```bash
# Run migrations to create tables
pnpm db:push

# Optional: View database
pnpm db:studio
```

## 5. Start Development Server
```bash
# Start all dev servers
pnpm dev

# OR: Start only Next.js (faster for web dev)
pnpm dev:next
```

App will be at **http://localhost:3000**

## Troubleshooting

### Error: "Invalid environment variables"
- Ensure `.env.local` exists in project root
- Check `DATABASE_URL` is set correctly
- Run: `pnpm install`

### Error: "ECONNREFUSED 127.0.0.1:3306" (MySQL connection failed)
```bash
# Check if Docker container is running
docker-compose -f packages/db/docker-compose.yml ps

# Restart if needed
docker-compose -f packages/db/docker-compose.yml restart mysql
```

### Error: "Unknown database" or "Access denied"
```bash
# Verify MySQL credentials in .env.local match docker-compose.yml
# Default: mysql://quizzlet:quizzlet_password@localhost:3306/quizzlet_clone

# Re-create containers if needed
docker-compose -f packages/db/docker-compose.yml down
docker-compose -f packages/db/docker-compose.yml up -d
```

## Next Steps
1. Visit http://localhost:3000
2. Test the app locally
3. Run: `pnpm lint` & `pnpm typecheck`
4. Add OAuth credentials when ready

For detailed architecture: See `AGENTS.md`


