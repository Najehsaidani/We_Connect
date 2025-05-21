// src/types/event.ts

/**
 * Enum representing the status of an event.
 * Matches the backend Status enum in com.example.weconnect.enums.Status
 */
export enum EventStatus {
  TERMINE = 'TERMINE',   // Event is finished
  ACTIVE = 'ACTIVE',     // Event is active (matches backend enum)
  INACTIVE = 'INACTIVE', // Event is inactive
  AVENIR = 'AVENIR'      // Event is upcoming
}

/**
 * Constante pour le statut par défaut des nouveaux événements
 * Utiliser ACTIVE pour les nouveaux événements (correspond à l'enum du backend)
 */
export const DEFAULT_EVENT_STATUS = EventStatus.ACTIVE;

/**
 * Fonction utilitaire pour normaliser le statut d'un événement
 * Gère les différentes valeurs possibles de Status dans le backend
 */
export const normalizeEventStatus = (status: string | undefined): EventStatus => {
  if (!status) {
    console.warn('No status provided, using default:', DEFAULT_EVENT_STATUS);
    return DEFAULT_EVENT_STATUS;
  }

  // Convertir en majuscules pour la comparaison
  const upperStatus = status.toUpperCase();
  console.log('Normalizing status:', status, 'to uppercase:', upperStatus);

  // Vérifier si le statut correspond à une valeur de l'énumération
  if (Object.values(EventStatus).includes(upperStatus as EventStatus)) {
    console.log('Status matches enum value directly:', upperStatus);
    return upperStatus as EventStatus;
  }

  // Gérer les cas spéciaux
  switch (upperStatus) {
    case 'ACTIF': // Cette valeur provient de l'autre énumération Status et cause l'erreur 500
      console.warn('Status "ACTIF" is not valid for events, using "ACTIVE" instead');
      return EventStatus.ACTIVE;
    case 'TERMINE':
    case 'FINISHED':
    case 'COMPLETED':
    case 'DONE':
      console.log('Status mapped to TERMINE');
      return EventStatus.TERMINE;
    case 'INACTIVE':
    case 'DISABLED':
    case 'CANCELLED':
    case 'CANCELED':
      console.log('Status mapped to INACTIVE');
      return EventStatus.INACTIVE;
    case 'AVENIR':
    case 'UPCOMING':
    case 'FUTURE':
    case 'PLANNED':
      console.log('Status mapped to AVENIR');
      return EventStatus.AVENIR;
    default:
      console.warn(`Unknown event status: "${status}", using default:`, DEFAULT_EVENT_STATUS);
      return DEFAULT_EVENT_STATUS;
  }
};

/**
 * Interface for event data from the backend
 */
export interface EventData {
  id: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  status: EventStatus;
  nbParticipants: number;
  createurId: number;
  image?: string;
}

/**
 * Interface for event club data from the backend
 */
export interface EventClubData {
  id: number;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  nomClub: string;
  status: EventStatus;
  nbParticipants: number;
  createurId: number;
  clubId?: number;
  image?: string;
}

/**
 * Interface for formatted event data for display
 */
export interface FormattedEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  organizer: string;
  attending: number;
  type: 'Event Universitaire' | 'Event Club';
  isUpcoming: boolean;
  createurId: number;
  source: 'university' | 'club';
}

/**
 * Function to format event data from backend to display format
 */
