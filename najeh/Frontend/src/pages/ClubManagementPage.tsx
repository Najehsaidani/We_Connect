import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Upload,
  Save,
  X,
  Users,
  ArrowLeft,
  MessageSquare,
  PlusCircle,
  Calendar
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clubService } from '@/services/clubService';
import { useToast } from "@/hooks/use-toast";
import { EventForm } from '@/components/clubs/EventForm';
import membreClubService from '@/services/membreClubService';

// Interface pour un membre du club
interface ClubMember {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
  role?: string;
  userId?: number;
}

// Interface pour une publication du club
interface ClubPost {
  id: number;
  title: string;
  content: string;
  date: string;
  author?: string;
  authorId?: number;
  image?: string;
}

// Interface pour un événement du club
interface ClubEvent {
  id: number;
  title: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  image?: string;
  status?: 'AVENIR' | 'EN_COURS' | 'PASSE';
}

// Interface pour les données du club
interface ClubData {
  id: number;
  name: string;
  description: string;
  category?: string;
  categoryId?: number;
  image?: string;
  profilePhoto?: string;
  dateCreation?: string;
  members?: ClubMember[];
  membersCount?: number;
  creatorId?: number;
  posts?: ClubPost[];
  events?: ClubEvent[];
}

const ClubManagementPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // États pour les données du club
  const [club, setClub] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedClub, setEditedClub] = useState<Partial<ClubData>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // États pour les publications
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState<Partial<ClubPost>>({
    title: '',
    content: '',
    date: new Date().toISOString()
  });

  // États pour les événements
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [editEventData, setEditEventData] = useState<any>(null);

  // Charger les données du club
  useEffect(() => {
    const fetchClubData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const clubId = parseInt(id, 10);
        const clubData = await clubService.getClubById(clubId);

        // Récupérer les membres du club
        let members: ClubMember[] = [];
        try {
          const membreClubList = await membreClubService.getClubMembers(clubId);
          members = membreClubList.map(membre => ({
            id: membre.id || 0,
            name: membre.firstName && membre.lastName
              ? `${membre.firstName} ${membre.lastName}`
              : membre.user?.firstName && membre.user?.lastName
                ? `${membre.user.firstName} ${membre.user.lastName}`
                : `Membre ${membre.id}`,
            email: membre.email || membre.user?.email || '',
            role: membre.role,
            avatar: membre.user?.image || '',
            joinDate: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Erreur lors de la récupération des membres:', error);
          // Créer des membres fictifs en cas d'erreur
          members = [
            {
              id: clubData.createurId || 1,
              userId: clubData.createurId || 1,
              name: 'Admin du Club',
              role: 'ADMIN_CLUB',
              joinDate: new Date().toISOString()
            }
          ];
        }

        // Récupérer les événements du club
        let clubEvents: ClubEvent[] = [];
        try {
          clubEvents = await clubService.getClubEvents(clubId);
        } catch (error) {
          console.error('Erreur lors de la récupération des événements:', error);
        }

        // Traiter les données du club
        const processedClubData = {
          id: clubData.id || 0,
          name: clubData.nom || '',
          description: clubData.description || '',
          category: typeof clubData.category === 'string' ? clubData.category : (clubData.category?.nom || ''),
          categoryId: clubData.categoryId || 0,
          image: clubData.image || '',
          dateCreation: clubData.dateCreation || '',
          membersCount: clubData.membres || 0,
          creatorId: clubData.createurId || 1
        };

        setClub({
          ...processedClubData,
          members
        });

        setEvents(clubEvents);

        setEditedClub({
          name: processedClubData.name,
          description: processedClubData.description,
          categoryId: processedClubData.categoryId
        });

      } catch (err) {
        console.error('Erreur lors du chargement du club:', err);
        setError('Impossible de charger les données du club. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubData();
  }, [id]);

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, GIF)",
        variant: "destructive"
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!club || !club.id) return;

    setIsLoading(true);
    try {
      const clubDataToUpdate = {
        nom: editedClub.name,
        description: editedClub.description,
        categoryId: editedClub.categoryId
      };

      await clubService.updateClub(club.id, clubDataToUpdate);

      if (imageFile) {
        await clubService.uploadImage(club.id, imageFile);
      }

      const updatedClub = await clubService.getClubById(club.id);

      const processedClubData = {
        id: updatedClub.id || 0,
        name: updatedClub.nom || '',
        description: updatedClub.description || '',
        category: typeof updatedClub.category === 'string' ? updatedClub.category : (updatedClub.category?.nom || ''),
        categoryId: updatedClub.categoryId || 0,
        image: updatedClub.image || '',
        dateCreation: updatedClub.dateCreation || '',
        membersCount: updatedClub.membres || 0,
        creatorId: updatedClub.createurId || 1
      };

      setClub({
        ...processedClubData,
        members: club.members
      });

      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);

      toast({
        title: "Modifications enregistrées",
        description: "Les informations du club ont été mises à jour avec succès.",
        variant: "default"
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour du club:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations du club.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);

    // Réinitialiser les données d'édition
    if (club) {
      setEditedClub({
        name: club.name,
        description: club.description,
        categoryId: club.categoryId
      });
    }
  };

  // Gérer la modification d'un événement
  const handleEditEvent = (event: ClubEvent) => {
    if (!club || !club.id) return;

    // Préparer les données pour l'édition
    const eventData = {
      id: event.id,
      titre: event.title,
      description: event.description,
      lieu: event.lieu,
      dateDebut: new Date(event.dateDebut).toISOString(),
      dateFin: new Date(event.dateFin).toISOString(),
      status: event.status || "AVENIR",
      clubId: club.id,
      createurId: club.creatorId || 1
    };

    setSelectedEvent(event);
    setEditEventData(eventData);
    setIsEditEventDialogOpen(true);
  };

  // Gérer la suppression d'un événement
  const handleDeleteEvent = (event: ClubEvent) => {
    if (!club || !club.id) return;

    setSelectedEvent(event);
    setIsDeleteEventDialogOpen(true);
  };

  // Confirmer la suppression d'un événement
  const confirmDeleteEvent = async () => {
    if (!selectedEvent?.id || !club?.id) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour supprimer l'événement.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`Tentative de suppression de l'événement ${selectedEvent.id} du club ${club.id}`);

      // Utiliser le service pour supprimer l'événement
      await clubService.deleteEvent(selectedEvent.id, club.creatorId || 1);

      // Mettre à jour la liste des événements
      setEvents(events.filter(e => e.id !== selectedEvent.id));

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
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

  // Supprimer un membre du club
  const handleDeleteMember = async (member: ClubMember) => {
    if (!club || !club.id) return;

    // Vérifier si le membre est un administrateur
    const isAdmin = member.role === 'ADMIN_CLUB' ||
                   member.role === 'Admin' ||
                   member.role === 'admin' ||
                   (club.creatorId && member.userId === club.creatorId);

    if (isAdmin) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer l'administrateur du club.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Appeler le service pour supprimer le membre
      // Note: Cette fonction doit être implémentée dans le service clubService
      await clubService.removeMember(club.id, member.id, club.creatorId || 1);

      // Mettre à jour la liste des membres
      setClub({
        ...club,
        members: club.members?.filter(m => m.id !== member.id) || []
      });

      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré du club avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du membre.",
        variant: "destructive"
      });
    }
  };

  // Afficher un message de chargement
  if (isLoading && !club) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des données du club...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
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

  // Contenu principal de la page de gestion du club
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
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="members">Membres ({club.members?.length || 0})</TabsTrigger>
            <TabsTrigger value="posts">Publications</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{isEditing ? 'Modifier le club' : club.name}</CardTitle>
                    <CardDescription>
                      Gérez les informations de votre club
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nom du club
                      </label>
                      <Input
                        id="name"
                        value={editedClub.name || ''}
                        onChange={(e) => setEditedClub({ ...editedClub, name: e.target.value })}
                        placeholder="Nom du club"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={editedClub.description || ''}
                        onChange={(e) => setEditedClub({ ...editedClub, description: e.target.value })}
                        placeholder="Description du club"
                        rows={5}
                      />
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium mb-1">
                        Image du club
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                          ) : club.image ? (
                            <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-400 text-xs text-center">Aucune image</div>
                          )}
                        </div>
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <div className="flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                            <Upload className="mr-2 h-4 w-4" />
                            <span>Choisir une image</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <div className="rounded-md overflow-hidden bg-gray-100 aspect-square">
                          {club.image ? (
                            <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Aucune image
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-2/3 space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Description</h3>
                          <p className="mt-1">{club.description || 'Aucune description'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Catégorie</h3>
                          <p className="mt-1">{club.category || 'Non catégorisé'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                          <p className="mt-1">
                            {club.dateCreation
                              ? new Date(club.dateCreation).toLocaleDateString()
                              : 'Inconnue'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Membres du club</CardTitle>
                <CardDescription>
                  Gérez les membres de votre club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Liste des membres du club</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date d'adhésion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {club.members && club.members.length > 0 ? (
                      club.members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email || 'Non renseigné'}</TableCell>
                          <TableCell>{member.role || 'Membre'}</TableCell>
                          <TableCell>
                            {member.joinDate
                              ? new Date(member.joinDate).toLocaleDateString()
                              : 'Inconnue'}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Le membre sera retiré du club.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => member && handleDeleteMember(member)}>
                                    Confirmer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Aucun membre trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Publications</CardTitle>
                    <CardDescription>
                      Gérez les publications de votre club
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsPostDialogOpen(true)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Nouvelle publication
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {posts && posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(post.date).toLocaleDateString()} par {post.author || 'Anonyme'}
                        </p>
                        <p className="mt-2">{post.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune publication</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par créer une nouvelle publication pour votre club.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsPostDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvelle publication
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Événements</CardTitle>
                    <CardDescription>
                      Gérez les événements de votre club
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsEventDialogOpen(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Nouvel événement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-6">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteEvent(event)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>
                              Du {new Date(event.dateDebut).toLocaleDateString()} au{' '}
                              {new Date(event.dateFin).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="font-medium">Lieu:</span> {event.lieu}
                          </div>
                        </div>
                        <p className="mt-2">{event.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucun événement</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Commencez par créer un nouvel événement pour votre club.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setIsEventDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvel événement
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog pour créer/modifier un événement */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouvel événement pour votre club.
            </DialogDescription>
          </DialogHeader>
          {club && (
            <EventForm
              clubId={club.id}
              onSuccess={() => {
                setIsEventDialogOpen(false);
                // Recharger les événements
                if (club.id) {
                  clubService.getClubEvents(club.id)
                    .then(updatedEvents => {
                      setEvents(updatedEvents);
                      toast({
                        title: "Événement créé",
                        description: "L'événement a été créé avec succès.",
                      });
                    })
                    .catch(error => {
                      console.error("Erreur lors du rechargement des événements:", error);
                    });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un événement */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'événement.
            </DialogDescription>
          </DialogHeader>
          {club && editEventData && (
            <EventForm
              clubId={club.id}
              initialData={editEventData}
              isEditing={true}
              onSuccess={() => {
                setIsEditEventDialogOpen(false);
                setSelectedEvent(null);
                setEditEventData(null);
                // Recharger les événements
                if (club.id) {
                  clubService.getClubEvents(club.id)
                    .then(updatedEvents => {
                      setEvents(updatedEvents);
                      toast({
                        title: "Événement mis à jour",
                        description: "L'événement a été mis à jour avec succès.",
                      });
                    })
                    .catch(error => {
                      console.error("Erreur lors du rechargement des événements:", error);
                    });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer un événement */}
      <AlertDialog open={isDeleteEventDialogOpen} onOpenChange={setIsDeleteEventDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. L'événement sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClubManagementPage;