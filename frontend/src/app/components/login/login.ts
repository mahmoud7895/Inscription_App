import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; // Ajout de Router
import { AuthService } from '../../services/auth'; // Vérifie ton chemin
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        // On stocke les infos reçues du backend (nom, email, id)
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Redirection vers la page d'accueil
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.message = "❌ Email ou mot de passe incorrect.";
        console.error(err);
      }
    });
  }
}