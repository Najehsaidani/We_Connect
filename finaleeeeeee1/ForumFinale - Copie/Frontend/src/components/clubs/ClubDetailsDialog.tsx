
import React from 'react';
import { User, Check, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClubDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: any;
  isJoined: boolean;
  onJoin: (clubId: number) => void;
}

const ClubDetailsDialog = ({ open, onOpenChange, club, isJoined, onJoin }: ClubDetailsDialogProps) => {
  if (!club) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{club.name}</DialogTitle>
          <DialogDescription>
            <span className="text-xs px-2 py-1 bg-muted rounded-full">
              {club.category}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
            <img 
              src={club.banner} 
              alt={club.name}
              className="w-full h-full object-cover" 
            />
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
                <p className="text-sm text-muted-foreground">Crée le:</p>
                <p>{club.createdAt}</p>
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
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
          {!isJoined ? (
            <Button onClick={() => onJoin(club.id)}>
              <Check size={16} className="mr-1" /> Rejoindre ce club
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => onJoin(club.id)}>
              <X size={16} className="mr-1" /> Quitter ce club
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClubDetailsDialog;
