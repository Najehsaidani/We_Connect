// src/types/participant.ts

/**
 * Enum representing the status of a participant in an event or event club.
 * Matches the backend ParticipantStatus enum.
 */
export enum ParticipantStatus {
  CONFIRMED = 'CONFIRMED',   // Participation is confirmed
  PENDING = 'PENDING',       // Participation is pending approval
  CANCELLED = 'CANCELLED'    // Participation has been cancelled
}

/**
 * Type for participant status display information
 */
export interface ParticipantStatusDisplay {
  label: string;
  bgColor: string;
  textColor: string;
}

/**
 * Map of participant status to display information
 */
export const participantStatusDisplayMap: Record<ParticipantStatus, ParticipantStatusDisplay> = {
  [ParticipantStatus.CONFIRMED]: {
    label: 'Confirmé',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  [ParticipantStatus.PENDING]: {
    label: 'En attente',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  [ParticipantStatus.CANCELLED]: {
    label: 'Annulé',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  }
};

/**
 * Get display information for a participant status
 */
export function getParticipantStatusDisplay(status: ParticipantStatus | string): ParticipantStatusDisplay {
  if (status in ParticipantStatus) {
    return participantStatusDisplayMap[status as ParticipantStatus];
  }
  
  // Default to PENDING if status is not recognized
  return participantStatusDisplayMap[ParticipantStatus.PENDING];
}
