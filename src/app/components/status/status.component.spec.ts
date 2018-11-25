import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent, StatusOptions } from './status.component';
import { forwardRef, Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expected class', () => {
    component.status = 'loading';
    fixture.detectChanges();
    const loadingIcon = fixture.debugElement.query(By.css('.loading'));
    expect(loadingIcon).not.toBeNull();

    component.status = 'loading-error';
    fixture.detectChanges();
    const loadingErrorIcon = fixture.debugElement.query(By.css('.loading-error'));
    expect(loadingErrorIcon).not.toBeNull();

    component.status = 'loaded';
    fixture.detectChanges();
    const loadedIcon = fixture.debugElement.query(By.css('.loaded'));
    expect(loadedIcon).not.toBeNull();
  });
});

/**
 * StatusComponent Mock for testing purposes
 */
@Component({
  selector: 'app-status',
  template: '<ng-container></ng-container>',
  // added as provider for StatusComponent if use in ViewChild
  providers: [{ provide: StatusComponent, useExisting: forwardRef(() => MockStatusComponent) }]
})
export class MockStatusComponent {
  constructor() {}

  @Input()
  status: StatusOptions;
}
