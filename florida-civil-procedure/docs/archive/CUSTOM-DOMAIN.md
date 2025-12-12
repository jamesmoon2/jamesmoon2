# Hosting on jamescmooney.com Domain

This guide covers hosting the Florida Civil Procedure visualization on your existing jamescmooney.com domain.

## 🎯 Recommended Approach: Subdomain

**Best option:** `procedure.jamescmooney.com` or `florida.jamescmooney.com`

### Why Subdomain Works Best
- ✅ Clean separation from main site
- ✅ Independent S3 bucket and CloudFront distribution
- ✅ Easy to manage and update
- ✅ Can stay "unlisted" - only accessible via direct link
- ✅ Full HTTPS support via AWS Certificate Manager (free)
- ✅ No changes needed to main site

---

## Option 1: Subdomain Setup (RECOMMENDED)

### Step 1: Choose Your Subdomain
Pick one of these (or create your own):
- `procedure.jamescmooney.com` ← Recommended
- `florida.jamescmooney.com`
- `civil.jamescmooney.com`
- `legal.jamescmooney.com`

For this guide, I'll use `procedure.jamescmooney.com`

### Step 2: Create S3 Bucket with Exact Subdomain Name

**Important:** The bucket name MUST match your subdomain exactly.

```bash
# Create bucket (use your chosen subdomain)
aws s3 mb s3://procedure.jamescmooney.com --region us-east-1

# Enable static website hosting
aws s3 website s3://procedure.jamescmooney.com \
    --index-document index.html \
    --error-document index.html
```

Or use the deployment script:
```bash
cd florida-civil-procedure
./deploy.sh procedure.jamescmooney.com us-east-1
```

### Step 3: Request SSL Certificate (AWS Certificate Manager)

**Important:** Must be in us-east-1 region for CloudFront.

1. Go to AWS Certificate Manager (ACM) in **us-east-1** region
2. Click "Request certificate"
3. Choose "Request a public certificate"
4. Domain names: `procedure.jamescmooney.com`
5. Validation method: **DNS validation** (recommended)
6. Click "Request"

**DNS Validation:**
- ACM will show a CNAME record you need to add
- Copy the CNAME name and value
- Add this to your DNS provider (see Step 5)
- Certificate will be issued in 5-30 minutes

### Step 4: Create CloudFront Distribution

```bash
# Create distribution configuration file
cat > /tmp/cloudfront-config.json <<'EOF'
{
    "CallerReference": "florida-procedure-2025",
    "Comment": "Florida Civil Procedure Visualization",
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-procedure.jamescmooney.com",
                "DomainName": "procedure.jamescmooney.com.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-procedure.jamescmooney.com",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"]
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Aliases": {
        "Quantity": 1,
        "Items": ["procedure.jamescmooney.com"]
    },
    "ViewerCertificate": {
        "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    }
}
EOF
```

**Or use AWS Console (Easier):**

1. Go to CloudFront console
2. Click "Create distribution"
3. **Origin settings:**
   - Origin domain: `procedure.jamescmooney.com.s3.amazonaws.com`
   - Name: Auto-generated is fine
   - Origin access: Public (or use OAC for better security)

4. **Default cache behavior:**
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: **CachingOptimized**

5. **Settings:**
   - Alternate domain names (CNAMEs): `procedure.jamescmooney.com`
   - Custom SSL certificate: Select the certificate you created in Step 3
   - Default root object: `index.html`

6. Click "Create distribution"
7. Wait 10-15 minutes for deployment
8. Note the **CloudFront domain name** (e.g., d1234abcd.cloudfront.net)

### Step 5: Configure DNS

You need to add a CNAME record pointing to CloudFront.

#### If using Route 53:
```bash
# Get your hosted zone ID
aws route53 list-hosted-zones-by-name --dns-name jamescmooney.com

# Create alias record (replace ZONE_ID and CLOUDFRONT_DISTRIBUTION_ID)
cat > /tmp/dns-change.json <<'EOF'
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "procedure.jamescmooney.com",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "d1234abcd.cloudfront.net",
                    "EvaluateTargetHealth": false
                }
            }
        }
    ]
}
EOF

aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_ZONE_ID \
    --change-batch file:///tmp/dns-change.json
```

#### If using other DNS provider (GoDaddy, Namecheap, Cloudflare, etc.):

1. Log into your DNS provider
2. Find DNS management for jamescmooney.com
3. Add a new record:
   - **Type:** CNAME
   - **Name:** procedure
   - **Value:** d1234abcd.cloudfront.net (your CloudFront domain)
   - **TTL:** 300 or Auto

**Example for common providers:**

**GoDaddy:**
- DNS → Add Record → CNAME
- Host: `procedure`
- Points to: `d1234abcd.cloudfront.net`

**Namecheap:**
- Advanced DNS → Add New Record
- Type: CNAME Record
- Host: `procedure`
- Value: `d1234abcd.cloudfront.net`

**Cloudflare:**
- DNS → Add Record
- Type: CNAME
- Name: `procedure`
- Target: `d1234abcd.cloudfront.net`
- Proxy status: DNS only (gray cloud)

### Step 6: Test Your Setup

