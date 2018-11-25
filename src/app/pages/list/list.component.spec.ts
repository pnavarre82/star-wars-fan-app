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
import { of, throwError } from 'rxjs';
import { getMockItemsResponseInterface } from 'src/app/services/swapi-fetcher/models/items-response.interface.spec';
import * as fuzzaldrinPlus from 'fuzzaldrin-plus';
import { Router } from '@angular/router';
import { MockStatusComponent } from 'src/app/components/status/status.component.spec';
import { StatusComponent } from 'src/app/components/status/status.component';

describe('ListComponent', () => {
  class MockRouterService {
    navigate() {}
  }

  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockSwapiFetcherService: MockSwapiFetcherService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListComponent, MockTypeComponent, MockStatusComponent],
      providers: [
        {
          provide: SwapiFetcherService,
          useClass: MockSwapiFetcherService
        },
        {
          provide: Router,
          useClass: MockRouterService
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

  it('should set status "loading" to StatusComponent during load and "loaded" when completed', fakeAsync(() => {
    fixture.detectChanges();
    const statusComponent: MockStatusComponent = fixture.debugElement.query(By.directive(StatusComponent)).componentInstance;
    const responsesLength = mockSwapiFetcherService.returnedResponses.length;
    for (let i = 0; i < responsesLength; i++) {
      expect(statusComponent.status).toEqual('loading');
      // make next object appear in the subscription
      tick(MockSwapiFetcherService.DelayMs);
      fixture.detectChanges();
    }
    expect(statusComponent.status).toEqual('loaded');
  }));

  it('should show error icon if get getAllItems send any loading-error', fakeAsync(() => {
    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(throwError('mock error'));
    fixture.detectChanges();
    tick();

    const statusComponent: MockStatusComponent = fixture.debugElement.query(By.directive(StatusComponent)).componentInstance;
    expect(statusComponent.status).toEqual('loading-error');
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

  it('should filter as expected when search changes', fakeAsync(() => {
    const firstPrefix = 'object first prefix';
    const secondPrefix = 'object second prefix';
    const mockedResponse = getMockItemsResponseInterface();
    mockedResponse.results.length = 2;
    // added a prefix to all object properties to avoid collisions on random object
    addPrefixToAllProperty(firstPrefix, mockedResponse.results[0]);
    addPrefixToAllProperty(secondPrefix, mockedResponse.results[1]);
    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(of(mockedResponse));

    fixture.detectChanges();
    // wait to fetch all responses
    tick();
    const allItems: ItemInterface[] = [].concat(mockedResponse.results);

    expectSetSearch('', allItems);
    expectSetSearch('this string doesn‘t exists in any object', []);
    expectSetSearch(firstPrefix.toUpperCase(), [mockedResponse.results[0]]);
    expectSetSearch(secondPrefix.toUpperCase(), [mockedResponse.results[1]]);
  }));

  it('should sort result depending on fuzzaldrinPlus score', fakeAsync(() => {
    const firstPrefix = 'object first prefix';
    const secondPrefix = 'object second prefix';
    const mockedResponse = getMockItemsResponseInterface();
    mockedResponse.results.length = 2;
    // added a prefix to all object properties to avoid collisions on random object
    addPrefixToAllProperty(firstPrefix, mockedResponse.results[0]);
    addPrefixToAllProperty(secondPrefix, mockedResponse.results[1]);
    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(of(mockedResponse));

    spyOn(fuzzaldrinPlus, 'score').and.returnValues(1, 2);
    fixture.detectChanges();
    // wait to fetch all responses
    tick();

    expectSetSearch('object', [mockedResponse.results[1], mockedResponse.results[0]]);
  }));

  it('should add extra score if occurrence appears on the name / title', fakeAsync(() => {
    const occurrence = 'looking for this occurence';
    const mockedResponse = getMockItemsResponseInterface();
    mockedResponse.results.length = 2;
    // added a prefix to all object properties to avoid collisions on random object
    mockedResponse.results[1]['name'] = occurrence;
    mockedResponse.results[0]['other'] = occurrence;
    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(of(mockedResponse));

    fixture.detectChanges();
    // wait to fetch all responses
    tick();

    expectSetSearch(occurrence, [mockedResponse.results[1], mockedResponse.results[0]]);
  }));

  it('should navigate to resource/:id route on click tr tbody', fakeAsync(() => {
    const mockRouter: MockRouterService = TestBed.get(Router);
    spyOn(mockRouter, 'navigate');

    const mockedResponse = getMockItemsResponseInterface();
    mockedResponse.results.length = 1;
    const clickedItem = mockedResponse.results[0];
    const id: string = faker.random.number().toString();
    // every swapi object has its own url like https://swapi.co/api/people/1/
    clickedItem.url = `https://swapi.co/api/${clickedItem.type}/${id}/`;
    spyOn(mockSwapiFetcherService, 'getAllItems').and.returnValue(of(mockedResponse));

    fixture.detectChanges();
    // wait to fetch all responses
    tick();

    const trControl = fixture.debugElement.query(By.css('tbody tr'));
    const trElement: HTMLTableHeaderCellElement = trControl.nativeElement;
    trElement.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${clickedItem.type}/${id}`]);
  }));

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

  function addPrefixToAllProperty(prefix: string, objectToPrefix: object) {
    for (const key in objectToPrefix) {
      if (objectToPrefix.hasOwnProperty(key)) {
        const element = objectToPrefix[key];
        // avoid add concatenate string to dates, numbers, ...
        if (typeof element === 'string') {
          objectToPrefix[key] = prefix + element;
        }
      }
    }
  }

  // Set the filter into the select and invoke expectCorrectItems with received items
  function expectSetSearch(search: string, expectedFilteredItems: ItemInterface[]) {
    const inputControl = fixture.debugElement.query(By.css('input[name=search]'));
    const inputElemet: HTMLInputElement = inputControl.nativeElement;
    inputElemet.value = search;
    inputElemet.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expectCorrectItems(expectedFilteredItems);
  }
});
