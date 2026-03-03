#!/bin/bash
# Automated deployment script for CareerPilot AI
# This script demonstrates infrastructure-as-code for hackathon bonus points

set -e

echo "🚀 CareerPilot AI - Automated Deployment Script"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}Error: gcloud CLI not found. Please install it first.${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker not found. Please install it first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All requirements met${NC}"
}

# Get project ID
get_project_id() {
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(gcloud config get-value project)
        if [ -z "$PROJECT_ID" ]; then
            echo -e "${RED}Error: No project ID set. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}Using project: $PROJECT_ID${NC}"
}

# Enable required APIs
enable_apis() {
    echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
    
    gcloud services enable \
        run.googleapis.com \
        cloudbuild.googleapis.com \
        secretmanager.googleapis.com \
        storage.googleapis.com \
        sqladmin.googleapis.com \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓ APIs enabled${NC}"
}

# Create secrets
create_secrets() {
    echo -e "${YELLOW}Setting up secrets...${NC}"
    
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}Error: GEMINI_API_KEY environment variable not set${NC}"
        exit 1
    fi
    
    # Create Gemini API key secret
    echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key \
        --data-file=- \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓ Secrets configured${NC}"
}

# Create storage buckets
create_buckets() {
    echo -e "${YELLOW}Creating Cloud Storage buckets...${NC}"
    
    gsutil mb -p $PROJECT_ID -l us-central1 gs://${PROJECT_ID}-screenshots 2>/dev/null || true
    gsutil mb -p $PROJECT_ID -l us-central1 gs://${PROJECT_ID}-resumes 2>/dev/null || true
    
    echo -e "${GREEN}✓ Storage buckets ready${NC}"
}

# Build and push container
build_container() {
    echo -e "${YELLOW}Building container image...${NC}"
    
    gcloud builds submit \
        --tag gcr.io/$PROJECT_ID/careerpilot-ai \
        --project=$PROJECT_ID \
        .
    
    echo -e "${GREEN}✓ Container built and pushed${NC}"
}

# Deploy to Cloud Run
deploy_cloud_run() {
    echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
    
    gcloud run deploy careerpilot-ai \
        --image gcr.io/$PROJECT_ID/careerpilot-ai \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --timeout 300 \
        --max-instances 10 \
        --min-instances 0 \
        --set-secrets="GOOGLE_GEMINI_API_KEY=gemini-api-key:latest" \
        --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,NODE_ENV=production,GOOGLE_CLOUD_STORAGE_BUCKET=${PROJECT_ID}-screenshots" \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓ Deployed to Cloud Run${NC}"
}

# Get service URL
get_service_url() {
    SERVICE_URL=$(gcloud run services describe careerpilot-ai \
        --platform managed \
        --region us-central1 \
        --format 'value(status.url)' \
        --project=$PROJECT_ID)
    
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "Service URL: ${YELLOW}$SERVICE_URL${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit the URL above to test your application"
    echo "2. Check logs: gcloud run logs read careerpilot-ai --region us-central1"
    echo "3. Monitor: https://console.cloud.google.com/run"
    echo ""
}

# Main execution
main() {
    check_requirements
    get_project_id
    enable_apis
    create_secrets
    create_buckets
    build_container
    deploy_cloud_run
    get_service_url
}

# Run main function
main
