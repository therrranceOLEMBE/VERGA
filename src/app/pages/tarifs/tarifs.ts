import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface WhyCard {
  titleKey: string;
  descKey: string;
  icon: 'globe' | 'document' | 'rocket' | 'people';
}

interface Step {
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-tarifs',
  imports: [Header, Footer, RouterLink, TranslatePipe],
  templateUrl: './tarifs.html',
  styleUrl: './tarifs.css',
})
export class Tarifs {
  protected readonly whyCards: WhyCard[] = [
    { titleKey: 'pricing.why1.title', descKey: 'pricing.why1.text', icon: 'globe' },
    { titleKey: 'pricing.why2.title', descKey: 'pricing.why2.text', icon: 'document' },
    { titleKey: 'pricing.why3.title', descKey: 'pricing.why3.text', icon: 'rocket' },
    { titleKey: 'pricing.why4.title', descKey: 'pricing.why4.text', icon: 'people' },
  ];

  protected readonly steps: Step[] = [
    { titleKey: 'pricing.step1.title', descKey: 'pricing.step1.text' },
    { titleKey: 'pricing.step2.title', descKey: 'pricing.step2.text' },
    { titleKey: 'pricing.step3.title', descKey: 'pricing.step3.text' },
    { titleKey: 'pricing.step4.title', descKey: 'pricing.step4.text' },
  ];
}
