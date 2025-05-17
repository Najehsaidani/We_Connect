// Type pour une catégorie de club
export interface CategoryDto {
  id: number;
  name: string; // Le nom de la catégorie
}

// Type pour un club
export interface ClubDto {
  id?: number; // ID du club, facultatif pour un nouveau club
  nom: string; // Nom du club
  description: string; // Description du club
  categoryId: number; // ID de la catégorie à laquelle appartient le club
  coverPhoto: string; // URL de la photo de couverture du club
  profilePhoto: string; // URL de la photo de profil du club
  dateCreation: string; // Date de création du club (format ISO 8601)
}
