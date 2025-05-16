
import React from 'react';
import ClubCard from './ClubCard';
import NoClubsFound from './NoClubsFound';

interface ClubsListProps {
  clubs: any[];
  joinedClubs: number[];
  onJoinClub: (clubId: number) => void;
  onClubDetailsOpen: (club: any) => void;
  onCreateClubClick: () => void;
}

const ClubsList = ({ clubs, joinedClubs, onJoinClub, onClubDetailsOpen, onCreateClubClick }: ClubsListProps) => {
  if (clubs.length === 0) {
    return <NoClubsFound onCreateClick={onCreateClubClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clubs.map((club, index) => (
        <ClubCard 
          key={club.id}
          club={club}
          index={index}
          isJoined={joinedClubs.includes(club.id)}
          onJoin={onJoinClub}
          onOpenDetails={onClubDetailsOpen}
        />
      ))}
    </div>
  );
};

export default ClubsList;
