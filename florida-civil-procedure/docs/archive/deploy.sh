#!/bin/bash
# Deploy Florida Civil Procedure Visualization to AWS S3
# Usage: ./deploy.sh [bucket-name] [region]

set -e

# Configuration
BUCKET_NAME="${1:-florida-civil-procedure}"
REGION="${2:-us-east-1}"
DISTRIBUTION_ID="${3:-}"

echo "🚀 Deploying Florida Civil Procedure Visualization to S3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ ERROR: AWS CLI is not installed"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ ERROR: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✓ AWS CLI configured"
echo ""

# Check if bucket exists, create if not
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "📦 Creating S3 bucket: $BUCKET_NAME"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"

    echo "🌐 Enabling static website hosting"
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html

    echo "🔓 Setting bucket policy for public access"
    cat > /tmp/bucket-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json

    rm /tmp/bucket-policy.json
    echo "✓ Bucket created and configured"
else
    echo "✓ Using existing bucket: $BUCKET_NAME"
fi

echo ""
echo "📤 Uploading files to S3..."

# Sync all files except index.html (we'll upload that separately)
aws s3 sync . "s3://$BUCKET_NAME" \
    --delete \
    --exclude ".git/*" \
    --exclude ".gitignore" \
    --exclude "*.md" \
    --exclude "package.json" \
    --exclude "deploy.sh" \
    --exclude ".DS_Store" \
    --exclude "index.html" \
    --exclude "bucket-policy.json" \
    --cache-control "public, max-age=31536000"

# Upload index.html without long-term cache
aws s3 cp index.html "s3://$BUCKET_NAME/index.html" \
    --cache-control "public, max-age=0, must-revalidate"

echo "✓ Files uploaded"
echo ""

# Set correct MIME types for JavaScript modules
echo "🔧 Setting correct MIME types for ES6 modules..."
aws s3 cp "s3://$BUCKET_NAME/js/" "s3://$BUCKET_NAME/js/" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000"

echo "✓ MIME types configured"
echo ""

# Invalidate CloudFront cache if distribution ID provided
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text
    echo "✓ CloudFront cache invalidated"
    echo ""
fi

# Get the website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌍 Your site is live at:"
echo "   $WEBSITE_URL"
echo ""

if [ -n "$DISTRIBUTION_ID" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text 2>/dev/null || echo "")
    if [ -n "$CLOUDFRONT_DOMAIN" ]; then
        echo "🚀 CloudFront URL:"
        echo "   https://$CLOUDFRONT_DOMAIN"
        echo ""
    fi
fi

echo "💡 Next steps:"
echo "   • Visit the URL above to view your site"
echo "   • Set up CloudFront for HTTPS (see DEPLOYMENT.md)"
echo "   • Configure a custom domain (optional)"
echo ""

exit 0
