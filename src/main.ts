import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Group } from "@aws-cdk/aws-scheduler-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import path from "path";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vendorStockUpdatesSchedulerGroup = new Group(this, "VendorStockUpdatesSchedulerGroup", {
      groupName: "VendorStockUpdatesSchedulerGroup",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const schedulerRole = new Role(this, 'SchedulerRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    });

    const menuItemAvailabilityTable = new Table(this, "MenuItemAvailabilityTable", {
      tableName: "MenuItemAvailabilityTable",
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const menuAvailabilityApi = new HttpApi(this, "MenuAvailabilityApi", {
      description: "Menu Availability Api",
    });

    const getMenuItemHandler = this._createMenuHandler("get-menu-item", menuItemAvailabilityTable);
    menuItemAvailabilityTable.grantReadData(getMenuItemHandler);

    const inStockHandler = this._createMenuHandler("in-stock", menuItemAvailabilityTable);
    menuItemAvailabilityTable.grantWriteData(inStockHandler);
    inStockHandler.grantInvoke(schedulerRole);

    const outOfStockHandler = this._createMenuHandler(
      "out-of-stock",
      menuItemAvailabilityTable,
      vendorStockUpdatesSchedulerGroup,
      schedulerRole.roleArn,
      inStockHandler.functionArn
    );
    menuItemAvailabilityTable.grantWriteData(outOfStockHandler);
    vendorStockUpdatesSchedulerGroup.grantWriteSchedules(outOfStockHandler);
    outOfStockHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [schedulerRole.roleArn],
        effect: Effect.ALLOW,
      }));

    menuAvailabilityApi.addRoutes({
      path: "/menu/{product_id}",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("GetMenuItem", getMenuItemHandler),
    });
    menuAvailabilityApi.addRoutes({
      path: "/menu/{product_id}/stock",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration("InStock", inStockHandler),
    });
    menuAvailabilityApi.addRoutes({
      path: "/menu/{product_id}/stock",
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration("OutOfStock", outOfStockHandler),
    });

    new CfnOutput(this, 'MenuAvailabilityApiUrl', { value: menuAvailabilityApi.url ?? 'not-found' });
  }

  private _createMenuHandler(
    handlerName: String,
    menuItemAvailabilityTable: Table,
    vendorStockUpdatesSchedulerGroup?: Group,
    reminderTargetRoleArn?: string,
    reminderTargetArn?: string,
  ) {
    return new NodejsFunction(this, `${handlerName}-handler`, {
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, `${handlerName}/index.ts`),
      handler: "handler",
      environment: {
        MENU_ITEM_AVAILABILITY_TABLE_NAME: menuItemAvailabilityTable.tableName,
        ...(vendorStockUpdatesSchedulerGroup ? { SCHEDULER_GROUP_NAME: vendorStockUpdatesSchedulerGroup.groupName } : {}),
        ...(reminderTargetRoleArn ? { REMINDER_TARGET_ROLE_ARN: reminderTargetRoleArn } : {}),
        ...(reminderTargetArn ? { REMINDER_TARGET_ARN: reminderTargetArn } : {}),
      },
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
