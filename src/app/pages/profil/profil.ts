import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AgenceSessionService } from '../../services/agence-session.service';

@Component({
  selector: 'app-profil',
  imports: [TranslatePipe],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  private readonly agenceSession = inject(AgenceSessionService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly profile = computed(() => this.agenceSession.agence());

  ngOnInit(): void {
    this.agenceSession.loadProfile().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.errorMessage.set('backoffice.profile.loadError');
        this.loading.set(false);
      },
    });
  }

  protected get initials(): string {
    const name = this.profile().companyName.trim();
    if (!name) {
      return '?';
    }

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  protected displayValue(value: string): string {
    return value.trim() || '—';
  }
}
