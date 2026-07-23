import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ContactChannel {
  index: string;
  titleKey: string;
  textKey: string;
  action: 'faq' | 'whatsapp' | 'form';
  actionKey: string;
}

@Component({
  selector: 'app-nous-contacter',
  imports: [Header, Footer, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './nous-contacter.html',
  styleUrl: './nous-contacter.css',
})
export class NousContacter {
  protected name = '';
  protected email = '';
  protected phone = '';
  protected subject = '';
  protected message = '';

  protected readonly whatsappUrl = 'https://wa.me/2250710289904';
  protected readonly phoneDisplay = '+225 07 10 28 99 04';
  protected readonly phoneHref = 'tel:+2250710289904';
  protected readonly emailDisplay = 'contact@verga.com';
  protected readonly emailHref = 'mailto:contact@verga.com';

  protected readonly channels: ContactChannel[] = [
    {
      index: '01',
      titleKey: 'contact.faqTitle',
      textKey: 'contact.faqText',
      action: 'faq',
      actionKey: 'contact.faqBtn',
    },
    {
      index: '02',
      titleKey: 'contact.agencyTitle',
      textKey: 'contact.agencyText',
      action: 'whatsapp',
      actionKey: 'contact.whatsappBtn',
    },
    {
      index: '03',
      titleKey: 'contact.writeTitle',
      textKey: 'contact.writeText',
      action: 'form',
      actionKey: 'contact.writeAction',
    },
  ];

  protected readonly subjectOptions = [
    { value: '', labelKey: 'contact.subject.select' },
    { value: 'devis', labelKey: 'contact.subject.quote' },
    { value: 'suivi', labelKey: 'contact.subject.tracking' },
    { value: 'partenaire', labelKey: 'contact.subject.partner' },
    { value: 'support', labelKey: 'contact.subject.support' },
    { value: 'autre', labelKey: 'contact.subject.other' },
  ];

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }

  protected scrollToForm(): void {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
