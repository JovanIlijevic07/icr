import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { FlightModel } from '../../models/flight.model';
import { JsonPipe, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SafePipe } from '../safe.pipe';

@Component({
  selector: 'app-flight',
  imports: [HttpClientModule,NgIf,RouterLink,SafePipe],
  templateUrl: './flight.component.html',
  styleUrl: './flight.component.css'
})
export class FlightComponent {

  public webService: WebService
  public flight:FlightModel | null=null

  constructor(private route: ActivatedRoute) {
    this.webService = new WebService
    route.params.subscribe(params=> {
      const id = params['id']

      this.webService.getFlightById(id)
      .subscribe(rsp=>this.flight=rsp)
    })

  }

  public getMapUrl(): string {
    return `https://www.google.com/maps?output=embed&q=${this.flight?.destination}`
  }

}
