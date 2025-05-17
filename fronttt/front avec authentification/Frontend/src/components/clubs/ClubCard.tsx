import React from 'react';
import { Users, Info, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClubCardProps {
  club: {
    id: number;
    name: string;
    description: string;
    members: number;
    banner: string;
    category: string;
  };
  index: number;
  isJoined: boolean;
  onJoin: (clubId: number) => void;
  onOpenDetails: (club: any) => void;
}

const ClubCard = ({ club, index, isJoined, onJoin, onOpenDetails }: ClubCardProps) => {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-border animate-fade-in card-hover"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="h-32 bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${club.banner})` }}
      >
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-t from-black/30 to-transparent p-4">
          <h3 className="text-xl font-semibold text-white">{club.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center text-sm text-muted-foreground">
            <Users size={16} className="mr-1" /> {club.members} membre{club.members > 1 ? 's' : ''}
          </span>
          <span className="text-xs px-2 py-1 bg-muted rounded-full">
            {club.category}
          </span>
        </div>

        <p className="text-sm text-foreground mb-4 line-clamp-3">{club.description}</p>

        <div className="flex space-x-2">
          <Button
            variant={isJoined ? "destructive" : "default"}
            size="sm"
            className="flex-grow"
            onClick={() => onJoin(club.id)}
          >
            {isJoined ? (
              <>
                <X size={16} className="mr-1" /> Quitter
              </>
            ) : (
              <>
                <Check size={16} className="mr-1" /> Rejoindre
              </>
            )}
          </Button>
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
