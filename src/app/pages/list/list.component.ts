import { Component, OnInit } from '@angular/core';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  Resources = SwapiFetcherService.Resources; // exposed to the view
  items: ItemInterface[] = [];
  filterType: string = '';
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
    if (this.filterType) {
      filteredItems = this.items.filter(item => item.type === this.filterType);
    } else {
      filteredItems = this.items.concat([]);
    }
    return filteredItems;
  }
}
