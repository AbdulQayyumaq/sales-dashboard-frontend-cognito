#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

BUCKET_NAME=salesgames-cervontcare-com
DISTRIBUTION_ID=E1C6PZA0JN3AAN
AWS_PROFILE=cervont

SKIP_BUILD=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "$BUCKET_NAME" || "$BUCKET_NAME" == "your-bucket" ]]; then
  echo "Set BUCKET_NAME"
  exit 1
fi
if [[ -z "$DISTRIBUTION_ID" || "$DISTRIBUTION_ID" == "YOUR_DISTRIBUTION_ID" ]]; then
  echo "Set DISTRIBUTION_ID"
  exit 1
fi

if [[ "$SKIP_BUILD" != "true" ]]; then
  npm install --force
  npm run build
fi

:

DRYRUN_FLAG=""
if [[ "$DRY_RUN" == "true" ]]; then
  DRYRUN_FLAG="--dryrun"
fi

if [[ -d "out" ]]; then
  aws s3 sync out "s3://$BUCKET_NAME" --exclude "*.html" --delete --profile "$AWS_PROFILE" $DRYRUN_FLAG --cache-control "public, max-age=31536000, immutable"
  aws s3 sync out "s3://$BUCKET_NAME" --include "*.html" --exclude "*" --delete --profile "$AWS_PROFILE" $DRYRUN_FLAG --cache-control "no-cache"
else
  aws s3 sync .next/static "s3://$BUCKET_NAME/_next/static/" --profile "$AWS_PROFILE" $DRYRUN_FLAG --cache-control "public, max-age=31536000, immutable"
  if [[ -d "public" ]]; then
    aws s3 sync public "s3://$BUCKET_NAME" --profile "$AWS_PROFILE" $DRYRUN_FLAG --cache-control "public, max-age=31536000, immutable"
  fi
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry-run: skipping CloudFront invalidation"
else
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --profile "$AWS_PROFILE" --paths "/*"
fi