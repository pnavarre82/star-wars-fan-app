import * as faker from 'faker';
import { ItemInterface } from './item.interface';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';

/**
 * get Mock Item Interface
 *
 * returns mock interface of @interface ItemInterface
 */

export function getMockItemInterface(): ItemInterface {
  // additional properties fetched from SWAPI mocked by faker
  const result: any = faker.helpers.createCard();
  result.type = faker.random.arrayElement(SwapiFetcherService.Resources);
  result.name = faker.hacker.noun();
  return result;
}
