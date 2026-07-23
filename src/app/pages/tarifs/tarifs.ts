import { AfterViewInit, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface WhyItem {
  index: string;
  titleKey: string;
  descKey: string;
}

interface StepItem {
  index: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-tarifs',
  imports: [Header, Footer, RouterLink, TranslatePipe],
  templateUrl: './tarifs.html',
  styleUrl: './tarifs.css',
})
export class Tarifs implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly whyItems: WhyItem[] = [
    { index: '01', titleKey: 'pricing.why1.title', descKey: 'pricing.why1.text' },
    { index: '02', titleKey: 'pricing.why2.title', descKey: 'pricing.why2.text' },
    { index: '03', titleKey: 'pricing.why3.title', descKey: 'pricing.why3.text' },
    { index: '04', titleKey: 'pricing.why4.title', descKey: 'pricing.why4.text' },
  ];

  protected readonly steps: StepItem[] = [
    { index: '01', titleKey: 'pricing.step1.title', descKey: 'pricing.step1.text' },
    { index: '02', titleKey: 'pricing.step2.title', descKey: 'pricing.step2.text' },
    { index: '03', titleKey: 'pricing.step3.title', descKey: 'pricing.step3.text' },
    { index: '04', titleKey: 'pricing.step4.title', descKey: 'pricing.step4.text' },
  ];

  ngAfterViewInit(): void {
    const root = this.host.nativeElement as HTMLElement;
    const targets = Array.from(root.querySelectorAll('[data-pricing-reveal]')) as HTMLElement[];

    if (typeof IntersectionObserver === 'undefined') {
      for (const el of targets) {
        el.classList.add('is-visible');
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    for (const el of targets) {
      observer.observe(el);
    }
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
