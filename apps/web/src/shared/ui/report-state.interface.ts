export interface IReportState {
  state: 'pending' | 'error' | 'empty';
  message?: string;
  retry?: () => void;
  shape?: 'line' | 'rows' | 'chart' | 'cards';
}
