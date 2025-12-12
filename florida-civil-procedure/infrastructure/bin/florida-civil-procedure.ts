#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FloridaCivilProcedureStack } from '../lib/florida-civil-procedure-stack';

const app = new cdk.App();

new FloridaCivilProcedureStack(app, 'FloridaCivilProcedureStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1', // Required for ACM certificate with CloudFront
  },
  domainName: 'law.jamescmooney.com',
  parentDomain: 'jamescmooney.com',
  subdomain: 'law',
  description: 'Florida Civil Procedure visualization - Static website hosted on S3 with CloudFront CDN',
});

app.synth();
