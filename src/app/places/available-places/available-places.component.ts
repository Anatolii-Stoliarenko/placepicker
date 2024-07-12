import { Component, DestroyRef, OnInit, signal } from "@angular/core";
import { inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map, throwError } from "rxjs";

import { Place } from "../place.model";
import { PlacesComponent } from "../places.component";
import { PlacesContainerComponent } from "../places-container/places-container.component";

import { CommonModule } from "@angular/common";

@Component({
  selector: "app-available-places",
  standalone: true,
  templateUrl: "./available-places.component.html",
  styleUrl: "./available-places.component.css",
  imports: [PlacesComponent, PlacesContainerComponent, CommonModule],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal("");
  httpClient = inject(HttpClient);
  destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>("http://localhost:3000/places")
      .pipe(
        map((response) => response.places),
        catchError((error) => {
          console.log(error);
          return throwError(
            () =>
              new Error(
                "Somathing went wrong fetching the available places. Please try againe later."
              )
          );
        })
      )
      .subscribe({
        next: (respons) => {
          this.places.set(respons);
        },
        error: (error) => {
          console.log(error);
          this.error.set(error.message);
        },
        complete: () => this.isFetching.set(false),
      });
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
