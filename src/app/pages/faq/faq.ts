import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-faq',
  imports: [Header, Footer, TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {}
