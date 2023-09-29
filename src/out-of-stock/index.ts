import { Handler } from "aws-lambda";
import { DynamoDB, Scheduler } from "aws-sdk";
import { randomUUID } from "crypto";

const dynamoDB = new DynamoDB.DocumentClient();
const scheduler = new Scheduler();

const menuItemAvailabilityTableName = process.env.MENU_ITEM_AVAILABILITY_TABLE_NAME ?? "undefined";

export const handler: Handler = async (event) => {
  console.log("Received: ", event);

  try {
    const { product_id } = event.pathParameters;

    const resultDdb = await setProductUnavailable(product_id);
    console.log("resultDdb", resultDdb);

    const reminderDate = dateInXMinutes(new Date(), 1);
    const resultScheduler = await scheduleInStock(product_id, formatDate(reminderDate));
    console.log("resultScheduler", resultScheduler);

    return { statusCode: 200, body: JSON.stringify(resultDdb.Attributes) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error setting product out of stock", errorMsg: error }) };
  }
};

const setProductUnavailable = async (product_id: string) => {
  const params = {
    TableName: menuItemAvailabilityTableName,
    Key: {
      PK: `V#FP_SG#${product_id}`,
    },
    UpdateExpression: "SET isAvailable = :isAvailable",
    ExpressionAttributeValues: {
      ":isAvailable": "false",
    },
    ConditionExpression: "attribute_exists(PK)",
    ReturnValues: "ALL_NEW",
  };

  return await dynamoDB.update(params).promise();
};

const scheduleInStock = async (product_id: string, reminderDate: string) => {
  const target: AWS.Scheduler.Target = {
    RoleArn: process.env.REMINDER_TARGET_ROLE_ARN!,
    Arn: process.env.REMINDER_TARGET_ARN!,
    Input: JSON.stringify({
      pathParameters: {
        product_id: product_id,
      },
      schedulerContext: {
        arn: "<aws.scheduler.schedule-arn>",
        timestamp: "<aws.scheduler.schedule-time>",
        executionId: "<aws.scheduler.execution-id>",
        attemptNr: "<aws.scheduler.attempt-number>"
      }
    }),
  };

  const schedulerInput: AWS.Scheduler.CreateScheduleInput = {
    Name: `${formatCompliantName("V#FP_SG#" + product_id)}__${formatCompliantName(reminderDate)}__in_stock_reminder`,
    FlexibleTimeWindow: {
      Mode: "OFF",
    },
    ActionAfterCompletion: "DELETE",
    Target: target,
    ScheduleExpression: `at(${reminderDate})`,
    GroupName: process.env.SCHEDULER_GROUP_NAME!,
    ClientToken: randomUUID(),
  };

  return await scheduler.createSchedule(schedulerInput).promise();
};

const formatDate = (date: Date) => {
  return date.toISOString().split(".")[0];
};

const dateInXMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60_000);
};

/** Scheduler name must comply with the following pattern: [0-9a-zA-Z-_.]+
 * Otherwise you see:
 * Value 'V#FP_SG#2__2023-09-29T07:17:50__in_stock_reminder' at 'name' failed to satisfy constraint: Member must satisfy regular expression pattern: [0-9a-zA-Z-_.]+"
 */
const formatCompliantName = (name: string) => {
  return name.replace(/[^0-9a-zA-Z-_.]+/g, ".");
};
