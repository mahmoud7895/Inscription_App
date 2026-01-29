export interface User {
  id?: number;
  nom: string;
  prenom: string;
  age: number | null; // null par défaut pour le formulaire
  email: string;
  password?: string;
  token?: string; // Champ optionnel pour stocker le JWT après login
}