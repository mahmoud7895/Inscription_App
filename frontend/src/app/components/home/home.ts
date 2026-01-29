import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const data = localStorage.getItem('currentUser');
    if (data) {
      this.user = JSON.parse(data);
    } else {
      // Si pas d'utilisateur connecté, retour au login
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}