export interface Alert {
  id: string;
  title: string;
  message?: string;
  timeAgo?: Date;
  description: string;
  severity: 'warning' | 'danger' | 'info';
  amount?: number;
  date: Date;
  category: string;
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
}
