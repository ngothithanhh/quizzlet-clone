# 🚀 Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Running the Application](#running-the-application)
3. [Troubleshooting](#troubleshooting)
4. [Production Deployment](#production-deployment)

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18+ (for frontend)
- **Java**: JDK 21+ (for backend)
- **MySQL**: 8.0+ (for database)
- **pnpm**: v8+ (package manager)
- **Maven**: 3.8+ (Java build tool)

### Step 1: Clone Repository
```bash
cd D:\Document\quizzlet-clone
```

### Step 2: Backend Setup

#### 2.1 Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quizzlet_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Or use MySQL Workbench GUI
```

#### 2.2 Configure Backend
The `application.yaml` is already configured with:
- ✅ Server running on port 8080
- ✅ Context path: `/quizzlet-clone`
- ✅ CORS enabled for frontend
- ✅ MySQL database connection
- ✅ Mail configuration for OTP
- ✅ Google OAuth2 credentials
- ✅ Cloudinary credentials for file uploads

**Note**: Update `application.yaml` if needed:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quizzlet_clone?useSSL=false
    username: root
    password: YOUR_MYSQL_PASSWORD  # Change this
```

#### 2.3 Build Backend
```bash
cd quizzz-be
mvn clean install
```

### Step 3: Frontend Setup

#### 3.1 Install Dependencies
```bash
cd quizlet-fe
pnpm install
```

#### 3.2 Configure Environment
```bash
# Copy environment template
cp apps/nextjs/.env.example apps/nextjs/.env.local
```

Edit `apps/nextjs/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/quizzlet-clone
```

### Step 4: Start Development

#### Terminal 1 - Backend
```bash
cd quizzz-be
mvn spring-boot:run
```

Expected output:
```
Tomcat started on port(s): 8080
Application 'quizzz' is running!
```

**Verify**: Open http://localhost:8080/quizzlet-clone/swagger-ui/index.html

#### Terminal 2 - Frontend
```bash
cd quizlet-fe
pnpm dev
```

Expected output:
```
▲ Next.js 14.2
  - ready started server on 0.0.0.0:3000
```

**Verify**: Open http://localhost:3000

---

## Running the Application

### Using Makefile (Recommended)

```bash
# Show help
make help

# Setup everything
make setup

# Run backend
make run-be

# Run frontend
make run-fe

# Run all (in separate terminals)
make run-all

# Stop everything
make stop

# Build for production
make build

# Clean generated files
make clean
```

### Manual Commands

```bash
# Backend
cd quizzz-be && mvn spring-boot:run

# Frontend
cd quizlet-fe && pnpm dev

# Stop backend (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)
```

---

## Testing the Integration

### 1. Test Backend API

```bash
# Health check
curl http://localhost:8080/quizzlet-clone/swagger-ui/index.html

# Register OTP
curl -X POST "http://localhost:8080/quizzlet-clone/api/auth/register/otp?email=test@example.com"

# Login
curl -X POST "http://localhost:8080/quizzlet-clone/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Test Frontend API Integration

Create a test page at `apps/nextjs/src/app/test/page.tsx`:

```typescript
"use client";
import { authService, studySetService } from "@acme/api";
import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const res = await authService.login({
        email: "test@example.com",
        password: "test123"
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const testGetStudySets = async () => {
    setLoading(true);
    try {
      const res = await studySetService.getMyStudySets();
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Integration Test</h1>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          Test Login
        </button>
        <button 
          onClick={testGetStudySets}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
          disabled={loading}
        >
          Test Get Study Sets
        </button>
      </div>

      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

Access: http://localhost:3000/test

---

## Troubleshooting

### 1. CORS Error in Browser Console

**Error**: `Access to XMLHttpRequest at 'http://localhost:8080/...' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**:
- ✅ CORS already configured in `application.yaml`
- Ensure backend is running
- Check backend logs for errors
- Clear browser cache (Ctrl+Shift+Delete)

### 2. "Cannot POST /api/auth/login"

**Error**: Backend endpoint not found

**Solution**:
- Verify backend running: `http://localhost:8080/quizzlet-clone/swagger-ui/`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure MySQL database exists and is running

### 3. "connect ECONNREFUSED 127.0.0.1:8080"

**Error**: Frontend cannot connect to backend

**Solution**:
- Start backend: `cd quizzz-be && mvn spring-boot:run`
- Check `NEXT_PUBLIC_API_URL=http://localhost:8080/quizzlet-clone`
- Verify port 8080 not used by other apps

### 4. JWT Token Errors

**Error**: `Invalid JWT`

**Solution**:
- Clear localStorage: Open DevTools → Application → Local Storage → Clear All
- Re-login to get new token
- Check token expiration: 24 hours (86400000 ms)

### 5. MySQL Connection Error

**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:
- Update password in `application.yaml`:
  ```yaml
  spring:
    datasource:
      password: YOUR_ACTUAL_PASSWORD
  ```
- Restart backend

### 6. File Upload Error

**Error**: Upload fails on Cloudinary

**Solution**:
- Check Cloudinary credentials in `application.yaml`
- Ensure credentials are valid
- Check file size (max ~100MB)

---

## Production Deployment

### 1. Build for Production

#### Backend
```bash
cd quizzz-be
mvn clean package -DskipTests
```

Creates: `target/quizzz-0.0.1-SNAPSHOT.jar`

#### Frontend
```bash
cd quizlet-fe
pnpm build
```

Creates: `apps/nextjs/.next/`

### 2. Environment Configuration

Create `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.quizzlet-clone.com
NODE_ENV=production
```

Update backend `application.yaml`:
```yaml
server:
  port: 8080
  servlet:
    context-path: /quizzlet-clone
  ssl:
    enabled: true
    key-store: /path/to/keystore.jks
    key-store-password: password

spring:
  web:
    cors:
      allowed-origins: "https://quizzlet-clone.com"
  datasource:
    url: jdbc:mysql://prod-db-host:3306/quizzlet_clone
    username: prod_user
    password: ${MYSQL_PASSWORD}  # Use environment variables
```

### 3. Deployment Options

#### Option A: AWS EC2 + RDS + S3
```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-instance.amazonaws.com

# Install Java
sudo apt update
sudo apt install openjdk-21-jdk

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo>
cd quizzlet-clone

# Backend
cd quizzz-be
mvn clean package -DskipTests
java -jar target/quizzz-0.0.1-SNAPSHOT.jar

# Frontend
cd ../quizlet-fe
pnpm install
pnpm build
pnpm start
```

#### Option B: Docker
```dockerfile
# Backend Dockerfile
FROM openjdk:21-jdk
WORKDIR /app
COPY target/quizzz-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

#### Option C: Vercel + Render
- **Frontend**: Deploy to Vercel (auto from GitHub)
- **Backend**: Deploy to Render (auto from GitHub)
- **Database**: Use AWS RDS or Render PostgreSQL

### 4. SSL/HTTPS Certificate

Use Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d api.quizzlet-clone.com
```

### 5. Database Backup

```bash
# Daily backup
mysqldump -u root -p quizzlet_clone > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root -p quizzlet_clone < backup_20260415.sql
```

### 6. Monitoring & Logs

```bash
# Backend logs
tail -f /var/log/quizzz/app.log

# Frontend logs
pm2 logs

# Monitor with PM2
pm2 install pm2-logrotate
```

### 7. CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Java
        uses: actions/setup-java@v2
        with:
          java-version: '21'
      
      - name: Build Backend
        run: |
          cd quizzz-be
          mvn clean package -DskipTests
      
      - name: Deploy Backend
        run: |
          # Deploy to Render/AWS/etc
      
      - name: Build Frontend
        run: |
          cd quizlet-fe
          pnpm install
          pnpm build
      
      - name: Deploy Frontend
        run: |
          # Deploy to Vercel/Netlify/etc
```

---

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs, review user feedback
- **Monthly**: Database optimization, security updates
- **Quarterly**: Performance testing, backup verification

### Performance Tuning

```yaml
# application.yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20
          fetch_size: 50
        order_inserts: true
        order_updates: true
  hikari:
    maximum-pool-size: 20
    minimum-idle: 5
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start all | `make run-all` (2 terminals) |
| Stop all | `make stop` |
| Test backend | `http://localhost:8080/quizzlet-clone/swagger-ui/` |
| Test frontend | `http://localhost:3000` |
| Build backend | `cd quizzz-be && mvn package` |
| Build frontend | `cd quizlet-fe && pnpm build` |
| Run tests | `cd quizlet-fe && pnpm test` |
| Format code | `cd quizlet-fe && pnpm format` |

---

## Support & Documentation

- **Backend API Docs**: http://localhost:8080/quizzlet-clone/swagger-ui/
- **Integration Guide**: `API_INTEGRATION_GUIDE.md`
- **Checklist**: `INTEGRATION_CHECKLIST.md`
- **Issues**: Check browser console and backend logs

---

**Happy deployment! 🚀**

