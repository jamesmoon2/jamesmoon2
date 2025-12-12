# AWS S3 Deployment Guide

This application is a fully static website and can be easily hosted on AWS S3 with optional CloudFront CDN.

## ✅ Why This Works on S3

- **100% Static**: No server-side code, databases, or backend required
- **No Build Process**: Files work as-is, no compilation needed
- **ES6 Modules**: Modern browsers support ES6 modules natively
- **CDN Resources**: D3.js loads from external CDN
- **Fast & Cheap**: S3 + CloudFront is cost-effective for static sites

## 🚀 Deployment Methods

### Method 1: AWS Console (Easiest)

#### Step 1: Create S3 Bucket
```bash
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Bucket name: florida-civil-procedure (must be globally unique)
4. Region: Choose your preferred region
5. Uncheck "Block all public access"
   ⚠️ Confirm you want public access
6. Click "Create bucket"
```

#### Step 2: Upload Files
```bash
1. Open your bucket
2. Click "Upload"
3. Drag and drop ALL files from florida-civil-procedure/:
   - index.html
   - package.json
   - README.md
   - css/styles.css
   - js/app.js
   - js/chart.js
   - js/controls.js
   - js/data.js
   - js/utils.js
4. Click "Upload"
```

#### Step 3: Enable Static Website Hosting
```bash
1. Go to bucket "Properties" tab
2. Scroll to "Static website hosting"
3. Click "Edit"
4. Enable static website hosting
5. Index document: index.html
6. Error document: index.html (optional)
7. Click "Save changes"
8. Note the "Bucket website endpoint" URL
```

#### Step 4: Set Bucket Policy (Make Public)
```bash
1. Go to bucket "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste the policy below (replace YOUR-BUCKET-NAME)
5. Click "Save changes"
```

**Bucket Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

#### Step 5: Configure MIME Types (Important for ES6 Modules)
S3 automatically sets correct MIME types, but verify:
- `.js` files → `application/javascript` or `text/javascript`
- `.css` files → `text/css`
- `.html` files → `text/html`

If needed, set metadata manually:
```bash
1. Select a .js file
2. Click "Actions" → "Edit metadata"
3. Add: Content-Type = application/javascript
4. Repeat for all .js files if needed
```

#### Step 6: Access Your Site
Your site is now live at:
```
http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

Example:
```
http://florida-civil-procedure.s3-website-us-east-1.amazonaws.com
```

---

### Method 2: AWS CLI (Recommended for Updates)

#### Prerequisites
```bash
# Install AWS CLI
# https://aws.amazon.com/cli/

# Configure credentials
aws configure
```

#### Deploy Script
```bash
#!/bin/bash

BUCKET_NAME="florida-civil-procedure"
REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html

# Upload files
aws s3 sync . s3://$BUCKET_NAME \
    --exclude ".git/*" \
    --exclude ".gitignore" \
    --exclude "DEPLOYMENT.md" \
    --exclude "README.md" \
    --exclude "package.json" \
    --exclude ".DS_Store" \
    --exclude "deploy.sh"

# Set correct content types for JS modules
aws s3 cp s3://$BUCKET_NAME/js/ s3://$BUCKET_NAME/js/ \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

# Make bucket public
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy.json

echo "Deployed to: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

