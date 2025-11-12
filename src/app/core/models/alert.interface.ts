export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  amount?: number;
  date: Date;
  category: string;
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
}
