import * as path from 'path'
import {
  aws_lambda_nodejs as nodeLambda,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
  aws_elasticloadbalancingv2_targets as targets,
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  Duration
} from 'aws-cdk-lib'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'


export class GraphqlServer extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    // DynamoDB table
    const tableName = 'apollo-server-app'
    const table = new dynamodb.Table(this, 'Table', {
      tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-Demand
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true // Enable Backups
    })

    // VPC with public and isolated subnets
    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.200.10.0/24',
      maxAzs: 2,
      natGateways: 0
    })
    // Add DynamoDB endpoint
    vpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
    })

    // Apollo server lambda
    const apolloFunctions = new nodeLambda.NodejsFunction(this, 'Apollo Lambda', {
      functionName: 'apollo-server-lambda',
      entry: path.join(__dirname, 'lambda', 'index.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.seconds(5),
      environment: {
        TABLE_NAME: tableName
      },
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      }
    })
    apolloFunctions.addToRolePolicy(new iam.PolicyStatement({
      actions: ['dynamodb:PutItem', 'dynamodb:Query'],
      resources: [table.tableArn]
    }))

    // ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'GraphQL-ALB', {
      vpc,
      internetFacing: true // this should be false in real case
    })
    const listener = alb.addListener('Listener', { port: 80 })
    listener.addTargets('Target', {
      targets: [
        new targets.LambdaTarget(apolloFunctions)
      ],
      healthCheck: {
        enabled: true,
        path: '/.well-known/apollo/server-health',
        interval: Duration.seconds(60)
      }
    })


  }
}