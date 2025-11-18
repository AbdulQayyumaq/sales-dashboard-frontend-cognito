$ErrorActionPreference = 'Stop'

param(
  [switch]$SkipBuild,
  [switch]$DryRun
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir '..')

$BUCKET_NAME = if ($env:BUCKET_NAME) { $env:BUCKET_NAME } else { 'your-bucket' }
$DISTRIBUTION_ID = if ($env:DISTRIBUTION_ID) { $env:DISTRIBUTION_ID } else { 'YOUR_DISTRIBUTION_ID' }
$AWS_PROFILE = if ($env:AWS_PROFILE) { $env:AWS_PROFILE } else { 'default' }

if ([string]::IsNullOrEmpty($BUCKET_NAME) -or $BUCKET_NAME -eq 'your-bucket') { Write-Error 'Set BUCKET_NAME' }
if ([string]::IsNullOrEmpty($DISTRIBUTION_ID) -or $DISTRIBUTION_ID -eq 'YOUR_DISTRIBUTION_ID') { Write-Error 'Set DISTRIBUTION_ID' }

if (-not $SkipBuild) {
  npm install --force
  npm run build
}

$hasExport = node -p "Boolean(require('./package.json').scripts && require('./package.json').scripts.export)"
:

$dryArg = if ($DryRun) { '--dryrun' } else { '' }

if (Test-Path 'out') {
  aws s3 sync 'out' "s3://$BUCKET_NAME" --exclude "*.html" --delete --profile $AWS_PROFILE $dryArg --cache-control "public, max-age=31536000, immutable"
  aws s3 sync 'out' "s3://$BUCKET_NAME" --include "*.html" --exclude "*" --delete --profile $AWS_PROFILE $dryArg --cache-control "no-cache"
} else {
  aws s3 sync '.next/static' "s3://$BUCKET_NAME/_next/static/" --profile $AWS_PROFILE $dryArg --cache-control "public, max-age=31536000, immutable"
  if (Test-Path 'public') { aws s3 sync 'public' "s3://$BUCKET_NAME" --profile $AWS_PROFILE $dryArg --cache-control "public, max-age=31536000, immutable" }
}

if (-not $DryRun) {
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --profile $AWS_PROFILE --paths '/*'
} else {
  Write-Output 'Dry-run: skipping CloudFront invalidation'
}