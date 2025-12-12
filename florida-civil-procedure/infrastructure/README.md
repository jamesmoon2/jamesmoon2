# Florida Civil Procedure - CDK Infrastructure

AWS CDK infrastructure for deploying the Florida Civil Procedure visualization to `law.jamescmooney.com`.

## Architecture

This CDK stack creates:

- **S3 Bucket**: Private bucket for website files with versioning enabled
- **CloudFront Distribution**: Global CDN with HTTPS, custom domain, and caching
- **ACM Certificate**: Automatic SSL/TLS certificate with DNS validation
- **Route 53 Record**: A record pointing subdomain to CloudFront
- **Origin Access Control (OAC)**: Secure CloudFront access to S3

```
┌─────────────────────────────────────┐
│  Route 53: law.jamescmooney.com     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  CloudFront Distribution            │
│  - HTTPS with ACM certificate       │
│  - Cache: 1yr for assets, 0 for HTML│
│  - Security headers                 │
│  - Gzip/Brotli compression          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  S3 Bucket (Private)                │
│  - law-jamescmooney-com-website     │
│  - Versioning enabled               │
│  - OAC access only                  │
└─────────────────────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Node.js** 18.x or later
4. **AWS CDK CLI** v2.x

Install CDK CLI globally:
```bash
npm install -g aws-cdk
```

5. **Route 53 Hosted Zone** for `jamescmooney.com` (already exists)

## Initial Setup

### 1. Install Dependencies

```bash
cd infrastructure
npm install
```

### 2. Bootstrap CDK Environment

If this is your first time using CDK in the `us-east-1` region:

```bash
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

Replace `ACCOUNT-ID` with your AWS account ID. You can find it with:
```bash
aws sts get-caller-identity --query Account --output text
```

### 3. Synthesize CloudFormation Template

Generate the CloudFormation template to verify everything is correct:

```bash
npm run synth
```

This creates a CloudFormation template in `cdk.out/`.

### 4. Review Changes

See what resources will be created:

```bash
npm run diff
```

## Deployment

### First Deployment

Deploy the full stack:

```bash
npm run deploy
```

Or with auto-approval (skip manual confirmation):

```bash
cdk deploy --require-approval never
```

**What happens during deployment:**

1. Creates S3 bucket (private, versioned)
2. Creates ACM certificate and validates via Route 53 (~5-10 minutes)
3. Creates CloudFront distribution (~15-20 minutes)
4. Creates Route 53 A record for subdomain
5. Deploys website files to S3
6. Invalidates CloudFront cache

**Total time**: 20-30 minutes for first deployment

### Subsequent Deployments

After the initial deployment, updates are much faster (~2-5 minutes):

```bash
npm run deploy
```

The CDK will:
- Detect changed files in the parent directory
- Sync only changed files to S3
- Automatically invalidate CloudFront cache
- Zero-downtime deployment

## Stack Outputs

After deployment, you'll see these outputs:

```
Outputs:
FloridaCivilProcedureStack.WebsiteURL = https://law.jamescmooney.com
FloridaCivilProcedureStack.CloudFrontURL = d1234abcd.cloudfront.net
FloridaCivilProcedureStack.DistributionId = E1234ABCD5678
FloridaCivilProcedureStack.BucketName = law-jamescmooney-com-website
```

## Configuration

### Domain Settings

Configured in `bin/florida-civil-procedure.ts`:

```typescript
{
  domainName: 'law.jamescmooney.com',
  parentDomain: 'jamescmooney.com',
  subdomain: 'law',
}
```

### File Deployment

The CDK deploys files from the parent directory (`../`) with these exclusions:

- `.git/**` - Git repository files
- `*.md` - Documentation files
- `package.json` - Node package file
- `*.sh` - Shell scripts
- `.DS_Store` - macOS metadata
- `infrastructure/**` - CDK infrastructure code

### Cache Strategy

| Resource Type | Cache Policy | TTL |
|---------------|-------------|-----|
| `index.html` | No cache | 0 seconds |
| CSS/JS/Assets | Optimized | 1 year |

## Development Workflow

### Making Changes to Website Files

