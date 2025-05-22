import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const ClubManagementPage: React.FC = () => {
  const navigate = useNavigate();

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
      
      <h1 className="text-2xl font-bold mb-4">Gestion du Club</h1>
      <p>Page en cours de maintenance.</p>
    </div>
  );
};

export default ClubManagementPage;
