# Deployment Guide - Google Cloud

This guide covers deploying CareerPilot AI to Google Cloud Platform for the hackathon.

## Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed and configured
3. Docker installed locally
4. Gemini API key

## Step 1: Set Up Google Cloud Project

```bash
# Create new project
gcloud projects create careerpilot-ai --name="CareerPilot AI"

# Set as active project
gcloud config set project careerpilot-ai

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com
```

## Step 2: Set Up Secrets

```bash
# Store Gemini API key
echo -n "your_gemini_api_key" | \
  gcloud secrets create gemini-api-key --data-file=-

# Store database URL
echo -n "postgresql://user:pass@host/db" | \
  gcloud secrets create database-url --data-file=-
```

## Step 3: Create Cloud Storage Bucket

```bash
# Create bucket for screenshots
gsutil mb -l us-central1 gs://careerpilot-screenshots

# Set public access (optional, for demo)
gsutil iam ch allUsers:objectViewer gs://careerpilot-screenshots
```

## Step 4: Set Up Cloud SQL (Optional)

```bash
# Create PostgreSQL instance
gcloud sql instances create careerpilot-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create careerpilot \
  --instance=careerpilot-db

# Create user
gcloud sql users create careerpilot \
  --instance=careerpilot-db \
  --password=your_secure_password
```

## Step 5: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Set Playwright to use system chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3000

CMD ["npm", "start"]
```

## Step 6: Create .dockerignore

```
node_modules
.next
.git
.env
.env.local
screenshots
*.log
README.md
```

## Step 7: Build and Deploy to Cloud Run

```bash
# Build container image
gcloud builds submit --tag gcr.io/careerpilot-ai/app

# Deploy to Cloud Run
gcloud run deploy careerpilot-ai \
  --image gcr.io/careerpilot-ai/app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-secrets="GOOGLE_GEMINI_API_KEY=gemini-api-key:latest,DATABASE_URL=database-url:latest" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=careerpilot-ai,GOOGLE_CLOUD_STORAGE_BUCKET=careerpilot-screenshots"
```

## Step 8: Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service careerpilot-ai \
  --domain app.careerpilot.ai \
  --region us-central1
```

## Step 9: Set Up Cloud Scheduler (Optional)

For automated job processing:

```bash
# Create scheduler job
gcloud scheduler jobs create http process-queue \
  --schedule="*/10 * * * *" \
  --uri="https://careerpilot-ai-xxx.run.app/api/agent/process-queue" \
  --http-method=POST \
  --location=us-central1
```

## Environment Variables

Required environment variables for Cloud Run:

```
GOOGLE_GEMINI_API_KEY=<from Secret Manager>
DATABASE_URL=<from Secret Manager>
GOOGLE_CLOUD_PROJECT_ID=careerpilot-ai
GOOGLE_CLOUD_STORAGE_BUCKET=careerpilot-screenshots
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-url.run.app
```

## Monitoring and Logging

```bash
# View logs
gcloud run logs read careerpilot-ai --region us-central1

# View metrics
gcloud run services describe careerpilot-ai --region us-central1
```

## Cost Optimization

1. **Cloud Run**: Pay per request, scales to zero
2. **Cloud Storage**: ~$0.02/GB/month
3. **Cloud SQL**: Use smallest instance (db-f1-micro)
4. **Secrets**: First 6 active secrets free

Estimated monthly cost for demo: $10-30

## Troubleshooting

### Issue: Playwright browser not found
**Solution**: Ensure Dockerfile installs chromium and sets environment variables

### Issue: Out of memory
**Solution**: Increase Cloud Run memory to 2Gi or 4Gi

### Issue: Timeout errors
**Solution**: Increase timeout to 300s or 600s

### Issue: Database connection fails
**Solution**: Use Cloud SQL Proxy or connection string with SSL

## Security Best Practices

1. Use Secret Manager for sensitive data
2. Enable Cloud Armor for DDoS protection
3. Set up VPC for database access
4. Use service accounts with minimal permissions
5. Enable audit logging

## Scaling Configuration

```bash
# Set autoscaling
gcloud run services update careerpilot-ai \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --region us-central1
```

## Backup Strategy

```bash
# Backup Cloud SQL
gcloud sql backups create \
  --instance=careerpilot-db

# Backup Cloud Storage
gsutil -m rsync -r gs://careerpilot-screenshots gs://careerpilot-screenshots-backup
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service careerpilot-ai --region us-central1

# Rollback to previous revision
gcloud run services update-traffic careerpilot-ai \
  --to-revisions=careerpilot-ai-00001-abc=100 \
  --region us-central1
```

## Demo URL

After deployment, your app will be available at:
```
https://careerpilot-ai-[hash].run.app
```

Share this URL for hackathon submission!

## Support

For issues, check:
- Cloud Run logs: `gcloud run logs read`
- Cloud Build history: `gcloud builds list`
- Service status: `gcloud run services describe`
