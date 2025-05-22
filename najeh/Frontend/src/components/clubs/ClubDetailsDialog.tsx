
import React, { useState, useEffect } from 'react';
import { User, Check, X, Settings, Info, Users, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/components/ui/use-toast";
import { clubService } from '@/services/clubService';
import { ClubEvents } from './ClubEvents';
import useAuth from '@/hooks/useAuth';

interface ClubDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: any;
  isJoined: boolean;
  onJoin: (clubId: number) => void;
  currentUserId?: number; // ID de l'utilisateur connecté
  onClubDeleted?: () => void; // Callback appelé après la suppression du club
}

const ClubDetailsDialog = ({
  open,
  onOpenChange,
  club,
  isJoined,
  onJoin,
  currentUserId,
  onClubDeleted
}: ClubDetailsDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  if (!club) return null;

  // Vérifier si l'utilisateur est admin du club
  const isAdmin = club.isUserAdmin || (user?.id && club.createurId === Number(user.id));

  // Fonction pour formater la date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date inconnue';

    try {
      // Essayer de convertir la date en format français
      const date = new Date(dateString);

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }

      // Formater la date en français
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Erreur de date';
    }
  };

  // Fonction pour naviguer vers la page de gestion du club
  const handleManageClub = () => {
    onOpenChange(false); // Fermer le dialogue
    navigate(`/app/club-admin-events/${club.id}`);
  };

  // Fonction pour supprimer le club
  const handleDeleteClub = async () => {
    if (!club || !currentUserId) return;

    try {
      await clubService.deleteClub(club.id, currentUserId);

      // Fermer les dialogues
      setIsDeleteDialogOpen(false);
      onOpenChange(false);

      // Afficher un message de succès
      toast({
        title: "Club supprimé",
        description: "Le club a été supprimé avec succès",
      });

      // Appeler le callback si fourni
      if (onClubDeleted) {
        onClubDeleted();
      }

      // Rediriger vers la page des clubs
      navigate('/app/clubs');
    } catch (error) {
      console.error("Erreur lors de la suppression du club:", error);

      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du club",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">{club.name}</DialogTitle>
          {club.category && (
            <DialogDescription>
              <span className="text-xs px-2 py-1 bg-muted rounded-full">
                {club.category}
              </span>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Logo du club en plus grand (remplace la bannière) */}
        <div className="flex justify-center mb-6">
          {(club.image || club.profilePhoto) ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
              <img
                src={club.image || club.profilePhoto}
                alt={`Logo de ${club.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
              <User size={48} className="text-muted-foreground" />
            </div>
          )}
        </div>

        <Tabs defaultValue="about" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="about">
              <Info className="h-4 w-4 mr-2" />
              À propos
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Événements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="py-2">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">À propos</h3>
              <p className="text-muted-foreground">
                {club.description}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Informations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Créé le:</p>
                  <p>{formatDate(club.dateCreation)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre de membres:</p>
                  <p>{club.members}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prochain événement:</p>
                  <p>{club.nextEvent || "Aucun événement prévu"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lieu:</p>
                  <p>{club.location || "Non spécifié"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="py-2">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Membres ({club.membersList ? club.membersList.length : club.members || 0})
              </h3>

              {club.membersList && club.membersList.length > 0 ? (
                <div className="space-y-2">
                  {club.membersList.map((member: any) => (
                    <div key={member.id} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-10 h-10 bg-primary/20 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun membre à afficher.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="py-2">
            <ClubEvents clubId={club.id} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-end">
          {/* Boutons de gestion (visibles uniquement pour le créateur du club) */}
          {club.isUserAdmin && (
            <div className="flex gap-2 flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={handleManageClub}
                className="w-full sm:w-auto"
              >
                <Settings size={16} className="mr-1" /> Gérer le club
              </Button>

              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                  >
                    <Trash2 size={16} className="mr-1" /> Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce club ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Tous les membres et les données associées à ce club seront supprimés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteClub}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Fermer
            </Button>

            {/* Ne pas afficher le bouton Rejoindre/Quitter si l'utilisateur est le créateur du club */}
            {!club.isUserAdmin && (
              !isJoined ? (
                <Button
                  onClick={() => onJoin(club.id)}
                  className="flex-1 sm:flex-none"
                >
                  <Check size={16} className="mr-1" /> Rejoindre
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                    >
                      <X size={16} className="mr-1" /> Quitter
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Quitter le club</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir quitter le club "{club.name}" ?
                        Vous perdrez votre statut de membre et devrez rejoindre à nouveau pour participer aux activités.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onJoin(club.id)}>Quitter</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClubDetailsDialog;
