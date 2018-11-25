import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DetailViewComponent } from './detail-view.component';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { MockSwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service.spec';
import { Router, RouterLinkWithHref } from '@angular/router';
import * as faker from 'faker';
import { of, throwError, Observable } from 'rxjs';
import { By } from '@angular/platform-browser';
import { MockTypeComponent } from 'src/app/components/type/type.component.spec';
import { DebugElement } from '@angular/core';
import { MockStatusComponent } from 'src/app/components/status/status.component.spec';
import { delay } from 'rxjs/operators';
import { StatusComponent } from 'src/app/components/status/status.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RoutesPaths } from 'src/app/app-routing-paths.class';

describe('DetailViewComponent', () => {
  class MockRouterService {
    get url(): string {
      return null;
    }
    navigate() {}
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
      imports: [RouterTestingModule],
      declarations: [DetailViewComponent, MockTypeComponent, MockStatusComponent],
      providers: [
        {
          provide: SwapiFetcherService,
          useClass: MockSwapiFetcherService
        }
      ]
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
  });

  describe('no delay execution', () => {
    beforeEach(() => {
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

    it('should show strings with new lines in textarea', () => {
      const key: string = faker.lorem.word();
      const paragraphs: string = faker.lorem.paragraphs();
      swapiItem[key] = paragraphs;

      fixture.detectChanges();
      expectKeyAndValueTextareaPresent(key, paragraphs);
      fixture.detectChanges();
    });

    it('shouldn‘t show underscored properties of the swapiItem', () => {
      const underscoredProperty: string = '_' + faker.random.word();
      swapiItem[underscoredProperty] = faker.random.word();
      fixture.detectChanges();
      expectKeyAndValueNotPresent(underscoredProperty);
    });

    it('should show url as links with path relative', () => {
      spyOn(mockSwapiFetcherService, 'getNameOrTitleByUrl').and.callFake(fakeGetNameOrTitleByUrl);
      const urlKey: string = faker.random.word();
      const [url, expetedPath] = getFakeUrlAndRelativePath();
      swapiItem[urlKey] = url;
      fixture.detectChanges();
      expectUrlLinkArrayPresent(urlKey, [expetedPath]);
    });

    it('should show list of urls as multiples links with path relative', () => {
      spyOn(mockSwapiFetcherService, 'getNameOrTitleByUrl').and.callFake(fakeGetNameOrTitleByUrl);
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
      expectUrlLinkArrayPresent(urlKey, expetedPaths);
    });

    it('should contains cleanKeys returning expected results', () => {
      const sampleKey = 'sample_key';
      const resultKey = component.cleanKey(sampleKey);
      expect(resultKey).toEqual('Sample Key');
    });

    it('should contains a link  SwapiFetcherService getItem with url', done => {
      fixture.detectChanges();
      const debugElements = fixture.debugElement.queryAll(By.directive(RouterLinkWithHref));
      const index = debugElements.findIndex(debugElement => {
        return debugElement.properties['href'] === '/' + RoutesPaths.List;
      });
      expect(index).toBeGreaterThan(-1);
      done();
    });
  });

  describe('delayed execution', () => {
    beforeEach(() => {
      const delayedObservable = of(swapiItem).pipe(delay(MockSwapiFetcherService.DelayMs));
      spyOn(mockSwapiFetcherService, 'getItem').and.returnValue(delayedObservable);
    });

    it('should set status "loading" to StatusComponent during load and "loaded" when completed', fakeAsync(() => {
      fixture.detectChanges();
      const statusComponent: MockStatusComponent = fixture.debugElement.query(By.directive(StatusComponent)).componentInstance;
      expect(statusComponent.status).toEqual('loading');

      tick(MockSwapiFetcherService.DelayMs);
      fixture.detectChanges();

      expect(statusComponent.status).toEqual('loaded');
    }));
  });

  describe('error execution', () => {
    beforeEach(() => {
      spyOn(mockSwapiFetcherService, 'getItem').and.returnValue(throwError('mock error'));
    });

    it('should set status "loading-error" to StatusComponent if error received', () => {
      fixture.detectChanges();
      const statusComponent: MockStatusComponent = fixture.debugElement.query(By.directive(StatusComponent)).componentInstance;
      expect(statusComponent.status).toEqual('loading-error');
    });
  });

  function expectKeyAndValuePresent(key: string, value: any) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(input)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    const input: HTMLInputElement = fixture.debugElement.query(By.css(`input[name="${key}"]`)).nativeElement;
    const expectedValue: string = typeof value === 'string' ? value : JSON.stringify(value);
    expect(input.value).toEqual(expectedValue);
  }

  function expectKeyAndValueTextareaPresent(key: string, value: any) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(textarea)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(By.css(`textarea[name="${key}"]`)).nativeElement;
    const expectedValue: string = value;
    // Textarea replace \r with \n
    expect(textarea.value).toEqual(expectedValue.replace(/\r/g, '\n'));
  }
  function expectKeyAndValueNotPresent(key: string) {
    const label: DebugElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(input)`));
    expect(label).toEqual(null);

    const input: DebugElement = fixture.debugElement.query(By.css(`input[name="${key}"]`));
    expect(input).toEqual(null);
  }

  async function expectUrlLinkArrayPresent(key: string, expectedPaths: string[]) {
    const label: HTMLElement = fixture.debugElement.query(By.css(`[name="${key}"]:not(a)`)).nativeElement;
    expect(label.innerText).toEqual(component.cleanKey(key));

    for (let i = 0; i < expectedPaths.length; i++) {
      const expectedPath = expectedPaths[i];

      const a: HTMLLinkElement = fixture.debugElement.query(By.css(`a[name="${key}${i}"]`)).nativeElement;
      expect(a.getAttribute('href')).toEqual(expectedPath);
      const fakeGetNameOrTitle: string = await fakeGetNameOrTitleByUrl(expectedPath).toPromise();
      expect(a.innerText).toEqual(fakeGetNameOrTitle);
    }
  }

  function getFakeUrlAndRelativePath(): [string, string] {
    const urlResource: string = faker.random.arrayElement(SwapiFetcherService.Resources);
    const urlId: string = faker.random.number().toString();
    const url: string = `${SwapiFetcherService.BaseURL}${urlResource}/${urlId}/`;
    const relativePath: string = `/${urlResource}/${urlId}`;
    return [url, relativePath];
  }

  function fakeGetNameOrTitleByUrl(url: string): Observable<string> {
    return of('name of ' + url);
  }
});
