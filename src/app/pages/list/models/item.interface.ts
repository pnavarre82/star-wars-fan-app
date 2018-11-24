/**
 * Item Interface
 *
 * Each item requested from SwapiFetcherService results
 */
export interface ItemInterface {
  type: string;
  name: string;
  // will contain all other properties returned from SWAPI
}
