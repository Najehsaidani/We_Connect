import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Home } from 'lucide-react';
import FloatingActionButton from '@/components/clubs/FloatingActionButton';
import ClubsHeader from '@/components/clubs/ClubsHeader';
import ClubsList from '@/components/clubs/ClubsList';
import CreateClubDialog from '@/components/clubs/CreateClubDialog';
import ClubDetailsDialog from '@/components/clubs/ClubDetailsDialog';
import ClubManagementPanel from '@/components/clubs/ClubManagementPanel';

import { clubService } from '@/services/clubService';
import { categoryService } from '@/services/categoryService';
import { ClubDto, CategoryDto, CreateClubRequest } from '@/types/club';
// Implémentation simplifiée du hook useAuth
const useAuth = () => {
  // Récupérer l'utilisateur connecté depuis le localStorage
  const storedUser = localStorage.getItem('userId');
  let currentUser;

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', e);
    }
  }

  // Si aucun utilisateur n'est stocké, utiliser un utilisateur par défaut
  const mockUser = currentUser || {
    id: 2, // ID différent pour tester
    username: 'user2',
    email: 'user2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    // Simuler un utilisateur avec le rôle ETUDIANT et ADMIN_CLUB
    roles: ['ROLE_USER', 'ROLE_ETUDIANT', 'ROLE_ADMIN_CLUB'],
    avatar: 'https://via.placeholder.com/150'
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string): boolean => {
    if (!mockUser || !mockUser.roles) return false;
    return mockUser.roles.includes(role);
  };

  // Fonction pour stocker l'utilisateur dans le localStorage
  const setCurrentUser = (user: any) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', e);
    }
  };

  // Fonction de connexion simulée
  const login = async (username: string, password: string) => {
    // Simuler différents utilisateurs selon le nom d'utilisateur
    let user;

    if (username === 'user1') {
      user = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['ROLE_USER', 'ROLE_ETUDIANT', 'ROLE_ADMIN_CLUB'],
        avatar: 'https://via.placeholder.com/150'
      };
    } else if (username === 'user2') {
      user = {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        roles: ['ROLE_USER', 'ROLE_ETUDIANT', 'ROLE_ADMIN_CLUB'],
        avatar: 'https://via.placeholder.com/150'
      };
    } else {
      user = {
        id: 3,
        username: username,
        email: `${username}@example.com`,
        firstName: 'Guest',
        lastName: 'User',
        roles: ['ROLE_USER', 'ROLE_ETUDIANT'],
        avatar: 'https://via.placeholder.com/150'
      };
    }

    setCurrentUser(user);
    return user;
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('currentUser');
  };

  return {
    user: mockUser,
    isAuthenticated: !!mockUser,
    isLoading: false,
    login,
    logout,
    hasRole,
    setCurrentUser
  };
};

interface NewClub {
  // Propriétés principales alignées avec ClubDto
  nom: string;                // Nom du club
  description: string;        // Description du club
  categoryId?: number;        // ID de la catégorie sélectionnée
  categoryName: string;       // Nom de la catégorie (pour l'affichage dans le formulaire)
  image?: string;             // URL de l'image principale du club
  banner?: string;            // URL de la bannière du club
  dateCreation: string;       // Date de création du club
  imageFile?: File | null;    // Fichier image pour l'upload (non stocké dans le DTO)

  // Propriétés pour la compatibilité avec l'ancien code
  // Ces propriétés seront mappées vers les propriétés principales lors de la conversion en ClubDto
  name?: string;              // Alias pour nom (pour la compatibilité)
  category?: string;          // Alias pour categoryName (pour la compatibilité)
  coverPhoto?: string;        // Alias pour banner (pour la compatibilité)
  profilePhoto?: string;      // Alias pour image (pour la compatibilité)
}

