import { Handler } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

const dynamoDB = new DynamoDB.DocumentClient();

const menuItemAvailabilityTableName = process.env.MENU_ITEM_AVAILABILITY_TABLE_NAME ?? "undefined";

export const handler: Handler = async (event) => {
  console.log("Received: ", event);

  try {
    const { product_id } = event.pathParameters;

    const resultDdb = await getProductDetails(product_id);
    console.log("resultDdb", resultDdb);

    if (resultDdb.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(resultDdb.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Product not found", resultDdb }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching product info", errorMsg: error }),
    };
  }
};

const getProductDetails = async (product_id: string) => {
  const params = {
    TableName: menuItemAvailabilityTableName,
    Key: {
      PK: product_id,
    },
  };

  return await dynamoDB.get(params).promise();
};
