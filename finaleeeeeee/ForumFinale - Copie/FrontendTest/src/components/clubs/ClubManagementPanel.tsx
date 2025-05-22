import React, { useState, useEffect } from 'react';
import membreClubService, { MembreClub, RoleMembre } from '@/services/membreClubService';
import { eventsClubsService, EventClub } from '@/services/EventClubServices';
import {
  Users,
  Calendar,
  Info,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  X,
  Upload,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clubService } from '@/services/clubService';
import { useToast } from "@/hooks/use-toast";

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

interface ClubManagementPanelProps {
  club: Club;
  onClubUpdated: () => void;
  onClose: () => void;
}

const ClubManagementPanel: React.FC<ClubManagementPanelProps> = ({
  club,
  onClubUpdated,
  onClose
}) => {
  // États pour l'édition
  const [activeTab, setActiveTab] = useState<string>("info");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(club.name);
  const [editedDescription, setEditedDescription] = useState(club.description);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // États pour stocker les membres et les événements réels
  const [realMembers, setRealMembers] = useState<MembreClub[]>([]);
  const [realEvents, setRealEvents] = useState<EventClub[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { toast } = useToast();

  // Fonction pour récupérer les membres du club
  const fetchClubMembers = async () => {
    if (!club || !club.id) return;

    setLoadingMembers(true);
    try {
      const members = await membreClubService.getClubMembers(club.id);
      console.log('Membres récupérés:', members);
      setRealMembers(members);

      // Afficher un message si aucun membre n'est trouvé
      if (members.length === 0) {
        toast({
          title: "Aucun membre trouvé",
          description: "Ce club n'a pas encore de membres.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les membres du club.",
        variant: "destructive"
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fonction pour récupérer les événements du club
  const fetchClubEvents = async () => {
    if (!club || !club.id) return;

    setLoadingEvents(true);
    try {
      // Récupérer tous les événements et filtrer ceux du club
      const allEvents = await eventsClubsService.getAllEventsClubs();
      const clubEvents = allEvents.filter(event => event.clubId === club.id);
      console.log('Événements récupérés:', clubEvents);
      setRealEvents(clubEvents);

      // Afficher un message si aucun événement n'est trouvé
      if (clubEvents.length === 0) {
        toast({
          title: "Aucun événement trouvé",
          description: "Ce club n'a pas encore d'événements.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les événements du club.",
        variant: "destructive"
      });
    } finally {
      setLoadingEvents(false);
    }
  };

  // Charger les données au montage du composant et lors du changement d'onglet
  useEffect(() => {
    if (activeTab === 'members') {
      fetchClubMembers();
    } else if (activeTab === 'events') {
      fetchClubEvents();
    }
  }, [activeTab, club.id]);

  // Gérer le changement de fichier image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Créer une URL pour la prévisualisation
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Gérer l'upload de l'image
  const handleImageUpload = async () => {
    if (!club || !selectedFile) return;

    setIsLoading(true);
    try {
      await clubService.uploadImage(club.id, selectedFile);

      // Notifier que le club a été mis à jour
      onClubUpdated();

      // Réinitialiser l'état
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Erreur lors de l\'upload de l\'image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la sauvegarde des modifications
  const handleSaveChanges = async () => {
    if (!club) return;

    setIsLoading(true);
    try {
      await clubService.updateClub(club.id, {
        nom: editedName,
        description: editedDescription
      });

      // Notifier que le club a été mis à jour
      onClubUpdated();

      // Désactiver le mode édition
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des modifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la suppression d'un membre
  const handleDeleteMember = async (memberId: number) => {
    if (!club || !club.creatorId) return;

    setIsLoading(true);
    try {
      // Utiliser l'ID du créateur du club comme adminId
      await clubService.removeMember(club.id, memberId, club.creatorId);

      // Rafraîchir la liste des membres
      fetchClubMembers();

      // Notifier que le club a été mis à jour
      onClubUpdated();

      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé du club avec succès.",
        variant: "default"
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du membre:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre du club.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <div className="w-full">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-xl font-bold mb-2"
                placeholder="Nom du club"
              />
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img
                  src={club.image || club.profilePhoto || 'https://via.placeholder.com/150'}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <CardTitle>{club.name}</CardTitle>
                <CardDescription>
                  {club.category} • Créé le {new Date(club.dateCreation || '').toLocaleDateString('fr-FR')}
                </CardDescription>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(club.name);
                    setEditedDescription(club.description);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Fermer
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardContent className="pt-0 pb-2">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              <Info className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Membres ({club.membersList?.length || club.members || 0})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Événements ({club.events?.length || 0})
            </TabsTrigger>
          </TabsList>
        </CardContent>

        <TabsContent value="info" className="m-0">
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="min-h-[150px]"
                placeholder="Description du club"
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">À propos</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{club.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie:</p>
                    <p>{club.category || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Créé le:</p>
                    <p>{club.dateCreation ? new Date(club.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre de membres:</p>
                    <p>{club.membersList?.length || club.members || 0}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Image du club</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Prévisualisation"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={club.image || club.profilePhoto || 'https://via.placeholder.com/150'}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mb-2"
                      />
                      {selectedFile && (
                        <Button onClick={handleImageUpload} disabled={isLoading}>
                          <Upload className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="members" className="m-0">
          <CardContent>
            {loadingMembers ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chargement des membres...</p>
              </div>
            ) : realMembers.length > 0 ? (
              <div className="space-y-4">
                {realMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden mr-3">
                        {member.user?.image ? (
                          <img
                            src={member.user.image}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role === RoleMembre.ADMIN_CLUB ? 'Admin Club' : 'Membre'} • {member.email || 'Email non disponible'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {member.role === RoleMembre.ADMIN_CLUB ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary mr-2">
                          Admin Club
                        </Badge>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le membre</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer {member.firstName} {member.lastName} du club ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMember(member.id || 0)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun membre dans ce club</p>
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="events" className="m-0">
          <CardContent>
            {loadingEvents ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chargement des événements...</p>
              </div>
            ) : realEvents.length > 0 ? (
              <div className="space-y-4">
                {realEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {event.image && (
                        <div className="w-full sm:w-32 h-24 bg-muted">
                          <img
                            src={event.image}
                            alt={event.titre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{event.titre}</h3>
                            <p className="text-sm text-muted-foreground">
                              Du {new Date(event.dateDebut).toLocaleDateString('fr-FR')} au {new Date(event.dateFin).toLocaleDateString('fr-FR')}
                            </p>
                            {event.lieu && (
                              <p className="text-sm">{event.lieu}</p>
                            )}
                          </div>
                          <Badge className={
                            event.status === 'AVENIR' ? "bg-emerald-100 text-emerald-800" :
                            event.status === 'EN_COURS' ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {event.status === 'AVENIR' ? 'À venir' :
                             event.status === 'EN_COURS' ? 'En cours' : 'Passé'}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm mt-2 line-clamp-2">{event.description}</p>
                        )}
                        {event.nbParticipants !== undefined && (
                          <p className="text-xs mt-2 text-muted-foreground">
                            {event.nbParticipants} participant{event.nbParticipants !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun événement pour ce club</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => {
                toast({
                  title: "Fonctionnalité à venir",
                  description: "La création d'événements sera disponible prochainement.",
                  variant: "default"
                });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ClubManagementPanel;
