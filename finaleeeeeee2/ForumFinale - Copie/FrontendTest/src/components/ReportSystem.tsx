import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReportSystemProps {
  postId: number;
}

const ReportSystem = ({ postId }: ReportSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour signaler un post",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:8082/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason,
          userId: currentUserId,
          postId: postId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du signalement');
      }

      setIsOpen(false);
      setReason('');
      
      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été envoyé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors du signalement',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Flag size={18} />
          <span>Signaler</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler cette publication</DialogTitle>
          <DialogDescription>
            Veuillez expliquer la raison de votre signalement. Notre équipe examinera votre signalement dans les plus brefs délais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitReport}>
          <Textarea
            placeholder="Décrivez la raison du signalement..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportSystem;