// Enum pour l'état d'un club
export enum EtatClub {
  EN_ATTENTE = "EN_ATTENTE",
  ACCEPTER = "ACCEPTER",
  REFUSER = "REFUSER"
}

// Type pour une catégorie de club
export interface CategoryDto {
  id: number;
  nom: string; // Le nom de la catégorie (backend uses 'nom' instead of 'name')
  clubs?: any[]; // Optional clubs array from backend
}

// Type pour un résumé de catégorie (utilisé dans ClubDto)
export interface CategorySummaryDto {
  id: number;
  nom: string;
}

// Type pour un club
export interface ClubDto {
  id?: number; // ID du club, facultatif pour un nouveau club
  nom: string; // Nom du club
  description: string; // Description du club
  categoryId?: number; // ID de la catégorie à laquelle appartient le club
  category?: CategorySummaryDto; // Objet catégorie complet
  coverPhoto?: string; // URL de la photo de couverture du club
  profilePhoto?: string; // URL de la photo de profil du club
  banner?: string; // Nouvelle propriété pour la bannière
  dateCreation?: string; // Date de création du club (format ISO 8601)
  createurId?: number; // ID du créateur du club
  etat?: EtatClub | string; // État du club (EN_ATTENTE, ACCEPTER, REFUSER)
  membres?: number; // Pour la compatibilité avec l'ancien code
  members?: number; // Nouvelle propriété utilisée par le backend
}
