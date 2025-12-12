# Quick Start for jamescmooney.com

## 🎯 Recommended: Use Subdomain

Host at: **https://procedure.jamescmooney.com**

This keeps it separate from your main site but accessible via direct link.

---

## 🚀 5-Minute Setup

### Step 1: Deploy to S3 (2 minutes)

```bash
cd florida-civil-procedure
./deploy-subdomain.sh procedure
```

This script will:
- ✅ Create S3 bucket: `procedure.jamescmooney.com`
- ✅ Enable static website hosting
- ✅ Upload all files
- ✅ Configure everything automatically

You'll see a temporary HTTP URL for testing.

### Step 2: Request SSL Certificate (1 minute + wait)

1. Go to [AWS Certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1) **(must be us-east-1 region)**
2. Click **"Request certificate"**
3. Enter domain: `procedure.jamescmooney.com`
4. Choose **"DNS validation"**
5. Click **"Request"**
6. AWS will show you a CNAME record to add
7. **Copy that CNAME** (you'll add it to your DNS in Step 4)

### Step 3: Create CloudFront Distribution (2 minutes + 15 min deploy)

1. Go to [CloudFront console](https://console.aws.amazon.com/cloudfront)
2. Click **"Create distribution"**
3. Fill in:
   - **Origin domain:** `procedure.jamescmooney.com.s3.amazonaws.com`
   - **Viewer protocol policy:** Redirect HTTP to HTTPS
   - **Alternate domain names (CNAMEs):** `procedure.jamescmooney.com`
   - **Custom SSL certificate:** Select the certificate from Step 2
   - **Default root object:** `index.html`
4. Click **"Create distribution"**
5. **Copy the CloudFront domain** (looks like `d1234abcd.cloudfront.net`)
6. Wait ~15 minutes for it to deploy

### Step 4: Update DNS (1 minute + propagation time)

Add TWO records to your DNS provider:

**Record 1: ACM Validation (from Step 2)**
- Type: CNAME
- Name: (copy from ACM)
- Value: (copy from ACM)

**Record 2: Subdomain → CloudFront**
- Type: CNAME
- Name: `procedure`
- Value: `d1234abcd.cloudfront.net` (from Step 3)

**Where is your DNS managed?**
- Route 53: [Go here](https://console.aws.amazon.com/route53/v2/hostedzones)
- GoDaddy: DNS Management → Add CNAME
- Namecheap: Advanced DNS → Add Record
- Cloudflare: DNS → Add Record

### Step 5: Wait & Test (5-30 minutes)

DNS propagation takes 5-30 minutes.

Test when ready:
```bash
# Check DNS
nslookup procedure.jamescmooney.com

# Visit site
open https://procedure.jamescmooney.com
```

---

## ✅ Done!

Your site is now live at: **https://procedure.jamescmooney.com**

- ✅ Fully secure HTTPS
- ✅ Fast CloudFront CDN
- ✅ Not linked from main site (direct link only)
- ✅ Easy to update (just run deploy script again)

---

## 🔄 Future Updates

When you make changes:

```bash
cd florida-civil-procedure
./deploy-subdomain.sh procedure YOUR_CLOUDFRONT_DIST_ID
```

Replace `YOUR_CLOUDFRONT_DIST_ID` with your distribution ID from CloudFront console.

---

## 💡 Alternative: Subdirectory

If you prefer `jamescmooney.com/florida-procedure` instead:

**If your main site is already on S3:**
```bash
aws s3 sync . s3://jamescmooney.com/florida-procedure/ \
    --exclude ".git/*" --exclude "*.md" --exclude "*.sh"
```

Then visit: `https://jamescmooney.com/florida-procedure`

---

## 📚 Full Documentation

- **CUSTOM-DOMAIN.md** - Complete guide with all options
- **DEPLOYMENT.md** - General S3 deployment guide
- **README.md** - Application documentation

---

## 🆘 Troubleshooting

**DNS not resolving?**
- Wait longer (can take up to 48 hours, usually 5-30 min)
- Check: https://dnschecker.org

**Certificate pending?**
- Make sure you added the ACM validation CNAME to DNS
- Check in ACM console - should show "Issued" when ready

**CloudFront showing errors?**
- Check distribution status is "Deployed"
- Verify origin is correct S3 bucket
- Check SSL certificate is attached

**Site showing but broken?**
- Clear browser cache
- Check browser console for errors
- Verify files uploaded correctly: `aws s3 ls s3://procedure.jamescmooney.com/`

---

## 💰 Cost

Estimated: **$1-3/month**
- S3 storage: ~$0.50
- CloudFront: First 1TB free, then minimal
- Certificate: FREE
- Route 53: $0.50/month (if you use it)

---

## 🎨 Customization

To change subdomain from "procedure" to something else:

```bash
./deploy-subdomain.sh YOUR_SUBDOMAIN
```

Examples:
- `./deploy-subdomain.sh florida` → florida.jamescmooney.com
- `./deploy-subdomain.sh civil` → civil.jamescmooney.com
- `./deploy-subdomain.sh legal` → legal.jamescmooney.com

Just remember to use the same subdomain name in Steps 2-4!

---

Need help? Check the full guides or reach out!
