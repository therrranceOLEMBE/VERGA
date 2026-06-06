import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

interface Collaborator {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'gestionnaire' | 'commercial' | 'support';
  status: 'active' | 'inactive';
  createdDate: string;
}

@Component({
  selector: 'app-liste-collaborateurs',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './liste-collaborateurs.html',
  styleUrl: './liste-collaborateurs.css',
})
export class ListeCollaborateurs {
  private readonly language = inject(LanguageService);

  protected readonly filterName = signal('');
  protected readonly filterEmail = signal('');
  protected readonly filterRole = signal('');
  protected readonly filterStatus = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly roleOptions = [
    { value: '', labelKey: 'backoffice.collaboratorList.allRoles' },
    { value: 'gestionnaire', labelKey: 'backoffice.createCollaborator.roleManager' },
    { value: 'commercial', labelKey: 'backoffice.createCollaborator.roleSales' },
    { value: 'support', labelKey: 'backoffice.createCollaborator.roleSupport' },
  ];

  protected readonly statusOptions = [
    { value: '', labelKey: 'backoffice.collaboratorList.allStatuses' },
    { value: 'active', labelKey: 'backoffice.collaboratorList.status.active' },
    { value: 'inactive', labelKey: 'backoffice.collaboratorList.status.inactive' },
  ];

  private readonly allCollaborators: Collaborator[] = [
    { id: '1', code: 'COL-2026-00012', firstName: 'Aminata', lastName: 'Koné', email: 'a.kone@transit-express.ci', phone: '+225 07 12 34 56 78', role: 'gestionnaire', status: 'active', createdDate: '2026-01-15' },
    { id: '2', code: 'COL-2026-00011', firstName: 'Jean-Marc', lastName: 'Ouattara', email: 'jm.ouattara@transit-express.ci', phone: '+225 05 98 76 54 32', role: 'commercial', status: 'active', createdDate: '2026-02-03' },
    { id: '3', code: 'COL-2026-00009', firstName: 'Fatou', lastName: 'Diallo', email: 'f.diallo@transit-express.ci', phone: '+225 01 23 45 67 89', role: 'support', status: 'active', createdDate: '2026-03-10' },
    { id: '4', code: 'COL-2025-00042', firstName: 'Koffi', lastName: 'Assi', email: 'k.assi@transit-express.ci', phone: '+225 07 55 44 33 22', role: 'commercial', status: 'inactive', createdDate: '2025-08-22' },
    { id: '5', code: 'COL-2026-00007', firstName: 'Mariam', lastName: 'Traoré', email: 'm.traore@transit-express.ci', phone: '+225 05 11 22 33 44', role: 'gestionnaire', status: 'active', createdDate: '2026-04-05' },
    { id: '6', code: 'COL-2025-00038', firstName: 'Serge', lastName: 'N\'Guessan', email: 's.nguessan@transit-express.ci', phone: '+225 07 66 77 88 99', role: 'support', status: 'active', createdDate: '2025-11-18' },
    { id: '7', code: 'COL-2026-00005', firstName: 'Aïcha', lastName: 'Bamba', email: 'a.bamba@transit-express.ci', phone: '+225 01 88 99 00 11', role: 'commercial', status: 'active', createdDate: '2026-05-20' },
    { id: '8', code: 'COL-2025-00031', firstName: 'Patrick', lastName: 'Yao', email: 'p.yao@transit-express.ci', phone: '+225 05 44 55 66 77', role: 'support', status: 'inactive', createdDate: '2025-06-12' },
  ];

  protected readonly filteredCollaborators = computed(() => {
    const name = this.filterName().trim().toLowerCase();
    const email = this.filterEmail().trim().toLowerCase();
    const role = this.filterRole();
    const status = this.filterStatus();

    return this.allCollaborators.filter((collab) => {
      const fullName = `${collab.firstName} ${collab.lastName}`.toLowerCase();
      if (name && !fullName.includes(name)) return false;
      if (email && !collab.email.toLowerCase().includes(email)) return false;
      if (role && collab.role !== role) return false;
      if (status && collab.status !== status) return false;
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCollaborators().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  protected readonly displayedCollaborators = computed(() => {
    const list = this.filteredCollaborators();
    const totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));
    const page = Math.min(this.currentPage(), totalPages);
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly resultsLabel = computed(() => {
    this.language.lang();
    const list = this.filteredCollaborators();
    const total = list.length;
    if (total === 0) {
      return this.language.translate('backoffice.collaboratorList.empty');
    }
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize + 1;
    const end = Math.min(page * this.pageSize, total);
    return this.language.translate('backoffice.collaboratorList.results', { start, end, total });
  });

  protected resetFilters(): void {
    this.filterName.set('');
    this.filterEmail.set('');
    this.filterRole.set('');
    this.filterStatus.set('');
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected fullName(collab: Collaborator): string {
    return `${collab.firstName} ${collab.lastName}`;
  }

  protected roleKey(role: Collaborator['role']): string {
    const keys: Record<Collaborator['role'], string> = {
      gestionnaire: 'backoffice.createCollaborator.roleManager',
      commercial: 'backoffice.createCollaborator.roleSales',
      support: 'backoffice.createCollaborator.roleSupport',
    };
    return keys[role];
  }

  protected statusKey(status: Collaborator['status']): string {
    return `backoffice.collaboratorList.status.${status}`;
  }
}