export const formatEventData = (event: EventData): FormattedEvent => {
  // Afficher l'événement pour le débogage
  console.log('Formatting event data:', event);

  // Vérifier si l'événement a toutes les propriétés nécessaires
  if (!event) {
    throw new Error('Event is null or undefined');
  }

  try {
    // Extraire la date et l'heure de dateDebut
    let date = new Date().toISOString().split('T')[0]; // Valeur par défaut
    let time = '00:00'; // Valeur par défaut

    if (event.dateDebut) {
      try {
        // Essayer de parser la date
        const dateObj = new Date(event.dateDebut);
        if (!isNaN(dateObj.getTime())) {
          date = dateObj.toISOString().split('T')[0];
          time = event.dateDebut.split('T')[1]?.substring(0, 5) || '00:00';
        } else {
          console.warn('Invalid date format for event:', event.id, event.dateDebut);
        }
      } catch (dateError) {
        console.error('Error parsing date:', dateError, event.dateDebut);
      }
    }

    // Normaliser le statut de l'événement
    const normalizedStatus = normalizeEventStatus(event.status);
    console.log(`Event ${event.id} status: ${event.status} -> normalized: ${normalizedStatus}`);

    // Déterminer si l'événement est à venir
    let isUpcoming = true;
    if (normalizedStatus === EventStatus.ACTIVE) {
      isUpcoming = true;
    } else if (normalizedStatus === EventStatus.TERMINE) {
      isUpcoming = false;
    } else if (normalizedStatus === EventStatus.INACTIVE) {
      isUpcoming = false;
    } else if (event.dateDebut) {
      try {
        const eventDate = new Date(event.dateDebut);
        const now = new Date();
        isUpcoming = eventDate > now;
        console.log(`Event ${event.id} date: ${eventDate} > now: ${now} = ${isUpcoming}`);
      } catch (dateError) {
        console.error('Error comparing dates:', dateError);
        isUpcoming = true; // Par défaut, considérer comme à venir
      }
    }

    return {
      id: event.id || 0,
      title: event.titre || 'Événement sans titre',
      description: event.description || 'Aucune description disponible',
      date: date,
      time: time,
      location: event.lieu || 'Campus',
      image: event.image || '/placeholder.svg',
      organizer: 'Administration',
      attending: event.nbParticipants || 0,
      type: 'Event Universitaire',
      isUpcoming: isUpcoming,
      createurId: event.createurId || 0,
      source: 'university'
    };
  } catch (error) {
    console.error('Error in formatEventData:', error, event);
    // Retourner un événement formaté manuellement en cas d'erreur
    return {
      id: event.id || 0,
      title: event.titre || 'Événement sans titre',
      description: event.description || 'Aucune description disponible',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      location: event.lieu || 'Campus',
      image: event.image || '/placeholder.svg',
      organizer: 'Administration',
      attending: event.nbParticipants || 0,
      type: 'Event Universitaire',
      isUpcoming: true,
      createurId: event.createurId || 0,
      source: 'university'
    };
  }
};

/**
 * Function to format event club data from backend to display format
 */
export const formatEventClubData = (event: EventClubData): FormattedEvent => {
  // Afficher l'événement pour le débogage
  console.log('Formatting event club data:', event);

  // Vérifier si l'événement a toutes les propriétés nécessaires
  if (!event) {
    throw new Error('Event club is null or undefined');
  }

  try {
    // Extraire la date et l'heure de dateDebut
    let date = new Date().toISOString().split('T')[0]; // Valeur par défaut
    let time = '00:00'; // Valeur par défaut

    if (event.dateDebut) {
      try {
        // Essayer de parser la date
        const dateObj = new Date(event.dateDebut);
        if (!isNaN(dateObj.getTime())) {
          date = dateObj.toISOString().split('T')[0];
          time = event.dateDebut.split('T')[1]?.substring(0, 5) || '00:00';
        } else {
          console.warn('Invalid date format for club event:', event.id, event.dateDebut);
        }
      } catch (dateError) {
        console.error('Error parsing date for club event:', dateError, event.dateDebut);
      }
    }

    // Normaliser le statut de l'événement
    const normalizedStatus = normalizeEventStatus(event.status);
    console.log(`Club event ${event.id} status: ${event.status} -> normalized: ${normalizedStatus}`);

    // Déterminer si l'événement est à venir
    let isUpcoming = true;
    if (normalizedStatus === EventStatus.ACTIVE) {
      isUpcoming = true;
    } else if (normalizedStatus === EventStatus.TERMINE) {
      isUpcoming = false;
    } else if (normalizedStatus === EventStatus.INACTIVE) {
      isUpcoming = false;
    } else if (event.dateDebut) {
      try {
        const eventDate = new Date(event.dateDebut);
        const now = new Date();
        isUpcoming = eventDate > now;
        console.log(`Club event ${event.id} date: ${eventDate} > now: ${now} = ${isUpcoming}`);
      } catch (dateError) {
        console.error('Error comparing dates for club event:', dateError);
        isUpcoming = true; // Par défaut, considérer comme à venir
      }
    }

    return {
      id: event.id || 0,
      title: event.titre || 'Événement sans titre',
      description: event.description || 'Aucune description disponible',
      date: date,
      time: time,
      location: event.lieu || 'Campus',
      image: event.image || '/placeholder.svg',
      organizer: event.nomClub || 'Club',
      attending: event.nbParticipants || 0,
      type: 'Event Club',
      isUpcoming: isUpcoming,
      createurId: event.createurId || 0,
      source: 'club'
    };
  } catch (error) {
    console.error('Error in formatEventClubData:', error, event);
    // Retourner un événement formaté manuellement en cas d'erreur
    return {
      id: event.id || 0,
      title: event.titre || 'Événement sans titre',
      description: event.description || 'Aucune description disponible',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      location: event.lieu || 'Campus',
      image: event.image || '/placeholder.svg',
      organizer: event.nomClub || 'Club',
      attending: event.nbParticipants || 0,
      type: 'Event Club',
      isUpcoming: true,
      createurId: event.createurId || 0,
      source: 'club'
    };
  }
};
