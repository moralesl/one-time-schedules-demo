import { Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDB = new DynamoDB.DocumentClient();

const menuItemAvailabilityTableName = process.env.MENU_ITEM_AVAILABILITY_TABLE_NAME ?? "undefined";

export const handler: Handler = async (event) => {
  console.log("Received: ", event);

  try {
    const { product_id } = event.pathParameters;

    const resultDdb = await setProductAvailable(product_id);
    console.log("resultDdb", resultDdb);

    return { statusCode: 200, body: JSON.stringify(resultDdb.Attributes) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Error setting product out of stock", errorMsg: error }) };
  }
};

const setProductAvailable = async (product_id: String) => {
  const params = {
    TableName: menuItemAvailabilityTableName,
    Key: {
      PK: product_id,
    },
    UpdateExpression: "SET isAvailable = :isAvailable",
    ExpressionAttributeValues: {
      ":isAvailable": "true",
    },
    ConditionExpression: "attribute_exists(PK)",
    ReturnValues: "ALL_NEW",
  };

  return await dynamoDB.update(params).promise();
};
