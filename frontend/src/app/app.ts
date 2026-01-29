import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import requis pour <router-outlet>
import { RegisterComponent } from './components/register/register'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // Ajoutez BIEN RouterOutlet ici pour que le routage fonctionne
  imports: [RouterOutlet, RegisterComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'frontend';
}