// Enum pour l'état d'un club
export enum EtatClub {
  EN_ATTENTE = "EN_ATTENTE",
  ACCEPTER = "ACCEPTER",
  REFUSER = "REFUSER"
}

// Enum pour le statut d'un événement
export enum EventStatus {
  AVENIR = "AVENIR",
  EN_COURS = "EN_COURS",
  PASSE = "PASSE",
  ANNULE = "ANNULE"
}

// Type pour une catégorie de club
export interface CategoryDto {
  id: number;
  nom: string; // Le nom de la catégorie (backend uses 'nom' instead of 'name')
  clubs?: ClubDto[]; // Optional clubs array from backend
}

// Type pour un résumé de catégorie (utilisé dans ClubDto)
export interface CategorySummaryDto {
  id: number;
  nom: string;
}

// Interface pour la création d'un club (format exact attendu par le backend)
export interface CreateClubRequest {
  nom: string;               // Nom du club
  description: string;       // Description du club
  dateCreation: string;      // Date de création au format "YYYY-MM-DD"
  createurId?: number;       // ID du créateur (facultatif)
  categoryId: number;        // ID de la catégorie (obligatoire)
}

// Type pour un club
export interface ClubDto {
  id?: number; // ID du club, facultatif pour un nouveau club
  nom: string; // Nom du club
  description: string; // Description du club
  categoryId?: number; // ID de la catégorie à laquelle appartient le club
  category?: CategorySummaryDto; // Objet catégorie complet
  image?: string; // URL de l'image principale du club (remplace profilePhoto)
  banner?: string; // URL de la bannière du club
  dateCreation?: string; // Date de création du club (format ISO 8601)
  createurId?: number; // ID du créateur du club
  etat?: EtatClub | string; // État du club (EN_ATTENTE, ACCEPTER, REFUSER)
  membres?: number; // Nombre de membres du club

  // Propriétés pour la compatibilité avec l'ancien code
  profilePhoto?: string; // Alias pour image
  coverPhoto?: string; // Alias pour banner
  members?: number; // Alias pour membres

  // Liste des événements du club
  events?: EventClubDto[];
}

// Type pour un événement de club
export interface EventClubDto {
  id?: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string; // Format ISO 8601
  dateFin: string; // Format ISO 8601
  status?: EventStatus;
  nbParticipants?: number;
  createurId?: number;
  clubId?: number;
  clubNom?: string;
  image?: string;
}
