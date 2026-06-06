import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NousContacter } from './nous-contacter';

describe('NousContacter', () => {
  let component: NousContacter;
  let fixture: ComponentFixture<NousContacter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NousContacter],
    }).compileComponents();

    fixture = TestBed.createComponent(NousContacter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
