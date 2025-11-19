export interface Item {
  id: number;
  name: string;
  sellingPrice: number;
  inventoryQty: number;
}


export interface ItemCostPrice {
  itemId: number;
  name: string;
  avgCostPrice: number; // average cost price per unit, including direct & indirect expenses
}

export interface AverageCostPriceResponse {
  items: ItemCostPrice[];
  organizationAvgCostPrice: number; // overall average across all items
}