import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tarifs } from './tarifs';

describe('Tarifs', () => {
  let component: Tarifs;
  let fixture: ComponentFixture<Tarifs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tarifs],
    }).compileComponents();

    fixture = TestBed.createComponent(Tarifs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
