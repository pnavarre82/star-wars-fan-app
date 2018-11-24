import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { ItemsResponseInterface } from './models/items-response.interface';
import { ListResponseInterface } from './models/list-response.interface';

/**
 * Swapi Fetcher Service
 *
 * fecth all required data from swapi API
 * api errors could be handled here for standardization purposes
 * check out https://swapi.co/api/
 */
@Injectable({
  providedIn: 'root'
})
export class SwapiFetcherService {
  static BaseURL: string = 'https://swapi.co/api/';
  static PageInsert: string = '/?page=';
  static FilmsPath: string = 'films';
  static PeoplePath: string = 'people';
  static PlanetsPath: string = 'planets';
  static SpeciesPath: string = 'species';
  static StarshipsPath: string = 'starships';
  static VehiclesPath: string = 'vehicles';
  static Resources: string[] = [
    SwapiFetcherService.FilmsPath,
    SwapiFetcherService.PeoplePath,
    SwapiFetcherService.PlanetsPath,
    SwapiFetcherService.SpeciesPath,
    SwapiFetcherService.StarshipsPath,
    SwapiFetcherService.VehiclesPath
  ];
  constructor(private httpClient: HttpClient) {}

  /**
   * Iterate over all the List pages in https://swapi.co/api/
   * https://swapi.co/api/films
   * https://swapi.co/api/people
   * https://swapi.co/api/planets
   * https://swapi.co/api/species
   * https://swapi.co/api/starships
   * https://swapi.co/api/vehicles
   *
   * Consume from all the resources and put them all together  into and observable
   * Continue returng data from each type until "next" parameter is null
   */
  getAllItems(): Observable<ItemsResponseInterface> {
    const resultObservable: Observable<ItemsResponseInterface> = Observable.create((observer: Observer<ItemsResponseInterface>) => {
      // this list contains all the resources with request remaing
      const notFinishedResources: string[] = [].concat(SwapiFetcherService.Resources);
      for (const resource of SwapiFetcherService.Resources) {
        const url: string = `${SwapiFetcherService.BaseURL}${resource}`;
        this.fecthResourcePage(url, resource, observer, notFinishedResources);
      }
    });

    return resultObservable;
  }

  private fecthResourcePage(
    url: string,
    resource: string,
    returnedObserver: Observer<ItemsResponseInterface>,
    unFinishedResources: string[]
  ) {
    this.httpClient.get(url).subscribe(
      // process each list result from swapi
      (jsonSwapiResult: ListResponseInterface) => {
        returnedObserver.next({
          type: resource,
          results: jsonSwapiResult.results
        });
        if (jsonSwapiResult.next) {
          this.fecthResourcePage(jsonSwapiResult.next, resource, returnedObserver, unFinishedResources);
        } else {
          // there is any remaing page for this resource, so removed from the list
          const indexUnFinishedResources = unFinishedResources.indexOf(resource);
          unFinishedResources.splice(indexUnFinishedResources, 1);
          // last resource hasn't any remaining page
          if (unFinishedResources.length === 0) {
            returnedObserver.complete();
          }
        }
      },
      // process errors from swapi api
      error => {
        // resend error to subscriber
        const indexUnFinishedResources = unFinishedResources.indexOf(resource);
        unFinishedResources.splice(indexUnFinishedResources, 1);
        returnedObserver.error(error);

        // last resource throws error observable completed
        if (unFinishedResources.length === 0) {
          returnedObserver.complete();
        }
      }
    );
  }
}
