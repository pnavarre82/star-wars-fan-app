/**
 * List Response Interface
 *
 * JSON response expected from SWAPI
 * check out https://swapi.co/api/
 */
export interface ListResponseInterface {
  count: number;
  next: string;
  previous: string;
  results: any[];
}
