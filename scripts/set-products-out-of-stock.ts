import axios from "axios";
import { Command } from "commander";

// Function to generate an array of numbers from a range string (e.g., '12-23')
function parseRange(range: string): number[] {
  const [start, end] = range.split("-").map(Number);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

async function setRangeOfProductIdsOutOfStock(productIds: number[], apiUrl: string) {
  for (const productId of productIds) {
    const url = `${apiUrl}/menu/${encodeURIComponent("V#FP_SG#")}${productId}/stock`;
    console.log(url);

    await axios
      .delete(url)
      .then((response) => {
        if (response.status !== 200) {
          console.log(
            `Failed to delete product with ID ${productId}`,
            response.status,
            response.data
          );
        } else {
          console.log(`Set product with ID ${productId} out of stock`);
        }
      })
      .catch((error) =>
        console.error(
          `Failed to set product with ID ${productId} out of stock`,
          error.response.status,
          error.response.data
        )
      );
  }

  console.log("Completed successfully.");
}

const program = new Command();
program
  .requiredOption("-r, --range <range>", "Range of product IDs to set out of stock")
  .requiredOption("-a, --api-url <api-url>", "The URL of the API")
  .parse();

const options = program.opts();
const productIds = parseRange(options.range);
setRangeOfProductIdsOutOfStock(productIds, options.apiUrl);
