import { ListResponseInterface } from './list-response.interface';
import * as faker from 'faker';

/**
 * get Mock List Response Interface
 *
 * returns mock interface of @interface ListResponseInterface
 */
export function getMockListResponseInterface(): ListResponseInterface {
  const results: any = [];
  const resultsLenght: number = faker.random.number({ min: 5, max: 10 });
  for (let i = 0; i < resultsLenght; i++) {
    const fakeItem: any = faker.helpers.createCard();
    // set always existant url
    fakeItem.url = faker.internet.url();
    results.push(fakeItem);
  }
  return {
    count: faker.random.number(),
    next: faker.internet.url(),
    previous: faker.internet.url(),
    results: results
  };
}
