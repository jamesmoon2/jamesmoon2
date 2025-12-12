# Archive - Legacy Deployment Documentation

This directory contains legacy deployment scripts and documentation that have been superseded by the AWS CDK deployment method.

## Current Deployment Method

**Use AWS CDK** (recommended) - See `../../infrastructure/README.md`

The AWS CDK approach provides automated infrastructure management with:
- Infrastructure as code in TypeScript
- Automated deployment and updates
- Proper MIME type handling for ES6 modules
- CloudFront cache invalidation
- SSL/TLS certificate management
- Custom domain configuration

## Archived Files

### Deployment Scripts (Legacy)
- **`deploy.sh`** - Basic S3 deployment script
- **`deploy-subdomain.sh`** - Subdomain-specific deployment script

These scripts work but require manual CloudFront and DNS configuration.

### Documentation (Legacy)
- **`DEPLOYMENT.md`** - Manual AWS Console setup guide
- **`CUSTOM-DOMAIN.md`** - Custom domain configuration guide (manual process)
- **`QUICKSTART-jamescmooney.md`** - User-specific quick start (outdated, site now at law.jamescmooney.com)

### Configuration Examples
- **`bucket-policy.example.json`** - Example S3 bucket policy

## Why These Were Archived

1. **CDK is Superior**: Automated infrastructure management reduces errors and manual steps
2. **MIME Type Issues**: Manual deployments sometimes had incorrect content types for JS/CSS files
3. **Maintenance Burden**: Scripts required updates for CloudFront invalidation, certificate management, etc.
4. **User-Specific Content**: QUICKSTART was specific to an outdated subdomain setup

## When to Use Archived Scripts

Only use these if:
- You specifically need a non-CDK deployment
- You're deploying to an environment without CDK support
- You need to understand the manual deployment process for debugging

For all other cases, **use the CDK deployment** in `infrastructure/`.

## Migration Path

If you're currently using these legacy scripts:

1. Review `infrastructure/README.md` for CDK setup
2. Install AWS CDK: `npm install -g aws-cdk`
3. Configure AWS credentials
4. Deploy with: `cd infrastructure && npm run deploy`

The CDK will create new infrastructure or adopt existing resources where appropriate.
