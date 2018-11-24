import { Component, OnInit } from '@angular/core';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
import { ItemInterface } from './models/item.interface';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  items: ItemInterface[] = [];

  constructor(private swapiFetcherService: SwapiFetcherService) {}

  ngOnInit() {
    this.swapiFetcherService.getAllItems().subscribe(itemsResponse => {
      const newItems = itemsResponse.results.map(item => {
        item.type = itemsResponse.type;
        return item;
      });
      this.items.push(...newItems);
    });
  }
}
