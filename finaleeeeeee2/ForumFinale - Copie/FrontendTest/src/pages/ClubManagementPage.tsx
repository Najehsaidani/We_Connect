import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Upload,
  Save,
  X,
  Users,
  Calendar,
  Tag,
  ArrowLeft
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
}

const ClubManagementPage = () => {
  const { clubId } = useParams<{ clubId: string }>();
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

  // État pour la confirmation de suppression d'un membre
  const [memberToDelete, setMemberToDelete] = useState<ClubMember | null>(null);

  // Charger les données du club
  useEffect(() => {
    const fetchClubData = async () => {
      if (!clubId) return;

      setIsLoading(true);
      try {
        const id = parseInt(clubId, 10);
        const clubData = await clubService.getClubById(id);

        // Récupérer la liste des membres si elle n'est pas incluse dans les données du club
        let members: ClubMember[] = [];
        try {
          // Cette fonction n'existe pas encore, il faudra l'ajouter au service
          members = await clubService.getClubMembers(id);
        } catch (memberError) {
          console.error('Erreur lors de la récupération des membres:', memberError);
          // Utiliser des données fictives pour l'exemple
          // Créer un membre administrateur (créateur du club) et des membres normaux
          const creatorId = clubData.createurId || 1;
          console.log('Club creator ID:', creatorId);

          members = [
            { id: creatorId, name: 'Admin du Club', email: 'admin@example.com', joinDate: clubData.dateCreation || '2023-01-01', role: 'Créateur' },
            { id: creatorId + 1, name: 'John Doe', email: 'john@example.com', joinDate: '2023-01-15', role: 'Membre' },
            { id: creatorId + 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2023-02-20', role: 'Membre' },
            { id: creatorId + 3, name: 'Alice Johnson', email: 'alice@example.com', joinDate: '2023-03-10', role: 'Membre' }
          ];
        }

        // S'assurer que toutes les propriétés sont des chaînes de caractères ou des nombres
        const processedClubData = {
          id: clubData.id || 0,
          name: clubData.name || clubData.nom || '',
          description: clubData.description || '',
          category: typeof clubData.category === 'string' ? clubData.category :
                   (clubData.category?.nom || ''),
          categoryId: clubData.categoryId || 0,
          image: clubData.image || clubData.profilePhoto || '',
          dateCreation: clubData.dateCreation || '',
          membersCount: clubData.membres || 0,
          creatorId: clubData.createurId || 1
        };

        console.log('Processed club data:', processedClubData);

        setClub({
          ...processedClubData,
          members
        });

        // Initialiser les données d'édition
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
  }, [clubId]);

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille du fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, GIF)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive"
      });
      return;
    }

    // Créer une URL pour la prévisualisation
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!club || !club.id) return;

    setIsLoading(true);
    try {
      // Préparer les données à envoyer au backend
      const clubDataToUpdate = {
        nom: editedClub.name,
        description: editedClub.description,
        categoryId: editedClub.categoryId
      };

      console.log('Données à mettre à jour:', clubDataToUpdate);

      // Mettre à jour les informations du club
      await clubService.updateClub(club.id, clubDataToUpdate);

      // Si une nouvelle image a été sélectionnée, l'uploader
      if (imageFile) {
        await clubService.uploadImage(club.id, imageFile);
      }

      // Recharger les données du club
      const updatedClub = await clubService.getClubById(club.id);

      // S'assurer que toutes les propriétés sont des chaînes de caractères ou des nombres
      const processedClubData = {
        id: updatedClub.id || 0,
        name: updatedClub.name || updatedClub.nom || '',
        description: updatedClub.description || '',
        category: typeof updatedClub.category === 'string' ? updatedClub.category :
                 (updatedClub.category?.nom || ''),
        categoryId: updatedClub.categoryId || 0,
        image: updatedClub.image || updatedClub.profilePhoto || '',
        dateCreation: updatedClub.dateCreation || '',
        membersCount: updatedClub.membres || 0,
        creatorId: updatedClub.createurId || 1
      };

      setClub({
        ...processedClubData,
        members: club.members
      });

      // Réinitialiser l'état d'édition
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
        description: "Impossible de mettre à jour les informations du club. Veuillez réessayer.",
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

  // Supprimer un membre
  const handleDeleteMember = async (member: ClubMember) => {
    if (!club || !club.id) return;

    // Vérifier si le membre est un administrateur
    // Pour les données fictives, on considère que le premier membre est toujours l'administrateur
    // et pour les données réelles, on compare l'ID du membre avec l'ID du créateur

    // Forcer l'administrateur pour le premier membre (Admin du Club)
    const isFirstMember = member.name === 'Admin du Club';

    // Convertir les IDs en nombres pour s'assurer que la comparaison fonctionne correctement
    const memberId = typeof member.id === 'string' ? parseInt(member.id, 10) : member.id;
    const creatorId = typeof club.creatorId === 'string' ? parseInt(club.creatorId, 10) : club.creatorId;

    const isCreator = memberId === creatorId;
    const isAdminRole = member.role === 'Admin' || member.role === 'Créateur' ||
                       member.role === 'admin' || member.role === 'créateur' ||
                       member.role?.toLowerCase().includes('admin') ||
                       member.role?.toLowerCase().includes('créateur');

    // Un membre est admin s'il est le créateur, s'il a un rôle d'admin, ou si c'est le premier membre
    const isAdmin = isAdminRole || isCreator || isFirstMember;

    if (isAdmin) {
      toast({
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer l'Admin Club.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Cette fonction n'existe pas encore, il faudra l'ajouter au service
      await clubService.removeMember(club.id, member.id, club.creatorId || 1);

      // Mettre à jour la liste des membres
      setClub({
        ...club,
        members: club.members?.filter(m => m.id !== member.id) || []
      });

      toast({
        title: "Membre supprimé",
        description: `${member.name} a été retiré du club.`,
        variant: "default"
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du membre:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce membre. Veuillez réessayer.",
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

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate('/clubs')}>Retour à la liste des clubs</Button>
        </div>
      </div>
    );
  }

  // Afficher la page de gestion du club
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
                <div className="space-y-6">
                  {/* Logo du club */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4">
                      <img
                        src={imagePreview || club.image || '/placeholder.svg'}
                        alt={`Logo de ${club.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {isEditing && (
                      <div>
                        <label htmlFor="club-logo" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Upload size={16} />
                            <span>Changer le logo</span>
                          </div>
                          <input
                            id="club-logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="club-name" className="block text-sm font-medium mb-1">
                          Nom du club *
                        </label>
                        <Input
                          id="club-name"
                          value={editedClub.name || ''}
                          onChange={(e) => setEditedClub({...editedClub, name: e.target.value})}
                          placeholder="Nom de votre club"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="club-description" className="block text-sm font-medium mb-1">
                          Description *
                        </label>
                        <Textarea
                          id="club-description"
                          value={editedClub.description || ''}
                          onChange={(e) => setEditedClub({...editedClub, description: e.target.value})}
                          placeholder="Décrivez l'objectif et les activités de votre club"
                          className="min-h-[150px]"
                          required
                        />
                      </div>
                    </div>
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
                          <p>{typeof club.category === 'string' ? club.category : 'Non spécifiée'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Créé le:</p>
                          <p>{club.dateCreation ? new Date(club.dateCreation).toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Nombre de membres:</p>
                          <p>{club.members?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              {isEditing && (
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
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
                {club.members && club.members.length > 0 ? (
                  <Table>
                    <TableCaption>Liste des membres du club</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Membre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {club.members.map((member) => {
                        // Déterminer si le membre est l'administrateur du club (créateur)
                        // Pour les données fictives, on considère que le premier membre est toujours l'administrateur
                        // et pour les données réelles, on compare l'ID du membre avec l'ID du créateur

                        // Forcer l'administrateur pour le premier membre (Admin du Club)
                        const isFirstMember = member.name === 'Admin du Club';

                        // Convertir les IDs en nombres pour s'assurer que la comparaison fonctionne correctement
                        const memberId = typeof member.id === 'string' ? parseInt(member.id, 10) : member.id;
                        const creatorId = typeof club.creatorId === 'string' ? parseInt(club.creatorId, 10) : club.creatorId;

                        const isCreator = memberId === creatorId;
                        const isAdminRole = member.role === 'Admin' || member.role === 'Créateur' ||
                                           member.role === 'admin' || member.role === 'créateur' ||
                                           member.role?.toLowerCase().includes('admin') ||
                                           member.role?.toLowerCase().includes('créateur');

                        // Un membre est admin s'il est le créateur, s'il a un rôle d'admin, ou si c'est le premier membre
                        const isAdmin = isAdminRole || isCreator || isFirstMember;

                        // Log pour déboguer
                        console.log(`Member ${member.name} (ID: ${memberId}):`, {
                          role: member.role,
                          isCreator,
                          creatorId,
                          isAdminRole,
                          isFirstMember,
                          isAdmin
                        });

                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                  {member.avatar ? (
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Users size={16} />
                                  )}
                                </div>
                                <div>
                                  <span>{member.name}</span>
                                  {isAdmin && (
                                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                                      Admin Club
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{member.email || '-'}</TableCell>
                            <TableCell>{member.joinDate ? new Date(member.joinDate).toLocaleDateString('fr-FR') : '-'}</TableCell>
                            <TableCell>{isAdmin ? 'Admin Club' : (member.role || 'Membre')}</TableCell>
                            <TableCell className="text-right">
                              {/* Afficher un badge "Admin Club" pour l'admin et un bouton de suppression pour les autres */}
                              {isAdmin ? (
                                <div className="flex items-center justify-end">
                                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                    Admin Club
                                  </span>
                                </div>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir retirer {member.name} du club ? Cette action ne peut pas être annulée.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteMember(member)}>
                                        Confirmer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun membre dans ce club</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ClubManagementPage;
