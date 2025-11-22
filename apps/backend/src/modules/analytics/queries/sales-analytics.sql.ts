export const DAILY_SALES = /* sql */`
    SELECT 
        DATE(o."createdAt") AS date,
        SUM(o."totalAmount") as revenue
    FROM "Order" o 
    WHERE o."organizationId" = $1
        AND o."status" = 'COMPLETED'
    GROUP BY date
    ORDER BY date;
`;