interface Club {
  id: number;
  name: string;
  description: string;
  members: number;
  banner?: string;
  image?: string;      // Ajout du champ image pour le logo
  profilePhoto?: string; // Ajout du champ profilePhoto pour la compatibilité
  category: string;
  dateCreation?: string;  // Date de création du club
  nextEvent?: string;  // Ajout du champ nextEvent optionnel
  creatorId?: number;  // ID du créateur du club
  createdAt?: string;  // Date de création (format alternatif)
  isUserAdmin?: boolean; // Indique si l'utilisateur est admin de ce club
  membersList?: any[]; // Liste des membres du club
  events?: any[];      // Liste des événements du club
  status?: string;     // État du club (accepté, en attente, refusé)
  etat?: string;       // Alias pour status (pour la compatibilité)
}

const ClubsPage = () => {
  const { user, hasRole } = useAuth();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la gestion des clubs
  const [showMyClubs, setShowMyClubs] = useState<boolean>(false);
  const [selectedClubForManagement, setSelectedClubForManagement] = useState<Club | null>(null);

  // Vérifier si l'utilisateur est administrateur de club
  const isClubAdmin = hasRole('ROLE_ADMIN_CLUB');

  // États pour le dialogue de détails du club
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [newClub, setNewClub] = useState<NewClub>({
    nom: '',
    description: '',
    categoryName: '',
    categoryId: undefined,
    image: '',
    banner: '',
    dateCreation: '',
    imageFile: null,
    // Propriétés pour la compatibilité
    name: '',
    category: '',
    coverPhoto: '',
    profilePhoto: ''
  });

  // Chargement de la liste des clubs depuis le backend
  const fetchClubs = async () => {
    try {
      const data: ClubDto[] = await clubService.getAllClubs();
      console.log('Clubs récupérés depuis l\'API:', data);

      // Afficher les détails de chaque club pour le débogage
      data.forEach((club, index) => {
        console.log(`Club ${index + 1}:`, {
          id: club.id,
          nom: club.nom,
          description: club.description,
          createurId: club.createurId,
          etat: club.etat
        });

        // Vérifier spécifiquement le club "allooo77"
        if (club.nom === "allooo77") {
          console.log("CLUB ALLOOO77 TROUVÉ:", {
            id: club.id,
            nom: club.nom,
            etat: club.etat,
            etatType: typeof club.etat,
            createurId: club.createurId
          });
        }
      });

      // Transformation des DTOs en modèle local
      const convertedClubs: Club[] = data.map(dto => {
        // Récupérer le nom de la catégorie à partir de l'objet category ou categoryId
        let categoryName = '';
        if (dto.category && dto.category.nom) {
          categoryName = dto.category.nom;
        } else if (dto.categoryId) {
          // Trouver la catégorie correspondante dans la liste des catégories
          const category = categories.find(cat => cat.id === dto.categoryId);
          if (category) {
            categoryName = category.nom;
          }
        }

        return {
          id: dto.id || 0,
          name: dto.nom,
          description: dto.description,
          members: dto.membres || 0,
          // Inclure à la fois l'image et la bannière
          image: dto.image || dto.profilePhoto || '',
          profilePhoto: dto.image || dto.profilePhoto || '',
          banner: dto.banner || dto.coverPhoto || '',
          category: categoryName,
          // Ajouter la date de création
          dateCreation: dto.dateCreation || '',
          // Ajouter un champ nextEvent vide pour la compatibilité
          nextEvent: '',
          // Ajouter l'ID du créateur du club (utiliser l'ID de l'utilisateur connecté si createurId n'est pas défini)
          creatorId: dto.createurId || user?.id || 1,
          // isUserAdmin sera défini lors de l'ouverture des détails du club
          isUserAdmin: false,
          // Utiliser l'état réel du club avec plus de détails pour le débogage
          status: dto.etat || 'en attente',
          etat: dto.etat || 'en attente'
        };
      });

      console.log('Clubs convertis:', convertedClubs);
      setClubs(convertedClubs);
    } catch (error) {
      console.error('Erreur lors du chargement des clubs:', error);
    }
  };

  // Chargement des catégories depuis le backend
  const fetchCategories = async () => {
    try {
      console.log('Chargement des catégories depuis le backend...');
      const data = await categoryService.getAllCategories();
      console.log('Catégories récupérées:', data);

      if (Array.isArray(data) && data.length > 0) {
        // Vérifier si les données ont le bon format
        const formattedCategories = data.map(cat => {
          // S'assurer que chaque catégorie a un id et un nom
          return {
            id: cat.id || 0,
            nom: cat.nom || cat.name || ''
          };
        }).filter(cat => cat.nom); // Filtrer les catégories sans nom

        console.log('Catégories formatées:', formattedCategories);
        setCategories(formattedCategories);
      } else {
        console.warn('Aucune catégorie trouvée ou format incorrect');
        // Ajouter une catégorie par défaut si aucune n'est trouvée
        setCategories([{ id: 1, nom: 'Général' }]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      // Ajouter une catégorie par défaut en cas d'erreur
      setCategories([{ id: 1, nom: 'Général' }]);
    }
  };

  // Effet au montage : charger clubs et catégories
  useEffect(() => {
    fetchClubs();
    fetchCategories();
  }, []);

  // Création d’un nouveau club
  const handleCreateClub = async () => {
    setIsLoading(true);
    try {
      // Validation des champs obligatoires
      if (!newClub.nom || !newClub.description || !newClub.categoryName || !newClub.dateCreation) {
        console.error('Champs obligatoires manquants');
        alert('Veuillez remplir tous les champs obligatoires');
        setIsLoading(false);
        return;
      }

      // Utiliser l'ID de la catégorie déjà stocké dans newClub.categoryId
      // Si non disponible, essayer de le récupérer à partir du nom
      let categoryId = newClub.categoryId;
      if (!categoryId) {
        const selectedCategory = categories.find(cat => cat.nom === newClub.categoryName);
        if (selectedCategory) {
          categoryId = selectedCategory.id;
        } else {
          console.warn('Catégorie non trouvée:', newClub.categoryName);
        }
      }

      // Formater la date au format YYYY-MM-DD
      let formattedDate = newClub.dateCreation;
      if (formattedDate) {
        try {
          // Essayer de convertir la date en format YYYY-MM-DD
          const date = new Date(formattedDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } catch (e) {
          console.warn("Impossible de formater la date:", e);
          // Utiliser une date par défaut
          formattedDate = "2023-11-15"; // Comme dans Postman
        }
      } else {
        // Si aucune date n'est fournie, utiliser une date par défaut
        formattedDate = "2023-11-15"; // Comme dans Postman
      }

      // Convertir NewClub en CreateClubRequest (format exact attendu par le backend)
      const createClubRequest: Partial<CreateClubRequest> = {
        nom: newClub.nom,
        description: newClub.description,
        categoryId: typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId,
        dateCreation: formattedDate,
        // Utiliser l'ID de l'utilisateur connecté comme créateur du club
        createurId: user?.id || 1
      };

      console.log('Envoi des données du club à l\'API:', createClubRequest);
      const createdClub = await clubService.createClub(createClubRequest);
      console.log('Club créé avec succès:', createdClub);

      // Si nous avons une image (sous forme de fichier), l'uploader séparément
      if (createdClub && createdClub.id && newClub.imageFile) {
        try {
          console.log('Uploading club image...');
          console.log('Image file:', newClub.imageFile);

          // Vérifier que le fichier est valide
          if (newClub.imageFile instanceof File && newClub.imageFile.size > 0) {
            console.log('Valid image file, uploading...');
            console.log('File type:', newClub.imageFile.type);
            console.log('File size:', newClub.imageFile.size);

            // Uploader l'image
            const imageUrl = await clubService.uploadImage(createdClub.id, newClub.imageFile);
            console.log('Image uploaded successfully:', imageUrl);
          } else {
            console.warn('Invalid image file, skipping upload');
          }
        } catch (imageError) {
          console.error('Error uploading club image:', imageError);
          // Ne pas échouer la création du club si l'upload d'image échoue
          alert('Le club a été créé mais l\'upload de l\'image a échoué. Vous pourrez ajouter une image plus tard.');
        }
      } else {
        console.log('No image file to upload');
      }

      // Rafraîchir la liste des clubs
      await fetchClubs();

      // Fermer la boîte de dialogue et réinitialiser le formulaire
      setIsCreateDialogOpen(false);
      setNewClub({
        nom: '',
        description: '',
        categoryName: '',
        categoryId: undefined,
        image: '',
        banner: '',
        dateCreation: '',
        imageFile: null,
        // Propriétés pour la compatibilité
        name: '',
        category: '',
        coverPhoto: '',
        profilePhoto: ''
      });

      // Afficher un message de succès
      alert('Club créé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création du club:', error);
      alert('Erreur lors de la création du club. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer clubs selon recherche, catégorie active et état (accepté uniquement)
  const filteredClubs = clubs.filter((club) => {
    // Vérifier que club.name existe et est une chaîne de caractères
    const clubName = club.name || '';
    const clubCategory = club.category || '';
    const clubStatus = club.status || club.etat || '';

    // Afficher l'état de chaque club pour le débogage
    console.log(`Club ${club.name} - État:`, clubStatus);

    // N'afficher que les clubs acceptés - utiliser la valeur de l'énumération EtatClub.ACCEPTER
    const isAccepted = clubStatus === 'ACCEPTER';

    // Log détaillé pour le débogage
    console.log(`Club ${club.name} - État: "${clubStatus}" - Est accepté: ${isAccepted}`);

    // N'afficher que les clubs acceptés
    return clubName.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (!activeCategory || clubCategory === activeCategory) &&
           isAccepted;
  });

  // Liste des clubs rejoints par l'utilisateur (à adapter selon ta logique)
  const joinedClubs: number[] = [];

  // Filtrer tous les clubs créés par l'utilisateur (indépendamment de leur état)
  const userCreatedClubs = clubs.filter(club => {
    // Convertir les IDs en nombres pour une comparaison correcte
    const creatorId = Number(club.creatorId);
    const userId = Number(user?.id);
    return creatorId === userId && !isNaN(creatorId) && !isNaN(userId);
  });

  // Filtrer les clubs dont l'utilisateur est le créateur ET qui ont été acceptés par l'ADMIN
  const myClubs = userCreatedClubs.filter(club => {
    const clubStatus = club.status || club.etat || '';

    // Vérifier si le club a été accepté - utiliser la valeur de l'énumération EtatClub.ACCEPTER
    const isAccepted = clubStatus === 'ACCEPTER';

    // Log détaillé pour le débogage
    console.log(`MY_CLUB - Club ${club.name} - État: "${clubStatus}" - Est accepté: ${isAccepted}`);

    // N'afficher que les clubs acceptés
    return isAccepted;
  });

  return (
    <div className="p-6 space-y-6">

      {/* Titre et bouton de basculement */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">{showMyClubs ? "Mes Clubs" : "Clubs & Associations"}</h1>

        {/* N'afficher le bouton MY_CLUB que si l'utilisateur a le rôle ADMIN_CLUB ET a créé au moins un club */}
        {isClubAdmin && userCreatedClubs.length > 0 && (
          <Button
            variant={showMyClubs ? "default" : "outline"}
            onClick={() => setShowMyClubs(!showMyClubs)}
            className="mt-2 sm:mt-0"
          >
            {showMyClubs ? (
              <>
                <Home className="mr-2 h-4 w-4" />
                Tous les Clubs
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                MY_CLUB
              </>
            )}
          </Button>
        )}
      </div>

      {/* Afficher le panneau de gestion si un club est sélectionné pour la gestion */}
      {selectedClubForManagement ? (
        <ClubManagementPanel
          club={selectedClubForManagement}
          onClubUpdated={() => {
            fetchClubs();
            setSelectedClubForManagement(null);
          }}
          onClose={() => setSelectedClubForManagement(null)}
        />
      ) : (
        <>
          <ClubsHeader
            categories={categories.map(c => c.nom)}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Input
              placeholder="Rechercher un club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Créer un club
            </Button>
          </div>

          {/* Afficher un message si aucun club n'est trouvé dans la vue "Mes clubs" */}
          {showMyClubs && myClubs.length === 0 && (
            <div className="text-center py-8 bg-muted/20 rounded-lg mb-4">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Vous n'avez pas encore de clubs acceptés</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore créé de club accepté par l'administrateur.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Créer un club
              </Button>
            </div>
          )}

          <ClubsList
            clubs={showMyClubs ? myClubs : filteredClubs}
            joinedClubs={joinedClubs}
            onJoinClub={(clubId) => console.log('Join', clubId)}
            onClubDetailsOpen={(club) => {
              // Afficher les détails du club dans la console pour le débogage
              console.log('Details', club);

              // Vérifier si la date de création est présente
              if (!club.dateCreation && club.createdAt) {
                club.dateCreation = club.createdAt;
              }

              // Vérifier si l'utilisateur est le créateur du club
              const creatorId = Number(club.creatorId);
              const userId = Number(user?.id);
              const isCreator = creatorId === userId && !isNaN(creatorId) && !isNaN(userId);

              // Définir isUserAdmin à true uniquement si l'utilisateur est le créateur du club ET a le rôle ADMIN_CLUB
              club.isUserAdmin = isCreator && isClubAdmin;

              // Si nous sommes en mode "Mes clubs" ET que l'utilisateur est le créateur du club ET a le rôle ADMIN_CLUB,
              // ouvrir le panneau de gestion au lieu du dialogue de détails
              if (showMyClubs && isCreator && isClubAdmin) {
                // Ouvrir le panneau de gestion avec les informations du club
                setSelectedClubForManagement({
                  ...club,
                  // isUserAdmin est déjà défini correctement plus haut
                  // Ajouter des données fictives pour les membres et les événements
                  membersList: [
                    {
                      id: 1,
                      name: 'John Doe',
                      email: 'john@example.com',
                      joinDate: '2023-01-15',
                      role: 'Admin Club'
                    },
                    {
                      id: 2,
                      name: 'Jane Smith',
                      email: 'jane@example.com',
                      joinDate: '2023-02-20',
                      role: 'Membre'
                    },
                    {
                      id: 3,
                      name: 'Bob Johnson',
                      email: 'bob@example.com',
                      joinDate: '2023-03-10',
                      role: 'Membre'
                    }
                  ],
                  events: [
                    {
                      id: 1,
                      title: 'Réunion mensuelle',
                      description: 'Réunion mensuelle du club pour discuter des activités à venir.',
                      date: '2023-05-15',
                      location: 'Salle A',
                      status: 'past'
                    },
                    {
                      id: 2,
                      title: 'Atelier de formation',
                      description: 'Atelier de formation sur les nouvelles technologies.',
                      date: '2023-06-20',
                      location: 'Salle B',
                      status: 'upcoming'
                    }
                  ]
                });
              } else {
                // Sinon, ouvrir le dialogue de détails normal
                setSelectedClub(club);
                setIsDetailsDialogOpen(true);
              }
            }}
            onCreateClubClick={() => setIsCreateDialogOpen(true)}
          />

          <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />

          <CreateClubDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onCreateClub={handleCreateClub}
            onClubCreated={fetchClubs}
            isLoading={isLoading}
            newClub={newClub}
            setNewClub={setNewClub}
            categories={categories}
          />

          {/* Dialogue de détails du club */}
          <ClubDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            club={selectedClub}
            isJoined={false}
            onJoin={(clubId) => console.log('Join club from details', clubId)}
          />
        </>
      )}
    </div>
  );
};

export default ClubsPage;
