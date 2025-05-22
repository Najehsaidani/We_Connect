
import React, { useState } from 'react';
import { Users, Calendar, Info, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
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

interface ClubCardProps {
  club: {
    id: number;
    name: string;
    description: string;
    members: number;
    banner?: string;
    image?: string;      // Ajout du champ image pour le logo
    profilePhoto?: string; // Ajout du champ profilePhoto pour la compatibilité
    category: string;
    nextEvent?: string;
    creatorId?: number;  // ID du créateur du club
    isUserAdmin?: boolean; // Indique si l'utilisateur est admin de ce club
  };
  index: number;
  isJoined: boolean;
  onJoin: (clubId: number) => void;
  onOpenDetails: (club: any) => void;
  currentUserId?: number; // ID de l'utilisateur connecté
}

const ClubCard = ({ club, index, isJoined, onJoin, onOpenDetails, currentUserId }: ClubCardProps) => {
  // Vérifier si l'utilisateur est le créateur du club
  const isCreator = club.creatorId === currentUserId;
  // État pour contrôler l'ouverture de la boîte de dialogue de confirmation
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Fonction pour gérer l'action de quitter le club après confirmation
  const handleLeaveClub = () => {
    onJoin(club.id);
    setIsLeaveDialogOpen(false);
  };

  // Ajouter des logs pour déboguer
  console.log(`ClubCard - Club ${club.id} (${club.name}) - isJoined: ${isJoined}, isCreator: ${isCreator}, isUserAdmin: ${club.isUserAdmin}`);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-border animate-fade-in card-hover"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="h-32 bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-4 text-center">
          {/* Afficher le logo du club s'il existe */}
          {(club.image || club.profilePhoto) && (
            <div className="w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-primary">
              <img
                src={club.image || club.profilePhoto || '/placeholder.svg'}
                alt={`Logo de ${club.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h3 className="text-xl font-semibold">{club.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center text-sm text-muted-foreground">
            <Users size={16} className="mr-1" /> {club.members} membres
          </span>
          <span className="text-xs px-2 py-1 bg-muted rounded-full">
            {club.category}
          </span>
        </div>

        <p className="text-sm text-foreground mb-4 line-clamp-3">{club.description}</p>

        {/* Afficher l'événement à venir s'il existe */}
        {club.nextEvent && (
          <div className="flex items-center text-xs text-muted-foreground mb-4">
            <Calendar size={14} className="mr-1" />
            <span>{club.nextEvent}</span>
          </div>
        )}

        <div className="flex space-x-2">
          {/* Si l'utilisateur est le créateur/admin du club, afficher un bouton différent */}
          {club.isUserAdmin || isCreator ? (
            <Button
              variant="destructive"
              size="sm"
              className="flex-grow"
              disabled={true}
              title="En tant qu'admin du club, vous ne pouvez pas quitter le club"
            >
              <X size={16} className="mr-1" /> Admin du club
            </Button>
          ) : (
            <>
              {isJoined ? (
                <div className="flex gap-2 flex-grow">
                  <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-grow"
                      >
                        <X size={16} className="mr-1" /> Quitter le club
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
                        <AlertDialogAction onClick={handleLeaveClub}>Quitter</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-grow"
                  onClick={() => onJoin(club.id)}
                >
                  <Check size={16} className="mr-1" /> Rejoindre
                </Button>
              )}
            </>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onOpenDetails(club)}>
                  <Info size={16} /> <span className="ml-1">Plus d'infos</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Voir les détails du club
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
