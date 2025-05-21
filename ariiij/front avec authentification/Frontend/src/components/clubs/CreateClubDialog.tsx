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

interface CategoryDto {
  id: number;
  nom: string; // Utiliser 'nom' au lieu de 'name' pour correspondre au backend
}

interface NewClub {
  // Propriétés principales alignées avec ClubDto
  nom: string;                // Nom du club
  description: string;        // Description du club
  categoryId?: number;        // ID de la catégorie sélectionnée
  categoryName: string;       // Nom de la catégorie (pour l'affichage dans le formulaire)
  image?: string;             // URL de l'image principale du club
  banner?: string;            // URL de la bannière du club
  dateCreation: string;       // Date de création du club
  imageFile?: File | null;    // Fichier image pour l'upload (non stocké dans le DTO)

  // Propriétés pour la compatibilité avec l'ancien code
  name?: string;              // Alias pour nom (pour la compatibilité)
  category?: string;          // Alias pour categoryName (pour la compatibilité)
  coverPhoto?: string;        // Alias pour banner (pour la compatibilité)
  profilePhoto?: string;      // Alias pour image (pour la compatibilité)
}

interface CreateClubDialogProps {
  open: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onCreateClub: () => Promise<void>; // Changé en Promise<void>
  onClubCreated: () => Promise<void>;
  isLoading: boolean;
  newClub: NewClub;
  setNewClub: React.Dispatch<React.SetStateAction<NewClub>>;
  categories: CategoryDto[];
}

const CreateClubDialog = ({
  open,
  onClose,
  onOpenChange,
  onCreateClub,
  onClubCreated,
  isLoading,
  newClub,
  setNewClub,
  categories
}: CreateClubDialogProps) => {

  // Fonction supprimée car nous utilisons directement setNewClub

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau club</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Logo du club *
            </label>
            <PhotoUploader
              onPhotoAdded={(url, file) => {
                // Mettre à jour à la fois image et profilePhoto pour la compatibilité
                // Utiliser la même image pour le logo et la bannière
                setNewClub({
                  ...newClub,
                  image: url,
                  profilePhoto: url,
                  // Utiliser la même image pour la bannière pour la compatibilité
                  banner: url,
                  coverPhoto: url,
                  // Stocker le fichier pour l'upload séparé
                  imageFile: file
                });
              }}
              onPhotoRemoved={() => {
                setNewClub({
                  ...newClub,
                  image: '',
                  profilePhoto: '',
                  banner: '',
                  coverPhoto: '',
                  imageFile: null
                });
              }}
            />
          </div>

          <div>
            <label htmlFor="club-name" className="block text-sm font-medium mb-1">
              Nom du club *
            </label>
            <Input
              id="club-name"
              value={newClub.nom || newClub.name || ''}
              onChange={(e) => {
                // Mettre à jour à la fois nom et name pour la compatibilité
                setNewClub({ ...newClub, nom: e.target.value, name: e.target.value });
              }}
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
              onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
              placeholder="Décrivez l'objectif et les activités de votre club"
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label htmlFor="club-category" className="block text-sm font-medium mb-1">
              Catégorie *
            </label>
            <select
              id="club-category"
              value={newClub.categoryName || newClub.category || ''}
              onChange={(e) => {
                // Trouver l'ID de la catégorie sélectionnée
                const selectedCategory = categories.find(cat => cat.nom === e.target.value);
                const categoryId = selectedCategory ? selectedCategory.id : undefined;

                // Mettre à jour à la fois categoryName, category et categoryId
                setNewClub({
                  ...newClub,
                  categoryName: e.target.value,
                  category: e.target.value,
                  categoryId: categoryId
                });
              }}
              className="input-field w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nom}>
                  {cat.nom}
                </option>
              ))}
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
              onChange={(e) => setNewClub({ ...newClub, dateCreation: e.target.value })}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={async () => {
              await onCreateClub();
              await onClubCreated();
            }}
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
