import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ListComponent } from './list.component';
import { MockSwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service.spec';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';
import { By } from '@angular/platform-browser';
import { MockTypeComponent } from 'src/app/components/type/type.component.spec';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockSwapiFetcherService: MockSwapiFetcherService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListComponent, MockTypeComponent],
      providers: [
        {
          provide: SwapiFetcherService,
          useClass: MockSwapiFetcherService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    mockSwapiFetcherService = TestBed.get(SwapiFetcherService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should present all data fetched from SwapiFetcherService progressively ', fakeAsync(() => {
    const expectedPresentedItems: ItemInterface[] = [];
    fixture.detectChanges();
    const responsesLength = mockSwapiFetcherService.returnedResponses.length;
    for (let i = 0; i < responsesLength; i++) {
      const recentlyFetchedElemet = mockSwapiFetcherService.returnedResponses[i];

      // make next object appear in the subscription
      tick(MockSwapiFetcherService.DelayMs);

      const newItems = recentlyFetchedElemet.results.map(item => {
        item.type = recentlyFetchedElemet.type;
        return item;
      });
      expectedPresentedItems.push(...newItems);
      expectCorrectItems(expectedPresentedItems);
    }
  }));

  function expectCorrectItems(expectedPresentedItems: ItemInterface[]) {
    fixture.detectChanges();
    const everyTr = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(expectedPresentedItems.length).toEqual(everyTr.length);
    const everyTrLength = everyTr.length;
    for (let i = 0; i < everyTrLength; i++) {
      const tr = everyTr[i];
      const presentedItem = expectedPresentedItems[i];
      const nameElemet: HTMLElement = tr.query(By.css('[name=name]')).nativeElement;
      expect(nameElemet.innerText).toEqual(presentedItem.name);

      const typeElemet: HTMLElement = tr.query(By.css('[name=type]')).nativeElement;
      expect(typeElemet.innerText).toEqual(presentedItem.type);
    }
  }
});
