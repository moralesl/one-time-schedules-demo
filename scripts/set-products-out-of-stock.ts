import axios from "axios";
import { Command } from "commander";

const baseUrl = "https://lu4g35dep6.execute-api.eu-central-1.amazonaws.com/menu/";

// Function to generate an array of numbers from a range string (e.g., '12-23')
function parseRange(range: string): number[] {
  const [start, end] = range.split("-").map(Number);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

async function setRangeOfProductIdsOutOfStock(productIds: number[]) {
  for (const productId of productIds) {
    const url = `${baseUrl}/V#FP_SG#${productId}/stock`;
    await axios
      .delete(url)
      .then((response) => {
        if (response.status !== 200) {
          console.log(`Failed to delete product with ID ${productId}`, response.status);
        } else {
          console.log(`Set product with ID ${productId} out of stock`);
        }
      })
      .catch(_ => console.error(`Failed to set product with ID ${productId} out of stock`));
  }

  console.log("Completed successfully.");
}

const program = new Command();
program.requiredOption("-r, --range <range>", "Range of product IDs to set out of stock").parse();

const options = program.opts();
const productIds = parseRange(options.range);
setRangeOfProductIdsOutOfStock(productIds);
