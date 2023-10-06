import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { faker } from "@faker-js/faker";

const dynamodb = new DynamoDBClient();

const tableName = "MenuItemAvailabilityTable";

// Helper function to generate a random item
function generateRandomItem(product_id: number): PutItemCommand {
    const randomItem = {
      PK: product_id,
      SK: `P#apfel_schorle${product_id}`,
      brandId: faker.datatype.number({ min: 1, max: 10 }).toString(),
      categoryId: faker.datatype.number({ min: 1, max: 10 }).toString(),
      ET: "P",
      isAvailable: true,
      stockLevel: faker.datatype.number({ min: 1, max: 100 }).toString(),
    };
  
    const params = {
      TableName: tableName,
      Item: marshall(randomItem),
    };
  
    return new PutItemCommand(params);
  }

async function populateTable() {
  try {
    for (let i = 0; i < 25; i++) {
      const params = generateRandomItem(i);
      await dynamodb.send(params);
      console.log(`Item ${i + 1} inserted.`, params);
    }
    console.log("Table populated successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
}

populateTable();
