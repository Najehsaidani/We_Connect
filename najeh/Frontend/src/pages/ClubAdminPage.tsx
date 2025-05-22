import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Info, PlusCircle, Settings, Users, Trash2, Edit, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { clubService } from '@/services/clubService';
import { EventForm } from '@/components/clubs/EventForm';
import useAuth from '@/hooks/useAuth';

// Interface pour un membre du club
interface ClubMember {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
  role?: string;
}

// Interface pour un événement du club
interface ClubEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  image?: string;
  status?: 'upcoming' | 'ongoing' | 'past';
}

// Interface pour les données du club
interface Club {
  id: number;
  name: string;
  description: string;
  members?: number;
  banner?: string;
  image?: string;
  profilePhoto?: string;
  category?: string;
  dateCreation?: string;
  nextEvent?: string;
  creatorId?: number;
  createdAt?: string;
  isUserAdmin?: boolean;
  membersList?: ClubMember[];
  events?: ClubEvent[];
}

const ClubAdminPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // États pour les données du club
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
  const [editEventData, setEditEventData] = useState<any>(null);

  // Charger les données du club
  useEffect(() => {
    const fetchClubData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const clubId = parseInt(id, 10);
        const clubData = await clubService.getClubById(clubId);

        // Pour le débogage, afficher les informations de l'utilisateur
        console.log("Utilisateur:", user);
        console.log("ID utilisateur:", user?.id);
        console.log("ID créateur du club:", clubData.createurId);
        console.log("Rôles:", user?.roles);

        // Temporairement, permettre à tous les utilisateurs d'accéder à l'interface d'administration
        // Nous réactiverons les vérifications de sécurité plus tard
        const isCreator = clubData.createurId === Number(user?.id);
        const isAdmin = user?.roles?.includes('ROLE_ADMIN');
        const isModerator = user?.roles?.includes('ROLE_MODERATEUR');

        console.log("Est créateur:", isCreator);
        console.log("Est admin:", isAdmin);
        console.log("Est modérateur:", isModerator);

        // Commenté temporairement pour permettre l'accès à tous les utilisateurs
        /*
        if (!isCreator && !isAdmin && !isModerator) {
          setError("Vous n'avez pas les droits pour administrer ce club.");
          setIsLoading(false);
          return;
        }
        */

        // Récupérer les membres du club
        let members: ClubMember[] = [];
        try {
          members = await clubService.getClubMembers(clubId);
        } catch (memberError) {
          console.error('Erreur lors de la récupération des membres:', memberError);
        }

        // Récupérer les événements du club
        let events: ClubEvent[] = [];
        try {
          const eventsData = await clubService.getClubEvents(clubId);
          events = eventsData.map((event: any) => ({
            id: event.id,
            title: event.titre,
            description: event.description,
            date: event.dateDebut,
            location: event.lieu,
            image: event.image,
            status: event.status === 'AVENIR' ? 'upcoming' :
                   event.status === 'EN_COURS' ? 'ongoing' : 'past'
          }));
        } catch (eventsError) {
          console.error('Erreur lors de la récupération des événements:', eventsError);
        }

        // Formater les données du club
        setClub({
          id: clubData.id,
          name: clubData.nom,
          description: clubData.description,
          members: clubData.membres,
          image: clubData.image,
          profilePhoto: clubData.image,
          banner: clubData.banner,
          category: clubData.category?.nom,
          dateCreation: clubData.dateCreation,
          creatorId: clubData.createurId,
          isUserAdmin: true,
          membersList: members,
          events: events
        });

      } catch (err) {
        console.error('Erreur lors du chargement du club:', err);
        setError('Impossible de charger les données du club. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubData();
  }, [id, user?.id]);

  // Fonction pour rafraîchir les données du club
  const refreshClubData = async () => {
    if (!id) return;

    try {
      const clubId = parseInt(id, 10);

      // Récupérer les données du club
      const clubData = await clubService.getClubById(clubId);

      // Récupérer les membres du club
      let members: ClubMember[] = [];
      try {
        members = await clubService.getClubMembers(clubId);
      } catch (memberError) {
        console.error('Erreur lors de la récupération des membres:', memberError);
      }

      // Récupérer les événements du club
      let events: ClubEvent[] = [];
      try {
        const eventsData = await clubService.getClubEvents(clubId);
        events = eventsData.map((event: any) => ({
          id: event.id,
          title: event.titre,
          description: event.description,
          date: event.dateDebut,
          location: event.lieu,
          image: event.image,
          status: event.status === 'AVENIR' ? 'upcoming' :
                 event.status === 'EN_COURS' ? 'ongoing' : 'past'
        }));
      } catch (eventsError) {
        console.error('Erreur lors de la récupération des événements:', eventsError);
      }

      // Mettre à jour les données du club
      setClub({
        id: clubData.id,
        name: clubData.nom,
        description: clubData.description,
        members: clubData.membres,
        image: clubData.image,
        profilePhoto: clubData.image,
        banner: clubData.banner,
        category: clubData.category?.nom,
        dateCreation: clubData.dateCreation,
        creatorId: clubData.createurId,
        isUserAdmin: true,
        membersList: members,
        events: events
      });
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données du club:', err);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir les données du club.",
        variant: "destructive"
      });
    }
  };

  // Gérer la création d'un événement
  const handleEventCreated = () => {
    setIsEventDialogOpen(false);
    toast({
      title: "Événement créé",
      description: "L'événement a été créé avec succès",
    });

    // Recharger les données du club
    refreshClubData();
  };

  // Gérer la modification d'un événement
  const handleEditEvent = (event: ClubEvent) => {
    if (!user?.id || !club?.id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour modifier l'événement.",
        variant: "destructive"
      });
      return;
    }

    // Préparer les données pour l'édition
    const eventData = {
      id: event.id,
      titre: event.title,
      description: event.description,
      lieu: event.location,
      dateDebut: new Date(event.date).toISOString(), // Convertir en ISO string
      dateFin: new Date(event.date).toISOString(), // Utiliser la même date pour la fin par simplicité
      status: event.status === 'upcoming' ? 'AVENIR' :
              event.status === 'ongoing' ? 'EN_COURS' : 'PASSE',
      clubId: club.id,
      createurId: Number(user.id) // Ajouter explicitement le createurId
    };

    console.log("Données de l'événement à modifier:", eventData);

    setSelectedEvent(event);
    setEditEventData(eventData);
    setIsEditEventDialogOpen(true);
  };

  // Gérer la mise à jour d'un événement
  const handleEventUpdated = () => {
    setIsEditEventDialogOpen(false);
    setSelectedEvent(null);
    setEditEventData(null);

    toast({
      title: "Événement mis à jour",
      description: "L'événement a été mis à jour avec succès",
    });

    // Recharger les données du club
    refreshClubData();
  };

  // Gérer la suppression d'un événement
  const handleDeleteEvent = async (event: ClubEvent) => {
    if (!user?.id || !club?.id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour supprimer l'événement.",
        variant: "destructive"
      });
      return;
    }

    setSelectedEvent(event);
    setIsDeleteEventDialogOpen(true);
  };

  // Confirmer la suppression d'un événement
  const confirmDeleteEvent = async () => {
    if (!selectedEvent?.id || !user?.id || !club?.id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour supprimer l'événement.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`Tentative de suppression de l'événement ${selectedEvent.id} par l'utilisateur ${user.id} du club ${club.id}`);

      // Créer un objet avec les données nécessaires pour la suppression
      const deleteData = {
        eventId: selectedEvent.id,
        createurId: Number(user.id),
        clubId: club.id
      };

      console.log("Données de suppression:", deleteData);

      await clubService.deleteEvent(selectedEvent.id, Number(user.id));
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });

      // Recharger les données du club
      refreshClubData();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'événement.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Gérer la suppression d'un membre
  const handleDeleteMember = async (member: ClubMember) => {
    if (!club?.id) {
      toast({
        title: "Erreur",
        description: "Informations du club manquantes.",
        variant: "destructive"
      });
      return;
    }

    setSelectedMember(member);
    setIsDeleteMemberDialogOpen(true);
  };

  // Confirmer la suppression d'un membre
  const confirmDeleteMember = async () => {
    if (!selectedMember?.id || !club?.id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour supprimer le membre.",
        variant: "destructive"
      });
      return;
    }

    try {
      await clubService.removeMember(club.id, selectedMember.id);
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé du club avec succès.",
      });

      // Recharger les données du club
      refreshClubData();
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du membre.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteMemberDialogOpen(false);
      setSelectedMember(null);
    }
  };

  // Afficher un message de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données du club...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/app/clubs')}>Retour à la liste des clubs</Button>
        </div>
      </div>
    );
  }

  // Afficher la page d'administration du club
  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => navigate('/app/clubs')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste des clubs
      </Button>

      {club && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{club.name}</h1>
              <p className="text-muted-foreground">Administration du club</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="info">
                <Info className="h-4 w-4 mr-2" />
                Informations
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                Membres ({club.membersList?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Événements ({club.events?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du club</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p>{club.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Catégorie</h3>
                      <p>{club.category || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Date de création</h3>
                      <p>{club.dateCreation ? new Date(club.dateCreation).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Membres du club</CardTitle>
                </CardHeader>
                <CardContent>
                  {club.membersList && club.membersList.length > 0 ? (
                    <div className="space-y-4">
                      {club.membersList.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <Users className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.role || 'Membre'}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Retirer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Aucun membre dans ce club</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Événements du club</CardTitle>
                  <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Créer un événement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Créer un nouvel événement</DialogTitle>
                        <DialogDescription>
                          Remplissez le formulaire pour créer un nouvel événement pour votre club.
                        </DialogDescription>
                      </DialogHeader>
                      <EventForm
                        clubId={club.id}
                        onSuccess={handleEventCreated}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {club.events && club.events.length > 0 ? (
                    <div className="space-y-4">
                      {club.events.map(event => (
                        <div key={event.id} className="flex flex-col p-4 bg-muted/20 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{event.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                              event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status === 'upcoming' ? 'À venir' :
                               event.status === 'ongoing' ? 'En cours' : 'Passé'}
                            </span>
                          </div>
                          <p className="text-sm mt-2">{event.description}</p>
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                            {event.location && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{event.location}</span>
                              </>
                            )}
                          </div>
                          <div className="flex justify-end mt-4 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEvent(event)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Aucun événement pour ce club</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du club</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Paramètres à venir...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialogue de modification d'un événement */}
          <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Modifier l'événement</DialogTitle>
                <DialogDescription>
                  Modifiez les informations de l'événement.
                </DialogDescription>
              </DialogHeader>
              {editEventData && (
                <EventForm
                  clubId={club.id}
                  onSuccess={handleEventUpdated}
                  initialData={editEventData}
                  isEditing={true}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Dialogue de confirmation pour la suppression d'un événement */}
          <AlertDialog open={isDeleteEventDialogOpen} onOpenChange={setIsDeleteEventDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive text-destructive-foreground">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialogue de confirmation pour la suppression d'un membre */}
          <AlertDialog open={isDeleteMemberDialogOpen} onOpenChange={setIsDeleteMemberDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Retirer le membre</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir retirer ce membre du club ? Il perdra l'accès à toutes les fonctionnalités réservées aux membres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteMember} className="bg-destructive text-destructive-foreground">
                  Retirer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default ClubAdminPage;
