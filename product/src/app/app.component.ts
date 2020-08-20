import { Component } from '@angular/core';
import * as _ from 'underscore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  constructor() {
    console.log('underscoreload');
    _.find([1, 2, 3, 4, 5, 6], function(num) { return num % 2 === 0; });
  }
}
