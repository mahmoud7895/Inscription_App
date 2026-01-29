import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  user: User = { nom: '', prenom: '', age: null, email: '', password: '' };
  confirmPassword: string = '';
  message: string = '';
  isError: boolean = false;
  isSubmitting: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Vérification : tous les champs obligatoires
    if (!this.user.nom || !this.user.prenom || !this.user.age || !this.user.email || !this.user.password) {
      this.isError = true;
      this.message = "❌ Veuillez remplir tous les champs.";
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.isError = true;
      this.message = "❌ Les mots de passe ne correspondent pas.";
      return;
    }

    this.isSubmitting = true;
    this.authService.register(this.user).subscribe({
      next: (res) => {
        this.isError = false;
        this.message = `✅ Bienvenue ${res.prenom} ! Inscription réussie.`;
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: () => {
        this.isError = true;
        this.isSubmitting = false;
        this.message = "❌ Erreur : Email déjà utilisé.";
      }
    });
  }
}