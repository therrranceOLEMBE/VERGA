import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { LegalDocument, PRIVACY_DOCUMENT, TERMS_DOCUMENT } from '../../data/legal.content';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-legal-document',
  imports: [Header, Footer, RouterLink, TranslatePipe],
  templateUrl: './legal-document.html',
  styleUrl: './legal-document.css',
})
export class LegalDocumentPage {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly document = computed<LegalDocument>(() => {
    const url = this.currentUrl();
    return url.includes('conditions-generales') ? TERMS_DOCUMENT : PRIVACY_DOCUMENT;
  });

  protected readonly heroImage = computed(() =>
    this.document().path.includes('conditions')
      ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80'
      : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1920&q=80',
  );

  protected readonly title = computed(() => this.document().title[this.language.lang()]);
  protected readonly lead = computed(() => this.document().lead[this.language.lang()]);
  protected readonly updated = computed(() => this.document().updated[this.language.lang()]);

  protected readonly sections = computed(() => {
    const lang = this.language.lang();
    return this.document().sections.map((section, index) => ({
      id: section.id,
      indexLabel: String(index + 1).padStart(2, '0'),
      title: section.title[lang],
      paragraphs: section.paragraphs[lang],
      delay: `${index * 40}ms`,
    }));
  });

  protected readonly otherLegalPath = computed(() =>
    this.document().path.includes('conditions')
      ? '/politique-de-confidentialite'
      : '/conditions-generales',
  );

  protected readonly otherLegalLabelKey = computed(() =>
    this.document().path.includes('conditions') ? 'footer.privacy' : 'footer.terms',
  );

  /** Scroll net vers une rubrique (header fixe + Angular ne gère pas bien les ancres seules). */
  protected scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `${this.document().path}#${sectionId}`);
  }
}
