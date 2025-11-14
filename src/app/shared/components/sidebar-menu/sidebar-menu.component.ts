import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent {
  @Output() close = new EventEmitter<void>();

  userProfile = {
    name: 'Valeria O.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6zRgaVNXno1YDAviLzhnVFQ9s61lHtXU8ahNJvYz1_1i7V8wFW4kZJRyVBP7dSaEnPMrWNHcp35ohddjMnxF2ZUAYT1eXPm76G9A-ysiosMP29zfHLWbWsCQMPVSLQMXs38xzgU-K04gz5URrZOuxMGj_KcHYewfsvmlEiYRAmE7OYedqRxgcqF_TA1L8ld04ogWRdcWDiGvoP_HdXKT9FxOBfqnCg853mDmWCn77tzuJzefA5ByDINDyNObw8gCM32YPboADf94'
  };

  menuItems: MenuItem[] = [
    { icon: 'chat', label: 'COFI Chat', route: '/chat' },
    { icon: 'notifications', label: 'Alertas', route: '/alertas' },
    { icon: 'workspace_premium', label: 'Recompensas', route: '/recompensas' },
    { icon: 'savings', label: 'Plan de Ahorro', route: '/plan-ahorros' }
  ];

  constructor(public router: Router) {}

  onClose(): void {
    this.close.emit();
  }

  onMenuItemClick(): void {
    this.close.emit();
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
