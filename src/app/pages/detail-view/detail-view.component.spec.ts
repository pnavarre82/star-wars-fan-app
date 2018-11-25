import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailViewComponent } from './detail-view.component';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { MockSwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service.spec';
import { Router } from '@angular/router';
import * as faker from 'faker';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MockTypeComponent } from 'src/app/components/type/type.component.spec';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { realpath } from 'fs';

describe('DetailViewComponent', () => {
  class MockRouterService {
    get url(): string {
      return null;
    }
  }

  let component: DetailViewComponent;
  let fixture: ComponentFixture<DetailViewComponent>;
  let resource: string;
  let id: string;
  let mockRouter: MockRouterService;
  let mockSwapiFetcherService: MockSwapiFetcherService;
  let swapiItem;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailViewComponent, MockTypeComponent],
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
      schemas: [NO_ERRORS_SCHEMA] // disabled errors from link routes which won't be tested
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailViewComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.get(Router);
    mockSwapiFetcherService = TestBed.get(SwapiFetcherService);

    resource = faker.random.arrayElement(SwapiFetcherService.Resources);
    id = faker.random.number().toString();
    swapiItem = faker.helpers.createCard();

    // delete all array properties as are non-valid url arrys
    for (const key in swapiItem) {
      if (swapiItem.hasOwnProperty(key) && Array.isArray(swapiItem[key])) {
        delete swapiItem[key];
      }
    }

    spyOnProperty(mockRouter, 'url', 'get').and.returnValue(`/${resource}/${id}`);
    spyOn(mockSwapiFetcherService, 'getItem').and.returnValue(of(swapiItem));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should request SwapiFetcherService getItem with url', () => {
    fixture.detectChanges();
    expect(mockSwapiFetcherService.getItem).toHaveBeenCalledWith(mockRouter.url);
  });

  it('should match title with resource if has name', () => {
    swapiItem.name = faker.random.word();
    fixture.detectChanges();

    const title: HTMLElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(title.innerText).toEqual(`${resource}: ${swapiItem.name}`);
  });

  it('should match title with resource if has title (films)', () => {
    delete swapiItem.name;
    swapiItem.title = faker.random.word();
    fixture.detectChanges();

    const title: HTMLElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(title.innerText).toEqual(`${resource}: ${swapiItem.title}`);
  });

  it('should show every property of the swapiItem', () => {
    fixture.detectChanges();

    for (const key in swapiItem) {
      if (swapiItem.hasOwnProperty(key)) {
        const value = swapiItem[key];
        expectKeyAndValuePresent(key, value);
      }
    }
  });

  it('shouldn‘t show underscored properties of the swapiItem', () => {
    const underscoredProperty: string = '_' + faker.random.word();
    swapiItem[underscoredProperty] = faker.random.word();
    fixture.detectChanges();
    expectKeyAndValueNotPresent(underscoredProperty);
  });

  it('should show url as links with path relative', () => {
    const urlKey: string = faker.random.word();
    const [url, expetedPath] = getFakeUrlAndRelativePath();
    swapiItem[urlKey] = url;
    fixture.detectChanges();
    expectUrlLinkPresent(urlKey, url, expetedPath);
  });

  it('should show list of urls as multiples links with path relative', () => {
    const urlKey: string = faker.random.word();
    const linksLength = faker.random.number({ min: 2, max: 5 });
    const expetedPaths: string[] = [];
    const urls: string[] = [];
    for (let i = 0; i < linksLength; i++) {
      const [url, expetedPath] = getFakeUrlAndRelativePath();
      expetedPaths.push(expetedPath);
      urls.push(url);
    }
    swapiItem[urlKey] = urls;
    fixture.detectChanges();
    expectUrlLinkArrayPresent(urlKey, urls, expetedPaths);
  });

  it('should contains cleanKeys returning expected results', () => {
    const sampleKey = 'sample_key';
    const resultKey = component.cleanKey(sampleKey);
    expect(resultKey).toEqual('Sample Key');
  });

  function expectKeyAndValuePresent(key: string, value: any) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(input)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    const input: HTMLInputElement = fixture.debugElement.query(By.css(`input[name="${key}"]`)).nativeElement;
    const expectedValue: string = typeof value === 'string' ? value : JSON.stringify(value);
    expect(input.value).toEqual(expectedValue);
  }

  function expectKeyAndValueNotPresent(key: string) {
    const label: DebugElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(input)`));
    expect(label).toEqual(null);

    const input: DebugElement = fixture.debugElement.query(By.css(`input[name="${key}"]`));
    expect(input).toEqual(null);
  }

  function expectUrlLinkPresent(key: string, url: string, expectedPath: string) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(a)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    // 0 added beacuse is first item index
    const a: HTMLLinkElement = fixture.debugElement.query(By.css(`a[name="${key}0"]`)).nativeElement;
    expect(a.getAttribute('routerlink')).toEqual(expectedPath);
    expect(a.innerText).toEqual(url);
  }

  function expectUrlLinkArrayPresent(key: string, urls: string[], expectedPaths: string[]) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(a)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const expectedPath = expectedPaths[i];

      const a: HTMLLinkElement = fixture.debugElement.query(By.css(`a[name="${key}${i}"]`)).nativeElement;
      expect(a.getAttribute('routerlink')).toEqual(expectedPath);
      expect(a.innerText).toEqual(url);
    }
  }

  function getFakeUrlAndRelativePath(): [string, string] {
    const urlResource: string = faker.random.arrayElement(SwapiFetcherService.Resources);
    const urlId: string = faker.random.number().toString();
    const url: string = `${SwapiFetcherService.BaseURL}${urlResource}/${urlId}/`;
    const relativePath: string = `/${urlResource}/${urlId}`;
    return [url, relativePath];
  }
});
