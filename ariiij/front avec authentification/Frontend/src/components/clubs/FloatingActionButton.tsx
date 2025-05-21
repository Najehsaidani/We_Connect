
import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="floating-action-button"
      aria-label="Créer un club"
    >
      <Plus size={24} />
    </button>
  );
};

export default FloatingActionButton;
