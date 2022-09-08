export type ProfitReportType = {
  table: ProfitReportRowType[];
  profit: string;
};

export type ProfitReportRowType = {
  token: string;
  initial: string;
  current: string;
  external: string;
};
