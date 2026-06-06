import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
  protected newsletter = false;

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
}
