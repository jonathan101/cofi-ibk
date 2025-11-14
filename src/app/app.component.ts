import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileContainerComponent } from './shared/components/mobile-container/mobile-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MobileContainerComponent],
  template: `
    <app-mobile-container>
      <router-outlet></router-outlet>
    </app-mobile-container>
  `,
  styles: []
})
export class AppComponent {
  title = 'chicho-chatbot-poc';
}
