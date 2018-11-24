import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as faker from 'faker';

import { ListComponent } from './list.component';
import { MockSwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service.spec';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';
import { By } from '@angular/platform-browser';
import { MockTypeComponent } from 'src/app/components/type/type.component.spec';
import { ItemsResponseInterface } from 'src/app/services/swapi-fetcher/models/items-response.interface';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { getMockItemsResponseInterface } from 'src/app/services/swapi-fetcher/models/items-response.interface.spec';

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
      ],
      imports: [FormsModule]
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

      const newItems = mapElements(recentlyFetchedElemet);
      expectedPresentedItems.push(...newItems);
      expectCorrectItems(expectedPresentedItems);
    }
  }));

  it('should filter as expected when filterSelect changes', fakeAsync(() => {
    fixture.detectChanges();
    // wait to fetch all responses
    tick(MockSwapiFetcherService.DelayMs * mockSwapiFetcherService.returnedResponses.length);
    const allItems: ItemInterface[] = [].concat(...mockSwapiFetcherService.returnedResponses.map(mapElements));

    expectSetFilter('', allItems);
    SwapiFetcherService.Resources.forEach(resource => {
      const filteredElements = allItems.filter(item => item.type === resource);
      expectSetFilter(resource, filteredElements);
    });
    expectSetFilter('', allItems);
  }));

  it('should set name with title if name not present', fakeAsync(() => {
    const mockedResponse = getMockItemsResponseInterface();
    mockedResponse.results.length = 1;
    delete mockedResponse.results[0].name;
    mockedResponse.results[0].title = faker.random.word();
    const expectedItems: ItemInterface[] = JSON.parse(JSON.stringify(mapElements(mockedResponse)));
    // expected set name on the title
    expectedItems[0].name = (expectedItems[0] as any).title;

    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(of(mockedResponse));
    fixture.detectChanges();
    // wait to fetch mock responses
    tick();
    expectCorrectItems(expectedItems);
  }));

  // iterate over every tbody tr in the component and test name and type from expectedPresentedItems
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

  // Return elements as expected from the component
  function mapElements(recentlyFetchedElemet: ItemsResponseInterface): ItemInterface[] {
    return recentlyFetchedElemet.results.map(item => {
      item.type = recentlyFetchedElemet.type;
      return item;
    });
  }

  // Set the filter into the select and invoke expectCorrectItems with received items
  function expectSetFilter(type: string, expectedFilteredItems: ItemInterface[]) {
    const selectControl = fixture.debugElement.query(By.css('select[name=filter]'));
    const selectElemet: HTMLSelectElement = selectControl.nativeElement;
    selectElemet.value = type;
    selectElemet.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expectCorrectItems(expectedFilteredItems);
  }
});
