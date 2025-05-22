
import React from 'react';
import ClubCard from './ClubCard';
import NoClubsFound from './NoClubsFound';

interface ClubsListProps {
  clubs: any[];
  joinedClubs: number[];
  onJoinClub: (clubId: number) => void;
  onClubDetailsOpen: (club: any) => void;
  onCreateClubClick: () => void;
  currentUserId?: number; // ID de l'utilisateur connecté
}

const ClubsList = ({ clubs, joinedClubs, onJoinClub, onClubDetailsOpen, onCreateClubClick, currentUserId }: ClubsListProps) => {
  if (clubs.length === 0) {
    return <NoClubsFound onCreateClick={onCreateClubClick} />;
  }

  // Ajouter des logs pour déboguer
  console.log('ClubsList - joinedClubs:', joinedClubs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club, index) => {
        // Vérifier si l'utilisateur est membre du club
        const isJoined = joinedClubs.includes(club.id);
        console.log(`Club ${club.id} (${club.name}) - isJoined: ${isJoined}`);

        return (
          <ClubCard
            key={club.id}
            club={club}
            index={index}
            isJoined={isJoined}
            onJoin={onJoinClub}
            onOpenDetails={onClubDetailsOpen}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
};

export default ClubsList;
