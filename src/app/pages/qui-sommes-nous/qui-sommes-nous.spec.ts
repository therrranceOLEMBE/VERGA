import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuiSommesNous } from './qui-sommes-nous';

describe('QuiSommesNous', () => {
  let component: QuiSommesNous;
  let fixture: ComponentFixture<QuiSommesNous>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuiSommesNous],
    }).compileComponents();

    fixture = TestBed.createComponent(QuiSommesNous);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
