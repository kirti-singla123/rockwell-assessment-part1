import { ErpSalesOrder, SkuMapping } from "../types";

const ERP_BASE_URL = process.env.ERP_API_URL || "https://erp-api.example.com";
const ERP_API_KEY = process.env.ERP_API_KEY || "";

/**
 * Fetches all SKU mappings from the ERP system.
 * ERP returns data in pages of 50.
 */
export async function getSkuMappings(): Promise<SkuMapping[]> {
  const allMappings: SkuMapping[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `${ERP_BASE_URL}/item-mappings?page=${page}&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${ERP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ERP API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { mappings: SkuMapping[] };

    allMappings.push(...data.mappings);

    // stop when last page is reached
    if (data.mappings.length < 50) {
      break;
    }

    page++;
  }

  return allMappings;
}

/**
 * Creates a sales order in ERP
 */
export async function createSalesOrder(order: ErpSalesOrder): Promise<string> {
  const response = await fetch(`${ERP_BASE_URL}/sales-orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ERP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create sales order: ${response.status} - ${errorBody}`
    );
  }

  const result = (await response.json()) as { salesOrderId: string };
  return result.salesOrderId;
}