Save bucket policy to `bucket-policy.json`:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::florida-civil-procedure/*"
        }
    ]
}
```

---

### Method 3: S3 + CloudFront (Production-Ready)

For HTTPS, custom domain, and better performance:

#### Step 1: Create CloudFront Distribution
```bash
1. Go to CloudFront console
2. Click "Create distribution"
3. Origin domain: YOUR-BUCKET-NAME.s3.amazonaws.com
4. Origin access: Public (or use OAC for better security)
5. Viewer protocol policy: Redirect HTTP to HTTPS
6. Allowed HTTP methods: GET, HEAD, OPTIONS
7. Cache policy: CachingOptimized
8. Click "Create distribution"
9. Wait 10-15 minutes for deployment
```

#### Step 2: Custom Domain (Optional)
```bash
1. In CloudFront distribution settings
2. Alternate domain names (CNAMEs): procedure.yourdomain.com
3. Request SSL certificate via AWS Certificate Manager
4. Update Route 53 or your DNS:
   - Type: CNAME or A (Alias)
   - Value: CloudFront distribution domain
```

#### CloudFront Benefits
- ✅ **HTTPS** - Free SSL certificate
- ✅ **Global CDN** - Faster worldwide
- ✅ **Custom Domain** - Your own domain name
- ✅ **Caching** - Better performance
- ✅ **DDoS Protection** - AWS Shield
- ✅ **Cost** - Often cheaper than S3 alone

---

## 🔧 Configuration Files

### Deploy Script (`deploy.sh`)
```bash
#!/bin/bash
set -e

BUCKET_NAME="${1:-florida-civil-procedure}"
REGION="${2:-us-east-1}"

echo "Deploying to S3 bucket: $BUCKET_NAME"

# Sync files
aws s3 sync . s3://$BUCKET_NAME \
    --delete \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude ".gitignore" \
    --exclude "deploy.sh" \
    --exclude "package.json" \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html"

# Upload index.html without cache
aws s3 cp index.html s3://$BUCKET_NAME/index.html \
    --cache-control "public, max-age=0, must-revalidate"

# Set JS MIME type
aws s3 cp s3://$BUCKET_NAME/js/ s3://$BUCKET_NAME/js/ \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000"

echo "✅ Deployment complete!"
echo "URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

### Invalidate CloudFront Cache
```bash
#!/bin/bash
DISTRIBUTION_ID="YOUR_DISTRIBUTION_ID"

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
```

---

## 📋 Pre-Deployment Checklist

- [ ] AWS account created and configured
- [ ] Bucket name chosen (must be globally unique)
- [ ] Region selected
- [ ] Files ready to upload
- [ ] Bucket policy prepared
- [ ] (Optional) Domain name ready
- [ ] (Optional) SSL certificate requested

---

## 💰 Cost Estimate

**S3 Only:**
- Storage: ~$0.023/GB/month (negligible for ~500KB site)
- Requests: $0.0004 per 1,000 GET requests
- Data transfer: $0.09/GB

**S3 + CloudFront:**
- S3 storage: Same as above
- CloudFront: First 1TB free tier, then $0.085/GB
- SSL certificate: FREE via AWS Certificate Manager

**Estimated monthly cost for low-traffic site:** $0.50 - $5.00

---

## 🔒 Security Best Practices

### 1. Use CloudFront Origin Access Control (OAC)
Instead of making bucket public:
```bash
1. Create OAC in CloudFront
2. Update bucket policy to allow only CloudFront
3. Users access via CloudFront only (HTTPS)
```

### 2. Enable S3 Versioning
```bash
aws s3api put-bucket-versioning \
    --bucket florida-civil-procedure \
    --versioning-configuration Status=Enabled
```

### 3. Enable Server Access Logging
```bash
1. Create logging bucket
2. Enable access logging on main bucket
3. Monitor access patterns
```

### 4. Set CORS (if accessing from other domains)
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

---

## 🐛 Troubleshooting

### Issue: "Access Denied" Error
**Solution:** Check bucket policy and public access settings

### Issue: JavaScript Files Not Loading
**Solution:**
1. Check MIME type is `application/javascript`
2. Verify CORS if accessing from different domain
3. Check browser console for module errors

### Issue: 404 Errors
**Solution:** Verify static website hosting is enabled and index.html is set

### Issue: Blank Page
**Solution:**
1. Check browser console for errors
2. Verify D3.js CDN is accessible
3. Check that ES6 modules are supported in browser

### Issue: CloudFront Showing Old Version
**Solution:** Create cache invalidation for `/*`

---

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          cd florida-civil-procedure
          aws s3 sync . s3://florida-civil-procedure --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## 📚 Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
- [S3 Pricing Calculator](https://calculator.aws/)

---

## ✅ Quick Start Commands

```bash
# 1. Upload to S3
aws s3 sync florida-civil-procedure/ s3://YOUR-BUCKET-NAME --delete

# 2. Make public
aws s3api put-bucket-policy --bucket YOUR-BUCKET-NAME --policy file://policy.json

# 3. Enable website
aws s3 website s3://YOUR-BUCKET-NAME --index-document index.html

# Done! Visit:
# http://YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com
```

---

**Need Help?** Check the troubleshooting section or AWS documentation.
