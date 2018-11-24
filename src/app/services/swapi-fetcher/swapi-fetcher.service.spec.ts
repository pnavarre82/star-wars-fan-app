import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SwapiFetcherService } from './swapi-fetcher.service';
import { getMockListResponseInterface } from './models/list-response.interface.spec';
import { ListResponseInterface } from './models/list-response.interface';
import { ItemsResponseInterface } from './models/items-response.interface';
import { Injectable } from '@angular/core';
import { Observable, of, concat } from 'rxjs';
import { delay, mapTo } from 'rxjs/operators';
import { getMockItemsResponseInterface } from './models/items-response.interface.spec';
import * as faker from 'faker';
import { andObservables } from '@angular/router/src/utils/collection';

describe('SwapiFetcherService', () => {
  let httpTestingController: HttpTestingController;
  let service: SwapiFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SwapiFetcherService]
    });
    service = TestBed.get(SwapiFetcherService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllItems iterate over all pages from swapi', done => {
    const receivedItems: any[] = [];
    const expectedItems: any[] = [];

    service.getAllItems().subscribe(
      // next
      (itemsResponse: ItemsResponseInterface) => {
        receivedItems.push(...itemsResponse.results);
      },
      // error
      () => {},
      // completed
      () => {
        httpTestingController.verify();
        expect(receivedItems).toEqual(expectedItems);
        done();
      }
    );

    addExpectedReq(SwapiFetcherService.FilmsPath, expectedItems, 1, true);
    addExpectedReq(SwapiFetcherService.PeoplePath, expectedItems, 1, true);
    addExpectedReq(SwapiFetcherService.PlanetsPath, expectedItems, 1, true);
    addExpectedReq(SwapiFetcherService.SpeciesPath, expectedItems, 1, true);
    addExpectedReq(SwapiFetcherService.StarshipsPath, expectedItems, 1, true);
    addExpectedReq(SwapiFetcherService.VehiclesPath, expectedItems, 1, true);
    // add second page once for any resource
    addExpectedReq(SwapiFetcherService.FilmsPath, expectedItems, 2);
    addExpectedReq(SwapiFetcherService.PeoplePath, expectedItems, 2);
    addExpectedReq(SwapiFetcherService.PlanetsPath, expectedItems, 2);
    addExpectedReq(SwapiFetcherService.SpeciesPath, expectedItems, 2);
    addExpectedReq(SwapiFetcherService.StarshipsPath, expectedItems, 2);
    addExpectedReq(SwapiFetcherService.VehiclesPath, expectedItems, 2);
  });

  it('should getAllItems return error if any request return erro from swapi', done => {
    service.getAllItems().subscribe(
      // next
      () => {},
      // error
      () => {
        done();
      }
    );

    mockRequest(getUrl(SwapiFetcherService.FilmsPath, 1), 'Error received', {
      type: 'ERROR',
      statusText: 'Mock error',
      status: 404
    });
  });

  function addExpectedReq(relativePath: string, expectedItems: any[], currentPage: number, morePages: boolean = false): void {
    const url = getUrl(relativePath, currentPage);
    const nextPage: number = morePages ? currentPage + 1 : null;

    const result = nextPage !== null ? getFakeResultWithExpectedNextPage(relativePath, nextPage) : getFakeResultWithEmptyNexPage();
    expectedItems.push(...result.results);
    mockRequest(url, result);
  }

  function getUrl(relativePath: string, currentPage: number): string {
    return currentPage === 1
      ? `${SwapiFetcherService.BaseURL}${relativePath}`
      : `${SwapiFetcherService.BaseURL}${relativePath}${SwapiFetcherService.PageInsert}${currentPage}`;
  }

  function getFakeResultWithExpectedNextPage(relativePath: string, pageNumber: number): ListResponseInterface {
    const result: ListResponseInterface = getMockListResponseInterface();
    result.next = `${SwapiFetcherService.BaseURL}${relativePath}${SwapiFetcherService.PageInsert}${pageNumber}`;
    return result;
  }

  function getFakeResultWithEmptyNexPage(): ListResponseInterface {
    const result: ListResponseInterface = getMockListResponseInterface();
    result.next = null;
    return result;
  }

  function mockRequest(url: string, result: any, opts: any = null): void {
    const reqFilms = httpTestingController.expectOne(url);
    // if null passed as opts throws error replaced by undefined
    reqFilms.flush(result, opts || undefined);
  }
});

/**
 * SwapiFetcherService Mock for testing purposes
 */
@Injectable()
export class MockSwapiFetcherService {
  static DelayMs: number = 5000;

  // stores all returned responses to review items returned
  private _returnedResponses: ItemsResponseInterface[];

  get returnedResponses(): ItemsResponseInterface[] {
    if (!this._returnedResponses) {
      throw new Error('getAllItems not invoked');
    }
    return [].concat(this._returnedResponses);
  }

  constructor() {}

  getAllItems(): Observable<ItemsResponseInterface> {
    this._returnedResponses = [];
    const observables: Observable<ItemsResponseInterface>[] = [];
    const resultsLenght: number = faker.random.number({ min: 5, max: 10 });
    for (let i = 0; i < resultsLenght; i++) {
      observables.push(this.eachGenerateMockResponse());
    }

    return concat(...observables);
  }

  private eachGenerateMockResponse(): Observable<ItemsResponseInterface> {
    const mockResponse = of<ItemsResponseInterface>(null);
    const returnedResponse = getMockItemsResponseInterface();
    this._returnedResponses.push(returnedResponse);
    return mockResponse.pipe(
      delay(MockSwapiFetcherService.DelayMs),
      mapTo(returnedResponse)
    );
  }
}
