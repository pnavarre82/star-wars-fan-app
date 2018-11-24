import { Component, OnInit } from '@angular/core';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';
import * as fuzzaldrinPlus from 'fuzzaldrin-plus';
@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  Resources = SwapiFetcherService.Resources; // exposed to the view
  items: ItemInterface[] = [];
  filterType: string = '';
  needle: string = '';

  status: 'loading' | 'loaded' | 'loading-error' = 'loading';

  constructor(private swapiFetcherService: SwapiFetcherService) {}

  ngOnInit() {
    this.swapiFetcherService.getAllItems().subscribe(
      itemsResponse => {
        const newItems = itemsResponse.results.map(item => {
          item.type = itemsResponse.type;
          // Name / Title not present in films added title
          item.name = item.name || item.title;
          return item;
        });
        this.items.push(...newItems);
      },
      // error reported
      () => {
        this.status = 'loading-error';
      },
      // all items loaded
      () => {
        this.status = 'loaded';
      }
    );
  }

  get filteredItems(): ItemInterface[] {
    let filteredItems: ItemInterface[];
    if (this.filterType || this.needle) {
      // loops array once to validate each object
      filteredItems = this.items.filter(item => {
        const validFilter = this.filterType ? item.type === this.filterType : true;
        let validSearch = this.needle == null || this.needle === '';

        // needled exists filter by it
        if (!validSearch) {
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              const objectString = item[key];
              // only compare strings
              if (typeof objectString === 'string') {
                validSearch = fuzzaldrinPlus.score(objectString, this.needle) > 0;

                // if element is alredy valid stops compring other properties
                if (validSearch) {
                  break;
                }
              }
            }
          }
        }

        return validFilter && validSearch;
      });
    } else {
      filteredItems = this.items.concat([]);
    }
    return filteredItems;
  }
}
