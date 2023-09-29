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

    return { statusCode: 200, body: JSON.stringify(resultDdb.Attributes) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error setting product out of stock", errorMsg: error }) };
  }
};

const setProductUnavailable = async (product_id: String) => {
  const params = {
    TableName: menuItemAvailabilityTableName,
    Key: {
      PK: `V#FP_SG#${product_id}`,
    },
    UpdateExpression: "SET isAvailable = :isAvailable",
    ExpressionAttributeValues: {
      ":isAvailable": "false",
    },
    ReturnValues: "ALL_NEW",
  };

  return await dynamoDB.update(params).promise();
};
