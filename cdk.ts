#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { GraphqlServer } from './graphql-server/cdk'
import { getAwsAccount, getAwsRegion } from './utils'


// Get AWS account and region
const awsEnv = { account: getAwsAccount(), region: getAwsRegion() }
const app = new cdk.App()

// GraphQL Stack
class GraphqlServerStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    new GraphqlServer(this, 'GraphqlServer')
  }
}
new GraphqlServerStack(app, 'GraphQLStack', {
  env: awsEnv,
  description: 'Graphql Apollo Server Stack'
})
