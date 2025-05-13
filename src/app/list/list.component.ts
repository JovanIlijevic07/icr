import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { PageModel } from '../../models/page.model';
import { FlightModel } from '../../models/flight.model';
import { NgFor, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-list',
  imports: [RouterLink,NgIf,HttpClientModule,NgFor],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  public webService: WebService
  public data: PageModel<FlightModel> | null = null

  constructor() {
    this.webService = WebService.getInstance()
    this.getFlightData()
  }

  public getFlightData(page = 0) {
    this.webService.getFlights(page).subscribe(rsp => this.data = rsp)
  }

  public first() {
    this.getFlightData()
  }

  public previous() {
    if (this.data == undefined) return
    if (this.data.first) return
    this.getFlightData(this.data.number - 1)
  }

  public next() {
    if (this.data == undefined) return
    if (this.data.last) return
    this.getFlightData(this.data.number + 1)
  }

  public last() {
    if (this.data == undefined) return
    if (this.data.last) return
    this.getFlightData(this.data.totalPages - 1)
  }

}
