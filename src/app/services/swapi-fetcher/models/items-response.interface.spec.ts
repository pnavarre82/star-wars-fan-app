import * as faker from 'faker';
import { ItemsResponseInterface } from './items-response.interface';
import { SwapiFetcherService } from '../swapi-fetcher.service';

/**
 * get Mock List Response Interface
 *
 * returns mock interface of @interface ItemsResponseInterface
 */
export function getMockItemsResponseInterface(): ItemsResponseInterface {
  const results: any = [];
  const resultsLenght: number = faker.random.number({ min: 5, max: 10 });
  for (let i = 0; i < resultsLenght; i++) {
    results.push(faker.helpers.createCard());
  }

  return {
    type: faker.random.arrayElement(SwapiFetcherService.Resources),
    results: results
  };
}
