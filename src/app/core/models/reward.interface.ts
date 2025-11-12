export interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'descuento' | 'promocion' | 'ampliacion-tc' | 'tipo-cambio';
  discount?: string;
  conditions: string;
  imageUrl?: string;
  iconName?: string;
  actionLabel: string;
}
