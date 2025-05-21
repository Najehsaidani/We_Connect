
import React, { useState } from 'react';
import { User, Check, X, Settings, Info, Users, Calendar } from 'lucide-react';
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

interface ClubDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: any;
  isJoined: boolean;
  onJoin: (clubId: number) => void;
}

const ClubDetailsDialog = ({ open, onOpenChange, club, isJoined, onJoin }: ClubDetailsDialogProps) => {
  const navigate = useNavigate();

  if (!club) return null;

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
    navigate(`/app/clubs/manage/${club.id}`);
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

        <div className="py-2">
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
                <p>{club.nextEvent}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu:</p>
                <p>{club.location}</p>
              </div>
            </div>
          </div>

          {club.membersList && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Membres ({club.membersList.length})</h3>
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
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-wrap gap-2 justify-between sm:justify-end">
          {/* Bouton de gestion (visible uniquement pour le créateur du club) */}
          {club.isUserAdmin && (
            <div className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                onClick={handleManageClub}
                className="w-full sm:w-auto"
              >
                <Settings size={16} className="mr-1" /> Gérer le club
              </Button>
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

            {!isJoined ? (
              <Button
                onClick={() => onJoin(club.id)}
                className="flex-1 sm:flex-none"
              >
                <Check size={16} className="mr-1" /> Rejoindre
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => onJoin(club.id)}
                className="flex-1 sm:flex-none"
              >
                <X size={16} className="mr-1" /> Quitter
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClubDetailsDialog;
