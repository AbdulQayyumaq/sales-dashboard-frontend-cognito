#!/bin/bash

# Sales Dashboard Frontend Deployment Script for Linux/Mac
# Usage: ./scripts/deploy.sh [--dry-run] [--skip-build] [--force]

set -e  # Exit on any error

# Default values
CONFIG_FILE="scripts/deploy-config.json"
SKIP_BUILD=false
DRY_RUN=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--config FILE] [--skip-build] [--dry-run] [--force]"
            echo "  --config FILE    Configuration file path (default: scripts/deploy-config.json)"
            echo "  --skip-build     Skip the build step"
            echo "  --dry-run        Show what would be done without making changes"
            echo "  --force          Force deployment without confirmation"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Color output functions
write_color_output() {
    local message="$1"
    local color="$2"
    
    case $color in
        "Green")
            echo -e "\033[32m$message\033[0m"
            ;;
        "Yellow")
            echo -e "\033[33m$message\033[0m"
            ;;
        "Red")
            echo -e "\033[31m$message\033[0m"
            ;;
        "Cyan")
            echo -e "\033[36m$message\033[0m"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Load configuration
load_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        write_color_output "Configuration file not found: $CONFIG_FILE" "Red"
        exit 1
    fi
    
    # Parse JSON configuration using Python (more universally available than jq)
    AWS_PROFILE=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['aws']['profile'])" 2>/dev/null || python -c "import json; print(json.load(open('$CONFIG_FILE'))['aws']['profile'])")
    AWS_REGION=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['aws']['region'])" 2>/dev/null || python -c "import json; print(json.load(open('$CONFIG_FILE'))['aws']['region'])")
    S3_BUCKET=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['s3']['bucket'])" 2>/dev/null || python -c "import json; print(json.load(open('$CONFIG_FILE'))['s3']['bucket'])")
    CLOUDFRONT_DISTRIBUTION=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['cloudfront']['distribution_id'])" 2>/dev/null || python -c "import json; print(json.load(open('$CONFIG_FILE'))['cloudfront']['distribution_id'])")
    CUSTOM_DOMAIN=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['cloudfront']['custom_domain'])" 2>/dev/null || python -c "import json; print(json.load(open('$CONFIG_FILE'))['cloudfront']['custom_domain'])")
    
    if [[ -z "$AWS_PROFILE" || -z "$S3_BUCKET" ]]; then
        write_color_output "Invalid configuration file" "Red"
        exit 1
    fi
}

# Test prerequisites
test_prerequisites() {
    write_color_output "Checking prerequisites..." "Cyan"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        write_color_output "Node.js is not installed" "Red"
        exit 1
    fi
    NODE_VERSION=$(node --version)
    write_color_output "Node.js: $NODE_VERSION" "Green"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        write_color_output "npm is not installed" "Red"
        exit 1
    fi
    NPM_VERSION=$(npm --version)
    write_color_output "npm: $NPM_VERSION" "Green"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        write_color_output "AWS CLI is not installed" "Red"
        exit 1
    fi
    AWS_VERSION=$(aws --version 2>&1 | head -n1)
    write_color_output "AWS CLI: $AWS_VERSION" "Green"
    
    # Check Python for JSON parsing
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        write_color_output "Python is not installed (required for JSON parsing)" "Red"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &> /dev/null; then
        write_color_output "AWS credentials not configured for profile: $AWS_PROFILE" "Red"
        exit 1
    fi
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query 'Account' --output text)
    write_color_output "AWS Profile: $AWS_PROFILE (Account: $AWS_ACCOUNT)" "Green"
}

# Build application
build_application() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        write_color_output "Skipping build step" "Yellow"
        return
    fi
    
    write_color_output "Installing dependencies..." "Cyan"
    if ! npm install --legacy-peer-deps; then
        write_color_output "npm install failed" "Red"
        exit 1
    fi
    
    write_color_output "Building application..." "Cyan"
    if ! npm run build; then
        write_color_output "Build failed" "Red"
        exit 1
    fi
    
    if [[ ! -d ".next" ]]; then
        write_color_output "Build directory not found" "Red"
        exit 1
    fi
}

# Deploy to S3
deploy_to_s3() {
    write_color_output "Deploying to S3..." "Cyan"
    
    if [[ ! -d ".next" ]]; then
        write_color_output "Build directory not found. Run build first." "Red"
        exit 1
    fi
    
    write_color_output "Uploading static assets..." "Cyan"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        write_color_output "[DRY RUN] Would upload: .next/static -> s3://$S3_BUCKET/_next/static/" "Yellow"
    else
        aws s3 sync .next/static "s3://$S3_BUCKET/_next/static/" \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION" \
            --cache-control "public, max-age=31536000, immutable"
        
        if [[ $? -ne 0 ]]; then
            write_color_output "Failed to upload to S3" "Red"
            exit 1
        fi
        
        write_color_output "S3 deployment completed" "Green"
    fi
}

# Invalidate CloudFront
invalidate_cloudfront() {
    write_color_output "Invalidating CloudFront cache..." "Cyan"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        write_color_output "[DRY RUN] Would invalidate CloudFront distribution: $CLOUDFRONT_DISTRIBUTION" "Yellow"
    else
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION" \
            --paths "/*" \
            --profile "$AWS_PROFILE" \
            --query 'Invalidation.Id' \
            --output text)
        
        if [[ $? -eq 0 ]]; then
            write_color_output "CloudFront invalidation created: $INVALIDATION_ID" "Green"
        else
            write_color_output "Failed to create CloudFront invalidation" "Red"
            exit 1
        fi
    fi
}

# Main deployment function
start_deployment() {
    write_color_output "Sales Dashboard Frontend Deployment" "Cyan"
    write_color_output "====================================" "Cyan"
    
    load_config
    
    write_color_output "Configuration loaded from $CONFIG_FILE" "Green"
    write_color_output "Deployment Configuration:" "Cyan"
    write_color_output "AWS Profile: $AWS_PROFILE" "Green"
    write_color_output "AWS Region: $AWS_REGION" "Green"
    write_color_output "S3 Bucket: $S3_BUCKET" "Green"
    write_color_output "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION" "Green"
    write_color_output "Custom Domain: $CUSTOM_DOMAIN" "Green"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        write_color_output "DRY RUN MODE - No actual changes will be made" "Yellow"
    fi
    
    test_prerequisites
    build_application
    deploy_to_s3
    invalidate_cloudfront
    
    write_color_output "Deployment completed successfully!" "Green"
    write_color_output "Your application is available at:" "Cyan"
    write_color_output "Production: https://$CUSTOM_DOMAIN" "Green"
    
    # Get CloudFront domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION" \
        --profile "$AWS_PROFILE" \
        --query 'Distribution.DomainName' \
        --output text 2>/dev/null || echo "unknown")
    
    if [[ "$CLOUDFRONT_DOMAIN" != "unknown" ]]; then
        write_color_output "CloudFront: https://$CLOUDFRONT_DOMAIN" "Green"
    fi
    
    write_color_output "S3 Website: http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com" "Green"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        write_color_output "Note: CloudFront invalidation may take 5-15 minutes to complete globally" "Yellow"
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    start_deployment
fi