import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';

@Component({
  imports: [RouterModule, MatToolbar],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
