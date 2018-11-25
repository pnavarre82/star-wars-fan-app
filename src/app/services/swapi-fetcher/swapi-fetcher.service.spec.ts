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
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MockLocalStorageService } from '../local-storage/local-storage.service.spec';

describe('SwapiFetcherService', () => {
  let httpTestingController: HttpTestingController;
  let service: SwapiFetcherService;
  let mockLocalStorageService: MockLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SwapiFetcherService,
        {
          provide: LocalStorageService,
          useClass: MockLocalStorageService
        }
      ]
    });
    service = TestBed.get(SwapiFetcherService);
    httpTestingController = TestBed.get(HttpTestingController);
    mockLocalStorageService = TestBed.get(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllItems', () => {
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

      SwapiFetcherService.Resources.forEach(resource => {
        addExpectedGetAllItemsReq(resource, expectedItems, 1, true);
      });

      // add second page once for any resource
      SwapiFetcherService.Resources.forEach(resource => {
        addExpectedGetAllItemsReq(resource, expectedItems, 2);
      });
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

      mockRequest(getUrlGetAllItems(SwapiFetcherService.FilmsPath, 1), 'Error received', {
        type: 'ERROR',
        statusText: 'Mock error',
        status: 404
      });
    });

    it('should try to grab data from LocalStorageService  it exists and don‘t request', done => {
      const receivedItems: any[] = [];
      const expectedItems: any[] = [];

      // Cache has to be added before the requests would be done
      SwapiFetcherService.Resources.forEach(resource => {
        addExpectedReqFromLocalStorage(resource, expectedItems, 1);
      });

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
    });

    it('should set fetched data from SWAPI to LocalStorageService', done => {
      const expectedItems: any[] = [];
      const requestsWithResult: { [key: string]: any } = {};
      spyOn(mockLocalStorageService, 'setItem');

      service.getAllItems().subscribe(
        // next
        () => {},
        // error
        () => {},
        // completed
        () => {
          for (const url in requestsWithResult) {
            if (requestsWithResult.hasOwnProperty(url)) {
              const result = requestsWithResult[url];
              expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(url, result);
            }
          }
          done();
        }
      );

      SwapiFetcherService.Resources.forEach(resource => {
        const resultResource = addExpectedGetAllItemsReq(resource, expectedItems, 1);
        const url = getUrlGetAllItems(resource, 1);
        requestsWithResult[url] = resultResource;
      });
    });

    it('should set every result fetched data from SWAPI to LocalStorageService for getItem', done => {
      const expectedItems: any[] = [];
      const requestsWithResult: { [key: string]: any } = {};
      spyOn(mockLocalStorageService, 'setItem');

      service.getAllItems().subscribe(
        // next
        () => {},
        // error
        () => {},
        // completed
        () => {
          for (const url in requestsWithResult) {
            if (requestsWithResult.hasOwnProperty(url)) {
              const result = requestsWithResult[url];
              expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(url, result);
            }
          }
          done();
        }
      );

      SwapiFetcherService.Resources.forEach(resource => {
        const resultResource = addExpectedGetAllItemsReq(resource, expectedItems, 1);
        resultResource.results.forEach(result => {
          requestsWithResult[result.url] = result;
        });
      });
    });
  });

  describe('getItem', () => {
    let passedUrlPath: string;
    let requestedUrlPath: string;
    let item: any;
    beforeEach(() => {
      const resource = faker.random.arrayElement(SwapiFetcherService.Resources);
      const id = faker.random.number().toString();

      passedUrlPath = `/${resource}/${id}`;
      requestedUrlPath = `${resource}/${id}/`;
      item = faker.helpers.createCard();
    });

    it('should getItem request object from swapi', done => {
      service.getItem(passedUrlPath).subscribe(
        // next
        result => {
          httpTestingController.verify();
          expect(result).toEqual(item);
          done();
        }
      );

      mockRequest(getUrlGetItem(requestedUrlPath), item);
    });

    it('should set fetched data from SWAPI to LocalStorageService', done => {
      spyOn(mockLocalStorageService, 'setItem');

      const url: string = getUrlGetItem(requestedUrlPath);

      service.getItem(passedUrlPath).subscribe(
        // next
        result => {
          expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(url, result);
          done();
        }
      );

      mockRequest(url, item);
    });

    it('should try to grab data from LocalStorageService  it exists and don‘t request', done => {
      const url: string = getUrlGetItem(requestedUrlPath);
      mockLocalStorageService.setItem(url, item);

      service.getItem(passedUrlPath).subscribe(
        // next
        result => {
          httpTestingController.verify();
          expect(result).toEqual(item);
          done();
        }
      );
    });
  });

  describe('getNameOrTitleByUrl', () => {
    let passedUrlPath: string;
    let item: any;
    beforeEach(() => {
      const resource = faker.random.arrayElement(SwapiFetcherService.Resources);
      const id = faker.random.number().toString();

      passedUrlPath = `/${resource}/${id}`;
      item = faker.helpers.createCard();
    });

    it('should getNameOrTitleByUrl return name from getItem', done => {
      const fakeName = faker.internet.userName();
      item.name = fakeName;
      spyOn(service, 'getItem').and.returnValue(of(item));
      service.getNameOrTitleByUrl(passedUrlPath).subscribe(
        // next
        result => {
          expect(result).toEqual(fakeName);
          done();
        }
      );
    });

    it('should getNameOrTitleByUrl return title from getItem if name not present', done => {
      const fakeTitle = faker.internet.userName();
      item.title = fakeTitle;
      delete item.name;
      spyOn(service, 'getItem').and.returnValue(of(item));
      service.getNameOrTitleByUrl(passedUrlPath).subscribe(
        // next
        result => {
          expect(result).toEqual(fakeTitle);
          done();
        }
      );
    });
  });

  function addExpectedGetAllItemsReq(
    relativePath: string,
    expectedItems: any[],
    currentPage: number,
    morePages: boolean = false
  ): ListResponseInterface {
    const url = getUrlGetAllItems(relativePath, currentPage);
    const nextPage: number = morePages ? currentPage + 1 : null;

    const result = nextPage !== null ? getFakeResultWithExpectedNextPage(relativePath, nextPage) : getFakeResultWithEmptyNexPage();

    expectedItems.push(...result.results);
    mockRequest(url, result);
    return result;
  }

  function getUrlGetAllItems(relativePath: string, currentPage: number): string {
    return currentPage === 1
      ? `${SwapiFetcherService.BaseURL}${relativePath}`
      : `${SwapiFetcherService.BaseURL}${relativePath}${SwapiFetcherService.PageInsert}${currentPage}`;
  }

  function getUrlGetItem(relativePath: string): string {
    return `${SwapiFetcherService.BaseURL}${relativePath}`;
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

  function addExpectedReqFromLocalStorage(
    relativePath: string,
    expectedItems: any[],
    currentPage: number,
    morePages: boolean = false
  ): void {
    const url = getUrlGetAllItems(relativePath, currentPage);
    const nextPage: number = morePages ? currentPage + 1 : null;

    const result = nextPage !== null ? getFakeResultWithExpectedNextPage(relativePath, nextPage) : getFakeResultWithEmptyNexPage();
    expectedItems.push(...result.results);
    mockLocalStorageService.setItem(url, result);
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

  getItem(resourcePath: string): Observable<any> {
    return of(null);
  }

  getNameOrTitleByUrl(resourcePath: string): Observable<string> {
    return of(null);
  }
}
