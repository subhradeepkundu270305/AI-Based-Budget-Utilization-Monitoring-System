import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatBubbleComponent } from './shared/chat-bubble.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatBubbleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
