import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeComponent } from './type.component';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { By } from '@angular/platform-browser';
import { forwardRef, Input, Component } from '@angular/core';

describe('TypeComponent', () => {
  let component: TypeComponent;
  let fixture: ComponentFixture<TypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TypeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show expected span depending on swapi type received', () => {
    expectSpan(SwapiFetcherService.FilmsPath);
    expectSpan(SwapiFetcherService.PeoplePath);
    expectSpan(SwapiFetcherService.PlanetsPath);
    expectSpan(SwapiFetcherService.SpeciesPath);
    expectSpan(SwapiFetcherService.StarshipsPath);
    expectSpan(SwapiFetcherService.VehiclesPath);
  });

  it('should show expected span depending on swapi type received', () => {
    expectSpan(SwapiFetcherService.FilmsPath);
    expectSpan(SwapiFetcherService.PeoplePath);
    expectSpan(SwapiFetcherService.PlanetsPath);
    expectSpan(SwapiFetcherService.SpeciesPath);
    expectSpan(SwapiFetcherService.StarshipsPath);
    expectSpan(SwapiFetcherService.VehiclesPath);
  });

  function expectSpan(type: string) {
    component.type = type;
    fixture.detectChanges();
    const spans = fixture.debugElement.queryAll(By.css('span'));
    // shouldn't show any other span
    expect(spans.length).toEqual(1);
    const spanElemet: HTMLSpanElement = spans[0].nativeElement;
    expect(spanElemet.getAttribute('type')).toEqual(type);
  }
});

/**
 * TypeComponent Mock for testing purposes
 */
@Component({
  selector: 'app-type',
  template: '<ng-container>{{type}}</ng-container>',
  // added as provider for TypeComponent if use in ViewChild
  providers: [{ provide: TypeComponent, useExisting: forwardRef(() => MockTypeComponent) }]
})
export class MockTypeComponent {
  constructor() {}

  @Input()
  type: string;
}