1. Edit files in the parent directory (HTML, CSS, JS)
2. Deploy changes:
   ```bash
   cd infrastructure
   npm run deploy
   ```
3. CloudFront cache is automatically invalidated
4. Changes are live immediately

### Making Changes to Infrastructure

1. Edit CDK code in `lib/florida-civil-procedure-stack.ts`
2. Review changes:
   ```bash
   npm run diff
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

## CDK Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and compile |
| `npm run synth` | Synthesize CloudFormation template |
| `npm run diff` | Show what will change |
| `npm run deploy` | Deploy stack to AWS |
| `npm run destroy` | Delete all stack resources |
| `cdk ls` | List all stacks |
| `cdk docs` | Open CDK documentation |

## Troubleshooting

### Certificate Validation Stuck

**Issue**: Certificate validation takes longer than expected

**Solution**:
- Wait up to 30 minutes for DNS propagation
- Verify Route 53 hosted zone has the correct name servers
- Check for CNAME validation records in Route 53

### CloudFront Shows Old Content

**Issue**: Website shows cached content after deployment

**Solution**:
- CDK automatically invalidates cache during deployment
- Manual invalidation:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id E1234ABCD5678 \
    --paths "/*"
  ```

### DNS Not Resolving

**Issue**: `law.jamescmooney.com` doesn't resolve

**Solution**:
- Wait 5-10 minutes for DNS propagation
- Check Route 53 record exists:
  ```bash
  aws route53 list-resource-record-sets \
    --hosted-zone-id Z1234ABCD5678 \
    --query "ResourceRecordSets[?Name=='law.jamescmooney.com.']"
  ```
- Test DNS resolution:
  ```bash
  dig law.jamescmooney.com
  nslookup law.jamescmooney.com
  ```

### Deployment Fails

**Issue**: CDK deployment fails with error

**Solutions**:
- Ensure AWS credentials are configured
- Check you're deploying to `us-east-1`
- Verify Route 53 hosted zone exists
- Check for resource naming conflicts
- Review CloudFormation events in AWS Console

### CORS Errors

**Issue**: Browser shows CORS errors

**Solution**:
- Not needed for same-origin resources
- D3.js loads from external CDN (already CORS-enabled)
- ES6 modules work without CORS issues

## Cost Estimate

| Service | Usage | Monthly Cost |
|---------|-------|-------------|
| S3 Storage | ~176 KB | $0.01 |
| S3 Requests | ~1,000 | $0.01 |
| CloudFront | ~1,000 visitors | $0.50-$1.50 |
| Route 53 | Hosted zone + queries | $0 (included) |
| ACM Certificate | SSL/TLS | $0 (free) |
| **Total** | | **$0.50-$2.00/month** |

## Security Features

1. **S3 Bucket**: Completely private, no public access
2. **Origin Access Control**: Secure S3 access via CloudFront
3. **HTTPS Only**: HTTP automatically redirects to HTTPS
4. **TLS 1.2+**: Modern encryption standards
5. **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
6. **Versioning**: Rollback capability for S3 objects
7. **Encryption**: S3 server-side encryption enabled

## Monitoring

### CloudWatch Metrics

View metrics in AWS Console:
- CloudFront → Reports & Analytics
- S3 → Metrics → Storage

### Access Logs (Optional)

To enable CloudFront access logs, add to the Distribution construct:

```typescript
enableLogging: true,
logBucket: logBucket,
logFilePrefix: 'cloudfront-logs/',
```

## Cleanup

To delete all resources:

```bash
npm run destroy
```

**Warning**: This will delete:
- CloudFront distribution
- S3 bucket (if empty)
- Route 53 record
- ACM certificate

The S3 bucket has `RETAIN` removal policy, so it won't be automatically deleted if it contains files.

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Install dependencies
        run: |
          cd infrastructure
          npm install

      - name: Deploy stack
        run: |
          cd infrastructure
          npm run deploy -- --require-approval never
```

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Developer Guide](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Route 53 Documentation](https://docs.aws.amazon.com/route53/)

## Support

For issues or questions:
1. Check this README
2. Review AWS CloudFormation events
3. Check CloudWatch logs
4. Open an issue in the repository

## License

MIT
