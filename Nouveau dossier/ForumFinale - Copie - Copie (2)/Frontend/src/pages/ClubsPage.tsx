
import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Components
import ClubsHeader from '@/components/clubs/ClubsHeader';
import ClubsList from '@/components/clubs/ClubsList';
import CreateClubDialog from '@/components/clubs/CreateClubDialog';
import ClubDetailsDialog from '@/components/clubs/ClubDetailsDialog';
import FloatingActionButton from '@/components/clubs/FloatingActionButton';

// Data
import { initialClubs, categories } from '@/components/clubs/clubsData';

const ClubsPage = () => {
  const [clubs, setClubs] = useState(initialClubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<number[]>([]);
  const [selectedClub, setSelectedClub] = useState<boolean>(null);
  const [isClubDetailOpen, setIsClubDetailOpen] = useState(false);
  
  // Form state for new club
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: 'Académique',
    coverPhoto: '',
    profilePhoto: ''
  });
  
  const { toast } = useToast();

  // Filter clubs based on search query and category
  const filteredClubs = clubs.filter(club => {
    const matchesQuery = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tous' || club.category === activeCategory;
    
    return matchesQuery && matchesCategory;
  });

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle club creation with photo uploads
  const handleCreateClub = () => {
    if (!newClub.name || !newClub.description) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const createdClub = {
        id: clubs.length + 1,
        name: newClub.name,
        description: newClub.description,
        members: 1,
        banner: newClub.coverPhoto || '/placeholder.svg',
        category: newClub.category,
        nextEvent: 'Aucun événement planifié',
        location: 'À déterminer',
        createdAt: new Date().toISOString().split('T')[0],
        membersList: [
          { id: 1, name: 'Vous', role: 'Fondateur', avatar: newClub.profilePhoto || '/placeholder.svg' }
        ]
      };
      
      setClubs([createdClub, ...clubs]);
      setJoinedClubs([...joinedClubs, createdClub.id]);
      setIsLoading(false);
      setIsCreateClubOpen(false);
      
      // Reset form
      setNewClub({
        name: '',
        description: '',
        category: 'Académique',
        coverPhoto: '',
        profilePhoto: ''
      });
      
      toast({
        title: "Club créé",
        description: "Votre club a été créé avec succès !",
      });
    }, 1000);
  };

  // Handle joining/leaving a club
  const handleJoinClub = (clubId: number) => {
    if (joinedClubs.includes(clubId)) {
      setJoinedClubs(joinedClubs.filter(id => id !== clubId));
      toast({
        title: "Club quitté",
        description: "Vous avez quitté ce club.",
      });
    } else {
      setJoinedClubs([...joinedClubs, clubId]);
      toast({
        title: "Club rejoint",
        description: "Vous avez rejoint ce club avec succès !",
      });
    }
  };

  // Handle opening club details
  const handleClubDetailsOpen = (club) => {
    setSelectedClub(club);
    setIsClubDetailOpen(true);
  };

  return (
    <div className="page-container">
      <ClubsHeader 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ClubsList 
        clubs={filteredClubs}
        joinedClubs={joinedClubs}
        onJoinClub={handleJoinClub}
        onClubDetailsOpen={handleClubDetailsOpen}
        onCreateClubClick={() => setIsCreateClubOpen(true)}
      />

      <FloatingActionButton onClick={() => setIsCreateClubOpen(true)} />

      <CreateClubDialog 
        open={isCreateClubOpen}
        onOpenChange={setIsCreateClubOpen}
        onCreateClub={handleCreateClub}
        isLoading={isLoading}
        newClub={newClub}
        setNewClub={setNewClub}
      />
      
      <ClubDetailsDialog 
        open={isClubDetailOpen}
        onOpenChange={setIsClubDetailOpen}
        club={selectedClub}
        isJoined={selectedClub ? joinedClubs.includes(selectedClub.id) : false}
        onJoin={handleJoinClub}
      />
    </div>
  );
};

export default ClubsPage;
