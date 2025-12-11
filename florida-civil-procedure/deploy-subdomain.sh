#!/bin/bash
# Deploy Florida Civil Procedure to jamescmooney.com subdomain
# This script helps set up the subdomain approach

set -e

echo "🌐 Florida Civil Procedure - Custom Subdomain Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get subdomain from user or use default
SUBDOMAIN="${1:-procedure}"
BASE_DOMAIN="jamescmooney.com"
FULL_DOMAIN="$SUBDOMAIN.$BASE_DOMAIN"
REGION="us-east-1"

echo "Configuration:"
echo "  Subdomain: $SUBDOMAIN"
echo "  Full domain: $FULL_DOMAIN"
echo "  Region: $REGION"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ ERROR: AWS CLI not installed"
    echo "Install from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ ERROR: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✓ AWS CLI configured"
echo ""

# Step 1: Create S3 bucket with exact subdomain name
echo "📦 Step 1: Creating S3 bucket ($FULL_DOMAIN)..."
if aws s3 ls "s3://$FULL_DOMAIN" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$FULL_DOMAIN" --region "$REGION"
    echo "✓ Bucket created"
else
    echo "✓ Bucket already exists"
fi

# Step 2: Enable static website hosting
echo ""
echo "🌐 Step 2: Enabling static website hosting..."
aws s3 website "s3://$FULL_DOMAIN" \
    --index-document index.html \
    --error-document index.html
echo "✓ Static website hosting enabled"

# Step 3: Set bucket policy
echo ""
echo "🔓 Step 3: Setting bucket policy..."
cat > /tmp/bucket-policy-$$.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$FULL_DOMAIN/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$FULL_DOMAIN" \
    --policy file:///tmp/bucket-policy-$$.json

rm /tmp/bucket-policy-$$.json
echo "✓ Bucket policy configured"

# Step 4: Upload files
echo ""
echo "📤 Step 4: Uploading files..."

# Upload all files except index.html with long cache
aws s3 sync . "s3://$FULL_DOMAIN" \
    --delete \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "*.sh" \
    --exclude "package.json" \
    --exclude ".gitignore" \
    --exclude "bucket-policy*" \
    --exclude "index.html" \
    --cache-control "public, max-age=31536000"

# Upload index.html without cache
aws s3 cp index.html "s3://$FULL_DOMAIN/index.html" \
    --cache-control "public, max-age=0, must-revalidate"

echo "✓ Files uploaded"

# Step 5: Set correct MIME types for JS modules
echo ""
echo "🔧 Step 5: Configuring MIME types for ES6 modules..."
aws s3 cp "s3://$FULL_DOMAIN/js/" "s3://$FULL_DOMAIN/js/" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000"
echo "✓ MIME types configured"

# Get S3 website URL
S3_URL="http://$FULL_DOMAIN.s3-website-$REGION.amazonaws.com"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ S3 Bucket Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. REQUEST SSL CERTIFICATE (Required for HTTPS)"
echo "   → Go to AWS Certificate Manager (us-east-1 region)"
echo "   → Request certificate for: $FULL_DOMAIN"
echo "   → Use DNS validation"
echo "   → Add the CNAME record to your DNS"
echo ""
echo "2. CREATE CLOUDFRONT DISTRIBUTION"
echo "   → Go to CloudFront console"
echo "   → Create distribution"
echo "   → Origin: $FULL_DOMAIN.s3.amazonaws.com"
echo "   → Alternate domain (CNAME): $FULL_DOMAIN"
echo "   → SSL certificate: Select certificate from step 1"
echo "   → Wait 10-15 minutes for deployment"
echo ""
echo "3. UPDATE DNS RECORDS"
echo "   → Go to your DNS provider (Route 53, GoDaddy, etc.)"
echo "   → Add CNAME record:"
echo "     Type: CNAME"
echo "     Name: $SUBDOMAIN"
echo "     Value: [CloudFront domain from step 2]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Temporary S3 URL (HTTP only - for testing):"
echo "   $S3_URL"
echo ""
echo "🌐 Final URL (after completing steps above):"
echo "   https://$FULL_DOMAIN"
echo ""
echo "📖 Full instructions: See CUSTOM-DOMAIN.md"
echo ""

# Save info to file
cat > deployment-info.txt <<EOF
Florida Civil Procedure Deployment Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Configuration:
  Full Domain: $FULL_DOMAIN
  S3 Bucket: $FULL_DOMAIN
  Region: $REGION

S3 Website URL (HTTP):
  $S3_URL

Next Steps:
  1. Request SSL certificate for $FULL_DOMAIN in ACM (us-east-1)
  2. Create CloudFront distribution
     - Origin: $FULL_DOMAIN.s3.amazonaws.com
     - CNAME: $FULL_DOMAIN
  3. Add DNS CNAME record:
     - Name: $SUBDOMAIN
     - Value: [CloudFront domain]

Final URL:
  https://$FULL_DOMAIN

Deployed: $(date)
EOF

echo "💾 Deployment info saved to: deployment-info.txt"
echo ""
