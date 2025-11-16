export type ChartDataPoint = {
    key: string;
    total: number;
  };
  
export type ChartData = {
    range: 'daily' | 'weekly' | 'monthly' | 'yearly';
    sales: ChartDataPoint[];
    expenses: ChartDataPoint[];
};