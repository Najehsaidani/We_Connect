
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoUploader from "@/components/PhotoUploader";

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClub: () => void;
  isLoading: boolean;
  newClub: {
    name: string;
    description: string;
    category: string;
    coverPhoto: string;
    profilePhoto: string;
  };
  setNewClub: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    category: string;
    coverPhoto: string;
    profilePhoto: string;
  }>>;
}

const CreateClubDialog = ({ 
  open, 
  onOpenChange, 
  onCreateClub, 
  isLoading, 
  newClub, 
  setNewClub 
}: CreateClubDialogProps) => {
  const handleProfilePhotoAdded = (photoUrl: string) => {
    setNewClub({...newClub, profilePhoto: photoUrl});
  };
  
  const handleCoverPhotoAdded = (photoUrl: string) => {
    setNewClub({...newClub, coverPhoto: photoUrl});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau club</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="club-cover-photo" className="block text-sm font-medium mb-1">
              Photo de couverture
            </label>
            <PhotoUploader 
              onPhotoAdded={handleCoverPhotoAdded} 
              onPhotoRemoved={() => setNewClub({...newClub, coverPhoto: ''})}
            />
          </div>
          
          <div>
            <label htmlFor="club-profile-photo" className="block text-sm font-medium mb-1">
              Logo du club
            </label>
            <PhotoUploader 
              onPhotoAdded={handleProfilePhotoAdded}
              onPhotoRemoved={() => setNewClub({...newClub, profilePhoto: ''})}
            />
          </div>
          
          <div>
            <label htmlFor="club-name" className="block text-sm font-medium mb-1">
              Nom du club *
            </label>
            <Input
              id="club-name"
              value={newClub.name}
              onChange={(e) => setNewClub({...newClub, name: e.target.value})}
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
              value={newClub.description}
              onChange={(e) => setNewClub({...newClub, description: e.target.value})}
              placeholder="Décrivez l'objectif et les activités de votre club"
              className="min-h-[100px]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="club-category" className="block text-sm font-medium mb-1">
              Catégorie
            </label>
            <select
              id="club-category"
              value={newClub.category}
              onChange={(e) => setNewClub({...newClub, category: e.target.value})}
              className="input-field"
            >
              <option value="Académique">Académique</option>
              <option value="Sport">Sport</option>
              <option value="Arts">Arts</option>
              <option value="Solidarité">Solidarité</option>
              <option value="Professionnel">Professionnel</option>
              <option value="Loisirs">Loisirs</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={onCreateClub}
            disabled={isLoading}
          >
            {isLoading ? 'Création en cours...' : 'Créer le club'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClubDialog;
