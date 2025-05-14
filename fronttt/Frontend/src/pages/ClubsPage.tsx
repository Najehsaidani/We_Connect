import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

// Components
import ClubsHeader from '@/components/clubs/ClubsHeader';
import ClubsList from '@/components/clubs/ClubsList';
import CreateClubDialog from '@/components/clubs/CreateClubDialog';
import ClubDetailsDialog from '@/components/clubs/ClubDetailsDialog';
import FloatingActionButton from '@/components/clubs/FloatingActionButton';
import ClubService from '@/services/ClubService';

const ClubsPage = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tous']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [joinedClubs, setJoinedClubs] = useState<number[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isClubDetailOpen, setIsClubDetailOpen] = useState(false);

  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: '',
    coverPhoto: '',
    profilePhoto: '',
    dateCreation: new Date().toISOString()
  });

  const { toast } = useToast();

  // Charger les clubs (en fonction de la recherche et de la catégorie)
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const query = searchQuery.trim();
        const category = activeCategory !== 'Tous' ? activeCategory : '';
        const response = await fetch(
          `http://localhost:8083/api/clubs/search?search=${query}&category=${category}`
        );
        const data = await response.json();
        setClubs(data);
      } catch (err) {
        toast({
          title: "Erreur clubs",
          description: "Impossible de charger les clubs.",
          variant: "destructive"
        });
      }
    };

    fetchClubs();
  }, [searchQuery, activeCategory]);

  // Charger les catégories au démarrage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8083/api/categories');
        const names = res.data.map((cat: any) => cat.name);
        setCategories(['Tous', ...names]);
        if (names.length > 0) {
          setNewClub(prev => ({ ...prev, category: names[0] }));
        }
      } catch (err) {
        toast({
          title: "Erreur catégories",
          description: "Impossible de charger les catégories.",
          variant: "destructive"
        });
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateClub = async () => {
    if (!newClub.name || !newClub.description || !newClub.category) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:8083/api/clubs', newClub);
      setClubs([res.data, ...clubs]);
      setJoinedClubs([...joinedClubs, res.data.id]);
      setIsCreateClubOpen(false);
      toast({
        title: "Club créé",
        description: "Votre club a été créé avec succès !"
      });

      setNewClub({
        name: '',
        description: '',
        category: categories.find(c => c !== 'Tous') || '',
        coverPhoto: '',
        profilePhoto: '',
        dateCreation: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la création du club.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClub = async (clubId: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour rejoindre un club.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (joinedClubs.includes(clubId)) {
        await ClubService.leaveClub(clubId, userId);
        setJoinedClubs(joinedClubs.filter(id => id !== clubId));
        toast({
          title: "Club quitté",
          description: "Vous avez quitté ce club."
        });
      } else {
        await ClubService.joinClub(clubId, userId);
        setJoinedClubs([...joinedClubs, clubId]);
        toast({
          title: "Club rejoint",
          description: "Vous avez rejoint ce club avec succès !"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l’adhésion au club.",
        variant: "destructive"
      });
    }
  };

  const handleClubDetailsOpen = (club: any) => {
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
        clubs={clubs}
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
