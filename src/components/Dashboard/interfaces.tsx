export type DashboardSaleItem = {
  name: string;
  barCode: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
};

export type DashboardSale = {
  id: string;
  customer: string;
  total: number;
  items: number;
  soldAt: string;
  totalCost: number;
  totalProfit: number;
  soldItems: DashboardSaleItem[];
};

export type DashboardKpis = {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  netMarginPercent: number;
  totalItems: number;
  avgTicket: number;
  salesCount: number;
  goalProgress: number;
  totalBusinessNetCost: number;
  totalBusinessSaleValue: number;
};
