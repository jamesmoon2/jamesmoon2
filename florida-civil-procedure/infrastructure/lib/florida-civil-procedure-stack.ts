import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';

export interface FloridaCivilProcedureStackProps extends cdk.StackProps {
  readonly domainName: string;
  readonly parentDomain: string;
  readonly subdomain: string;
}

export class FloridaCivilProcedureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FloridaCivilProcedureStackProps) {
    super(scope, id, props);

    const { domainName, parentDomain, subdomain } = props;

    // 1. Create S3 bucket for website hosting (private)
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `law-jamescmooney-com-website`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      enforceSSL: true,
    });

    // 2. Lookup existing Route 53 hosted zone (read-only)
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: parentDomain,
    });

    // 3. Create ACM certificate with DNS validation
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // 4. Create Origin Access Control (OAC) for secure S3 access
    const cfnOriginAccessControl = new cloudfront.CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: `${domainName}-oac`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    // 5. Create custom cache policy for index.html (no cache)
    const noCachePolicy = new cloudfront.CachePolicy(this, 'NoCachePolicy', {
      cachePolicyName: `${subdomain}-no-cache-policy`,
      comment: 'No cache policy for index.html',
      minTtl: Duration.seconds(0),
      maxTtl: Duration.seconds(0),
      defaultTtl: Duration.seconds(0),
      enableAcceptEncodingGzip: false,
      enableAcceptEncodingBrotli: false,
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    });

    // 6. Create response headers policy for security
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: `${subdomain}-security-headers`,
      comment: 'Security headers for Florida Civil Procedure site',
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(31536000),
          includeSubdomains: true,
          override: true,
        },
        xssProtection: { protection: true, modeBlock: true, override: true },
      },
    });

    // 7. Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: responseHeadersPolicy,
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
      },
      additionalBehaviors: {
        // No cache for index.html
        '/index.html': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: noCachePolicy,
          responseHeadersPolicy: responseHeadersPolicy,
          compress: true,
        },
      },
      domainNames: [domainName],
      certificate: certificate,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableIpv6: true,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: `CloudFront distribution for ${domainName}`,
    });

    // 8. Update S3 bucket policy to allow CloudFront OAC access
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        },
      },
    }));

    // 9. Create Route 53 A record for subdomain
    new route53.ARecord(this, 'SubdomainARecord', {
      zone: hostedZone,
      recordName: subdomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      ttl: Duration.minutes(5),
      comment: `A record for ${domainName}`,
    });

    // 10. Deploy website files to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset('../', {
          exclude: [
            '.git/**',
            '.gitignore',
            '*.md',
            'package.json',
            'package-lock.json',
            '*.sh',
            '.DS_Store',
            'bucket-policy.example.json',
            'infrastructure/**',
            'node_modules/**',
            '.vscode/**',
            '.idea/**',
          ],
        }),
      ],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
      prune: true,
      cacheControl: [
        s3deploy.CacheControl.fromString('public, max-age=31536000, immutable'),
      ],
      metadata: {
        version: new Date().toISOString(),
      },
    });

    // 11. CloudFormation Outputs
    new CfnOutput(this, 'WebsiteURL', {
      value: `https://${domainName}`,
      description: 'Website URL',
      exportName: 'FloridaCivilProcedureWebsiteURL',
    });

    new CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: 'FloridaCivilProcedureCloudFrontURL',
    });

    new CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: 'FloridaCivilProcedureDistributionId',
    });

    new CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name',
      exportName: 'FloridaCivilProcedureBucketName',
    });

    new CfnOutput(this, 'HostedZoneId', {
      value: hostedZone.hostedZoneId,
      description: 'Route 53 hosted zone ID',
      exportName: 'FloridaCivilProcedureHostedZoneId',
    });
  }
}
