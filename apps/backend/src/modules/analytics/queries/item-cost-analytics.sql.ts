export const GET_ITEM_COST_ANALYTICS_QUERY = /* sql */ `
  SELECT
      i.id,
      i.name,
      i."sellingPrice",
      i."inventoryQty",
      COALESCE(SUM(oi.quantity), 0)::int AS "totalQuantitySold",
      COALESCE(SUM(oi.price), 0)::float AS "totalRevenue"
  FROM "Item" i
  LEFT JOIN "OrderItem" oi
      ON oi."itemId" = i.id
  LEFT JOIN "Order" o
      ON o.id = oi."orderId" AND o."status" = 'COMPLETED'
  WHERE i."organizationId" = $1
  GROUP BY i.id
  ORDER BY i.name ASC;
`;
