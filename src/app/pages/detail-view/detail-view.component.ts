import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { StatusOptions } from 'src/app/components/status/status.component';
import { Observable } from 'rxjs';
import { RoutesPaths } from 'src/app/app-routing-paths.class';

/**
 * Component which presents detail view
 * will be show under these routes
 * /people/:id
 * /films/:id
 * ...
 * Review https://swapi.co/
 */
@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnInit {
  RoutesPaths = RoutesPaths; // exposed to view
  status: StatusOptions = 'loading';
  resource: string;
  name: string;
  values: ValueInterface[] = [];

  constructor(private swapiFetcherService: SwapiFetcherService, private router: Router) {}

  ngOnInit() {
    const url = this.router.url;

    // url looks like /resource/id -> ['', 'resource', 'id]
    this.resource = url.split('/')[1];

    this.swapiFetcherService.getItem(url).subscribe(
      item => {
        this.status = 'loaded';
        this.name = item.name || item.title;
        for (const key in item) {
          if (item.hasOwnProperty(key) && key[0] !== '_') {
            const value = item[key];
            this.values.push(this.getValue(key, value));
          }
        }
      },
      // error handling
      () => {
        this.status = 'loading-error';
      }
    );
  }

  /**
   * procces each value in the object and returns the prettier value
   * @param key extracted from the item
   * @param value extracted from the item
   */
  private getValue(key: string, value: any): ValueInterface {
    const stringValue: string = typeof value === 'string' ? value : JSON.stringify(value);
    const execResult = SwapiFetcherService.ResourcePageRegex.exec(stringValue);
    // wraps link into array to be treated as any other array of links
    if (execResult) {
      value = [stringValue];
    }
    const type: fieldType = Array.isArray(value) ? 'links' : stringValue.indexOf('\n') >= 0 ? 'long_string' : 'string';

    let links: {
      relativePath: string;
      url: string;
    }[];

    if (type === 'links') {
      links = this.getLinksFromArray(value);
    }
    return {
      name: key,
      value: stringValue,
      type: type,
      links: links
    };
  }

  /**
   *  extract all the relatives paths from the urls array
   * @param urls all the url to be processed
   */
  private getLinksFromArray(urls: string[]): { relativePath: string; url: string }[] {
    const links: { relativePath: string; url: string }[] = urls.map(url => {
      const execResult = SwapiFetcherService.ResourcePageRegex.exec(url);

      return {
        relativePath: `/${execResult[1]}/${execResult[2]}`,
        url: url
      };
    });
    return links;
  }

  /**
   * cleans and capitalize the key to make it look prettier
   * */
  cleanKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(s => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' ');
  }

  getNameTitleByUrl(url): Observable<string> {
    return this.swapiFetcherService.getNameOrTitleByUrl(url);
  }
}

type fieldType = 'string' | 'long_string' | 'links';
interface ValueInterface {
  name: string;
  value: string;
  type: fieldType;
  links?: {
    relativePath: string;
    url: string;
  }[];
}
