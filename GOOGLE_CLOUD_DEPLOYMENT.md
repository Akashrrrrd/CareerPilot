# Google Cloud Deployment Guide

## ✅ Your Setup Status

Your CareerPilot AI application is **READY** for Google Cloud deployment with:
- ✅ Cloud Run configuration
- ✅ Cloud Build CI/CD pipeline
- ✅ Dockerfile optimized for production
- ✅ MongoDB Atlas (external database - allowed!)
- ✅ Gemini API integration

## Architecture

```
┌────────────────────────────────────────┐
│         Google Cloud Platform          │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       Cloud Run                  │  │
│  │  (Next.js Backend + Frontend)    │  │
│  │  - API Routes                    │  │
│  │  - Server Components             │  │
│  │  - Gemini AI Agent               │  │
│  └──────────────┬───────────────────┘  │
│                 │                      │
│  ┌──────────────▼───────────────────┐  │
│  │    Cloud Build (CI/CD)           │  │
│  │  - Automated deployments         │  │
│  │  - Container builds              │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │    Secret Manager                │  │
│  │  - GEMINI_API_KEY                │  │
│  │  - MONGODB_URI                   │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
                 │
                 │ (External)
                 ▼
        ┌────────────────┐
        │ MongoDB Atlas  │
        │   (Database)   │
        └────────────────┘
```

## Prerequisites

1. Google Cloud account
2. Project ID: `careerpilot-ai-489008` (or your project ID)
3. MongoDB Atlas connection string (already configured)
4. Gemini API key

## Deployment Steps

### 1. Install Google Cloud CLI

```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### 2. Initialize and Login

```bash
gcloud init
gcloud auth login
gcloud config set project careerpilot-ai-489008
```

### 3. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 4. Create Secrets in Secret Manager

```bash
# Create Gemini API Key secret
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Create MongoDB URI secret
echo -n "YOUR_MONGODB_CONNECTION_STRING" | gcloud secrets create mongodb-uri --data-file=-
```

### 5. Deploy to Cloud Run

#### Option A: Using Cloud Build (Recommended - Automated CI/CD)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# This will:
# 1. Build Docker container
# 2. Push to Container Registry
# 3. Deploy to Cloud Run automatically
```

#### Option B: Manual Deployment

```bash
# Build the container
gcloud builds submit --tag gcr.io/careerpilot-ai-489008/careerpilot-ai

# Deploy to Cloud Run
gcloud run deploy careerpilot-ai \
  --image gcr.io/careerpilot-ai-489008/careerpilot-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0 \
  --set-secrets GOOGLE_GEMINI_API_KEY=gemini-api-key:latest,MONGODB_URI=mongodb-uri:latest \
  --set-env-vars GOOGLE_CLOUD_PROJECT_ID=careerpilot-ai-489008,NODE_ENV=production
```

### 6. Get Your Deployment URL

```bash
gcloud run services describe careerpilot-ai --region us-central1 --format 'value(status.url)'
```

Your app will be available at: `https://careerpilot-ai-XXXXXXXX-uc.a.run.app`

## Environment Variables

The following are automatically configured in Cloud Run:

- `GOOGLE_GEMINI_API_KEY` - From Secret Manager
- `MONGODB_URI` - From Secret Manager
- `GOOGLE_CLOUD_PROJECT_ID` - Your project ID
- `NODE_ENV` - Set to "production"
- `PORT` - Automatically set by Cloud Run (3000)

## Monitoring & Logs

### View Logs
```bash
gcloud run services logs read careerpilot-ai --region us-central1
```

### View Metrics
```bash
# Open Cloud Console
gcloud run services describe careerpilot-ai --region us-central1
```

Or visit: https://console.cloud.google.com/run

## Cost Optimization

Your current configuration:
- **Memory**: 2GB
- **CPU**: 2 vCPU
- **Min instances**: 0 (scales to zero when not in use)
- **Max instances**: 10

**Estimated costs** (with free tier):
- First 2 million requests/month: FREE
- After that: ~$0.40 per million requests
- Compute time: ~$0.00002400 per vCPU-second

## Hackathon Requirements ✅

Your deployment satisfies ALL requirements:

1. ✅ **Leverages Gemini model** - Using Gemini Vision API
2. ✅ **Built with Google GenAI SDK** - Implemented in `lib/agent/gemini-client.ts`
3. ✅ **Uses Google Cloud service** - Cloud Run (compute) + Cloud Build (CI/CD)
4. ✅ **UI Navigator category** - Visual UI understanding with Gemini Vision
5. ✅ **Backend hosted on Google Cloud** - Cloud Run deployment

**Database**: MongoDB Atlas is external but ALLOWED - the requirement is "at least one Google Cloud service", not "all services must be Google Cloud"

## Troubleshooting

### Build fails
```bash
# Check build logs
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]
```

### Service not accessible
```bash
# Check service status
gcloud run services describe careerpilot-ai --region us-central1

# Check IAM permissions
gcloud run services get-iam-policy careerpilot-ai --region us-central1
```

### Update secrets
```bash
# Update Gemini API key
echo -n "NEW_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

# Update MongoDB URI
echo -n "NEW_MONGODB_URI" | gcloud secrets versions add mongodb-uri --data-file=-
```

## Continuous Deployment

To enable automatic deployments on git push:

1. Connect your GitHub repository to Cloud Build
2. Create a trigger:
```bash
gcloud builds triggers create github \
  --repo-name=careerpilot-ai \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

Now every push to `main` branch will automatically deploy!

## Support

- Cloud Run docs: https://cloud.google.com/run/docs
- Cloud Build docs: https://cloud.google.com/build/docs
- Gemini API docs: https://ai.google.dev/docs

## Summary

Your application is **production-ready** for Google Cloud deployment. The backend (Next.js API routes + Gemini AI agent) runs on Cloud Run, which fully satisfies the hackathon requirement of hosting on Google Cloud Platform.
