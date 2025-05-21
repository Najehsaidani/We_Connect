
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NoClubsFoundProps {
  onCreateClick: () => void;
}

const NoClubsFound = ({ onCreateClick }: NoClubsFoundProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        <Search size={48} className="mx-auto opacity-50" />
      </div>
      <h3 className="text-xl font-medium mb-2">Aucun club trouvé</h3>
      <p className="text-muted-foreground mb-6">
        Essayez une autre recherche ou créez votre propre club !
      </p>
      <Button onClick={onCreateClick}>
        <Plus size={16} className="mr-1" /> Créer un club
      </Button>
    </div>
  );
};

export default NoClubsFound;
