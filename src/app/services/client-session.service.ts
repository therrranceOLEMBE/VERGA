import { Injectable, signal } from '@angular/core';

export interface ClientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class ClientSessionService {
  private readonly profile = signal<ClientProfile>({
    firstName: 'Marie',
    lastName: 'Diallo',
    email: 'marie.diallo@gmail.com',
    phone: '+225 05 98 76 54 32',
    address: 'Cocody Angré, Abidjan',
  });

  readonly client = this.profile.asReadonly();

  updateProfile(data: Partial<ClientProfile>): void {
    this.profile.update((current) => ({ ...current, ...data }));
  }

  get fullName(): string {
    const { firstName, lastName } = this.profile();
    return `${firstName} ${lastName}`.trim();
  }
}