After DNS propagates (5-30 minutes):

```bash
# Test DNS resolution
nslookup procedure.jamescmooney.com

# Test HTTPS access
curl -I https://procedure.jamescmooney.com
```

Visit: **https://procedure.jamescmooney.com**

### Step 7: Deploy Your Site

```bash
cd florida-civil-procedure
./deploy.sh procedure.jamescmooney.com us-east-1 YOUR_CLOUDFRONT_DISTRIBUTION_ID
```

---

## Option 2: Subdirectory Setup

Host at: `jamescmooney.com/florida-procedure`

### Method A: Using Your Existing Infrastructure

If jamescmooney.com is already on S3/CloudFront or a web server:

**If on S3:**
```bash
# Upload to subdirectory in your main bucket
cd florida-civil-procedure
aws s3 sync . s3://jamescmooney.com/florida-procedure/ \
    --exclude ".git/*" \
    --exclude "*.md" \
    --exclude "deploy.sh"
```

**If on a web server (Apache/Nginx):**
```bash
# Upload files to subdirectory
scp -r florida-civil-procedure/ user@server:/var/www/jamescmooney.com/florida-procedure/
```

### Method B: CloudFront Path Pattern

If you want separate S3 bucket but serve from subdirectory:

1. Create S3 bucket (can be any name): `florida-procedure-jamescmooney`
2. Upload files to bucket
3. In your existing CloudFront distribution:
   - Add new Origin: `florida-procedure-jamescmooney.s3.amazonaws.com`
   - Add new Behavior:
     - Path pattern: `/florida-procedure/*`
     - Origin: florida-procedure-jamescmooney
4. CloudFront will route `/florida-procedure/*` to the new bucket

**Note:** You'll need to update `index.html` with base path:
```html
<!-- Add to <head> -->
<base href="/florida-procedure/">
```

And update module imports in JS files to use relative paths.

---

## Option 3: Unlisted on Main Site (Hidden Link)

Keep it on subdomain but don't link it from your main site navigation:

1. Use subdomain setup (Option 1)
2. Don't add links from /home, /galleries, /about
3. Share direct link when needed: `https://procedure.jamescmooney.com`
4. Optionally add in footer or "Projects" page later

**Pros:**
- Clean separation
- Easy to share specific URL
- Can add to main site later
- Indexed by search engines (or add noindex if you prefer)

---

## 🔐 Making It Private/Unlisted

If you want to prevent search engines from indexing:

### Option A: Add robots.txt
```txt
User-agent: *
Disallow: /
```

### Option B: Add meta tag to index.html
```html
<meta name="robots" content="noindex, nofollow">
```

### Option C: CloudFront with Basic Auth (Lambda@Edge)
Require password to access - more complex but truly private.

---

## 📊 Summary Comparison

| Approach | URL | Complexity | Cost | Best For |
|----------|-----|------------|------|----------|
| **Subdomain** | procedure.jamescmooney.com | Medium | $1-3/mo | Recommended - clean, independent |
| **Subdirectory (S3)** | jamescmooney.com/florida-procedure | Easy | $0.50/mo | If main site already on S3 |
| **Subdirectory (Path)** | jamescmooney.com/florida-procedure | Hard | $1-3/mo | Separate bucket, path routing |
| **Unlisted Subdomain** | procedure.jamescmooney.com | Medium | $1-3/mo | Private project, direct links only |

---

## 🚀 Quick Start (Recommended Path)

```bash
# 1. Create bucket
./deploy.sh procedure.jamescmooney.com us-east-1

# 2. Request SSL certificate in ACM (AWS Console)
#    Domain: procedure.jamescmooney.com
#    Validation: DNS (add CNAME to your DNS)

# 3. Create CloudFront distribution (AWS Console)
#    Origin: procedure.jamescmooney.com.s3.amazonaws.com
#    CNAME: procedure.jamescmooney.com
#    SSL: Select certificate from step 2

# 4. Add DNS CNAME record
#    Type: CNAME
#    Name: procedure
#    Value: [CloudFront domain from step 3]

# 5. Wait for DNS propagation (5-30 min)

# 6. Visit: https://procedure.jamescmooney.com
```

---

## 🔄 Updating the Site

After initial setup, updates are simple:

```bash
cd florida-civil-procedure
./deploy.sh procedure.jamescmooney.com us-east-1 YOUR_CLOUDFRONT_DIST_ID
```

This will:
- Upload changed files
- Invalidate CloudFront cache
- Site updates in ~1 minute

---

## 💡 Need Help?

1. Check DNS propagation: https://dnschecker.org
2. Test SSL certificate: https://www.ssllabs.com/ssltest/
3. CloudFront troubleshooting: Check distribution status and origins

---

## 📝 Next Steps

1. **Choose your approach** (subdomain recommended)
2. **Follow the setup guide** above
3. **Test the site** at your new URL
4. **Optionally:** Add a link from jamescmooney.com when ready

Your site will be live at:
- **Subdomain:** https://procedure.jamescmooney.com
- **Subdirectory:** https://jamescmooney.com/florida-procedure

Both support HTTPS, are fast (CloudFront CDN), and cost ~$1-3/month.
