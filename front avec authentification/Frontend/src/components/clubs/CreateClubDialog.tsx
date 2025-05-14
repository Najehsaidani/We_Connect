import React from 'react';
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

interface NewClub {
  name: string;
  description: string;
  category: string;
  coverPhoto: string;
  profilePhoto: string;
  dateCreation: string;
}

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateClub: () => void;
  isLoading: boolean;
  newClub: NewClub;
  setNewClub: React.Dispatch<React.SetStateAction<NewClub>>;
}

const CreateClubDialog = ({
  open,
  onOpenChange,
  onCreateClub,
  isLoading,
  newClub,
  setNewClub
}: CreateClubDialogProps) => {
  const handlePhotoChange = (key: keyof NewClub, value: string) => {
    setNewClub({ ...newClub, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau club</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Photo de couverture
            </label>
            <PhotoUploader
              onPhotoAdded={(url) => handlePhotoChange('coverPhoto', url)}
              onPhotoRemoved={() => handlePhotoChange('coverPhoto', '')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Logo du club
            </label>
            <PhotoUploader
              onPhotoAdded={(url) => handlePhotoChange('profilePhoto', url)}
              onPhotoRemoved={() => handlePhotoChange('profilePhoto', '')}
            />
          </div>

          <div>
            <label htmlFor="club-name" className="block text-sm font-medium mb-1">
              Nom du club *
            </label>
            <Input
              id="club-name"
              value={newClub.name}
              onChange={(e) => handlePhotoChange('name', e.target.value)}
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
              onChange={(e) => handlePhotoChange('description', e.target.value)}
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
              onChange={(e) => handlePhotoChange('category', e.target.value)}
              className="input-field w-full px-3 py-2 border rounded-md"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Académique">Académique</option>
              <option value="Sport">Sport</option>
              <option value="Arts">Arts</option>
              <option value="Solidarité">Solidarité</option>
              <option value="Professionnel">Professionnel</option>
              <option value="Loisirs">Loisirs</option>
            </select>
          </div>

          <div>
            <label htmlFor="club-dateCreation" className="block text-sm font-medium mb-1">
              Date de création *
            </label>
            <Input
              id="club-dateCreation"
              type="date"
              value={newClub.dateCreation}
              onChange={(e) => handlePhotoChange('dateCreation', e.target.value)}
              required
            />
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
