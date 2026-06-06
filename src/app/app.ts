import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './services/language.service';

const APP_TITLE = 'VERGA';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly language = inject(LanguageService);
  private readonly title = inject(Title);

  constructor() {
    document.documentElement.lang = this.language.lang();
    this.title.setTitle(APP_TITLE);
  }
}
