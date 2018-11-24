import { Component, OnInit } from '@angular/core';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';
import * as fuzzaldrinPlus from 'fuzzaldrin-plus';
import { Router } from '@angular/router';
@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  items: ItemInterface[] = [];
  lastFilteredItems: ItemInterface[];

  Resources = SwapiFetcherService.Resources; // exposed to the view
  filterType: string = '';
  needle: string = '';
  previousFilterType: string;
  previousNeedle: string;
  previousItemLength: number;

  status: 'loading' | 'loaded' | 'loading-error' = 'loading';

  constructor(private swapiFetcherService: SwapiFetcherService, private router: Router) {}

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
    // only change lastFilteredItems if something has really changed
    if (
      this.filterType !== this.previousFilterType ||
      this.needle !== this.previousNeedle ||
      this.items.length !== this.previousItemLength
    ) {
      // sets all previous values
      this.previousFilterType = this.filterType;
      this.previousNeedle = this.needle;
      this.previousItemLength = this.items.length;
      if (this.filterType || this.needle) {
        const isPresentNeedle = this.needle && this.needle !== '';

        // loops array once to validate each object
        this.lastFilteredItems = this.items.filter(item => {
          const validFilter = this.filterType ? item.type === this.filterType : true;
          const validSearch = !isPresentNeedle || this.searchObject(item);

          return validFilter && validSearch;
        });
        if (isPresentNeedle) {
          this.lastFilteredItems = this.lastFilteredItems.sort((itemA: any, itemB: any) => itemB._fuzzaldrinPlus - itemA._fuzzaldrinPlus);
        }
      } else {
        this.lastFilteredItems = this.items.concat([]);
      }
    }
    return this.lastFilteredItems;
  }

  searchObject(item: ItemInterface): boolean {
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        const objectString = item[key];
        // only compare strings
        if (typeof objectString === 'string') {
          let score = fuzzaldrinPlus.score(objectString, this.needle);

          // if element is alredy valid stops comparing other properties
          if (score > 0) {
            // add extra points if occurence  appers in the name or title
            if (key === 'name' || key === 'title') {
              score += 1000000;
            }
            // establish _fuzzaldrinPlus to sort by this later

            (item as any)._fuzzaldrinPlus = score;
            return true;
          }
        }
      }
    }

    // none property fits to needle
    return false;
  }

  navigateToDetail() {
    this.router.navigate(['/people/1']);
  }
}
