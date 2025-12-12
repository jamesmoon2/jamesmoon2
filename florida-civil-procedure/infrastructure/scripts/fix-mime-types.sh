#!/bin/bash
# Fix MIME types for files in S3 bucket
# This is needed because CDK BucketDeployment doesn't always set correct content types

BUCKET_NAME="law-jamescmooney-com-website"

echo "Fixing MIME types in S3 bucket: $BUCKET_NAME"

# Fix CSS files
echo "Fixing CSS files..."
aws s3 cp s3://$BUCKET_NAME/css/ s3://$BUCKET_NAME/css/ \
  --recursive \
  --exclude "*" \
  --include "*.css" \
  --content-type "text/css" \
  --metadata-directive REPLACE

# Fix JavaScript files
echo "Fixing JavaScript files..."
aws s3 cp s3://$BUCKET_NAME/js/ s3://$BUCKET_NAME/js/ \
  --recursive \
  --exclude "*" \
  --include "*.js" \
  --content-type "application/javascript" \
  --metadata-directive REPLACE

# Fix HTML files
echo "Fixing HTML files..."
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --content-type "text/html" \
  --metadata-directive REPLACE

echo "MIME types fixed!"
echo "Now invalidating CloudFront cache..."

# Get distribution ID from CloudFormation stack outputs
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name FloridaCivilProcedureStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
  --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
  echo "CloudFront cache invalidation started for distribution: $DISTRIBUTION_ID"
else
  echo "Warning: Could not find CloudFront distribution ID"
fi

echo "Done!"
