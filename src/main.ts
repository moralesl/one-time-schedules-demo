import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Group } from "@aws-cdk/aws-scheduler-alpha";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vendorStockUpdatesSchedulerGroup = new Group(this, "VendorStockUpdatesSchedulerGroup", {
      groupName: "VendorStockUpdatesSchedulerGroup",
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, "one-time-schedules-demo-dev", { env: devEnv });
// new MyStack(app, 'one-time-schedules-demo-prod', { env: prodEnv });

app.synth();
