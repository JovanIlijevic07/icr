import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WebService } from '../web.service';
import { FlightModel } from '../../models/flight.model';
import { JsonPipe, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-flight',
  imports: [JsonPipe,HttpClientModule,NgIf,RouterLink],
  templateUrl: './flight.component.html',
  styleUrl: './flight.component.css'
})
export class FlightComponent {

  public webService: WebService
  public flight:FlightModel | null=null

  constructor(private route: ActivatedRoute) {
    this.webService = new WebService
    route.params.subscribe(params=> {
      this.webService.getFlightById(params['id']).subscribe(rsp=>this.flight=rsp)
    })

  }

}
