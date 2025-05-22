
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, MoreHorizontal, ThumbsUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: number;
  content: string;
  userId: number;
  username: string;
  userAvatar: string;
  postId: number;
  createdAt: string;
  likes: number;
  hasUserLiked: boolean;
}

interface CommentSystemProps {
  postId: number;
  initialComments?: Comment[];
  onCommentChange?: () => void; // Callback for when comments are added or deleted
}

const CommentSystem = ({ postId, initialComments = [], onCommentChange }: CommentSystemProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const loadComments = async () => {
    // Skip if postId is invalid (post might have been deleted)
    if (!postId) {
      console.log('Invalid postId, skipping comment load');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8082/api/comments/post/${postId}`);

      if (!response.ok) {
        // If post not found (404) or server error (500), the post might have been deleted
        if (response.status === 404 || response.status === 500) {
          console.log('Post not found or server error, post may have been deleted');
          setComments([]);
          setIsLoading(false);
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du chargement des commentaires');
      }

      const commentsData = await response.json();
      setComments(commentsData);

      // Call the onCommentChange callback to update the post data
      if (onCommentChange) {
        onCommentChange();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      // Only show toast for errors that aren't related to post deletion
      if (error instanceof Error && !error.message.includes('not found')) {
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : 'Erreur lors du chargement des commentaires',
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the comment count when the component mounts
  useEffect(() => {
    // Call onCommentChange to update the post data with the latest comment count
    // Skip if postId is invalid (post might have been deleted)
    if (onCommentChange && postId) {
      onCommentChange();
    }
  }, [onCommentChange, postId]);

  useEffect(() => {
    // Only load comments if showComments is true and postId is valid
    if (showComments && postId) {
      loadComments();
    }
    // We're not adding loadComments to the dependency array to avoid infinite loops
  }, [showComments, postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    if (retryCount >= MAX_RETRIES) {
      toast({
        title: "Erreur",
        description: "Nombre maximum de tentatives atteint. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
      setRetryCount(0);
      setIsSubmitting(false);
      return;
    }

    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour commenter",
          variant: "destructive"
        });
        return;
      }

      if (!currentUserId || isNaN(parseInt(currentUserId))) {
        throw new Error('ID utilisateur invalide');
      }

      const content = newComment.trim();
      if (!content || content.length < 3) {
        toast({
          title: "Erreur de validation",
          description: "Le commentaire doit contenir au moins 3 caractères",
          variant: "destructive"
        });
        return;
      }

      const payload = {
        content: content,
        userId: parseInt(currentUserId),
        postId: postId
      };

      console.log('Sending comment payload:', payload);

      let response;
      try {
        console.log('Sending comment payload:', payload);
        response = await fetch(`http://localhost:8082/api/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          if (response.status === 500) {
            throw new Error('Erreur serveur: Le service est temporairement indisponible');
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const responseData = await response.json().catch(() => ({}));
        console.log('Response data:', responseData);

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error(responseData.message || 'Données de commentaire invalides');
          } else if (response.status === 500) {
            throw new Error('Erreur serveur: Le service est temporairement indisponible');
          }
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        if (!responseData || !responseData.id) {
          throw new Error('Réponse invalide du serveur');
        }

        return responseData;
      } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        throw error;
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!responseData || !responseData.id) {
        throw new Error('Réponse invalide du serveur');
      }

      setComments([responseData, ...comments]);
      setNewComment('');
      setShowComments(true);
      setRetryCount(0);

      // Call the onCommentChange callback to update the post data
      if (onCommentChange) {
        onCommentChange();
      }

      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
    } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du commentaire';
        console.error('Détails de l\'erreur:', error);

        if (errorMessage.includes('temporairement indisponible') || response?.status === 500) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);

          if (nextRetryCount < MAX_RETRIES) {
            toast({
              title: "Erreur serveur",
              description: `Tentative ${nextRetryCount}/${MAX_RETRIES} échouée. Nouvelle tentative dans 3 secondes...`,
              variant: "destructive"
            });

            setTimeout(() => {
              handleSubmitComment(e);
            }, 3000);
            return;
          }
        }

        setRetryCount(0);
        toast({
          title: "Erreur",
          description: retryCount >= MAX_RETRIES
            ? "Nombre maximum de tentatives atteint. Veuillez réessayer plus tard."
            : errorMessage,
          variant: "destructive"
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour aimer un commentaire",
          variant: "destructive"
        });
        return;
      }

      // Fixed URL format - removed trailing slash and fixed query parameter format
      const response = await fetch(`http://localhost:8082/api/comments/${commentId}/like?userId=${currentUserId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Commentaire non trouvé');
        } else if (response.status === 500) {
          throw new Error('Erreur serveur lors du traitement de la demande');
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour du like');
        } catch (e) {
          throw new Error('Erreur lors de la mise à jour du like');
        }
      }

      const updatedComment = await response.json();
      setComments(comments.map(comment =>
        comment.id === commentId ? updatedComment : comment
      ));
    } catch (error) {
      console.error('Erreur lors du like du commentaire:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors du like du commentaire',
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      // Fixed URL format - removed trailing slash
      const response = await fetch(`http://localhost:8082/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Commentaire non trouvé');
        } else if (response.status === 500) {
          throw new Error('Erreur serveur lors du traitement de la demande');
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la suppression du commentaire');
        } catch (e) {
          throw new Error('Erreur lors de la suppression du commentaire');
        }
      }

      setComments(comments.filter(comment => comment.id !== commentId));

      // Call the onCommentChange callback to update the post data
      if (onCommentChange) {
        onCommentChange();
      }

      toast({
        title: "Commentaire supprimé",
        description: "Votre commentaire a été supprimé.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la suppression du commentaire',
        variant: "destructive"
      });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    // The useEffect will handle loading comments when showComments changes
  };

  return (
    <div id={`comment-system-${postId}`} className="mt-2">
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <MessageSquare size={18} />
          <span>{showComments ? 'Masquer les commentaires' : 'Afficher les commentaires'}</span>
        </Button>
      </div>

      {showComments && (
        <>
          <form onSubmit={handleSubmitComment} className="flex gap-2 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newComment.trim() || isSubmitting}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 animate-fade-in">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>{comment.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{comment.username}</span>
                        {comment.userId === Number(localStorage.getItem('userId')) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${comment.hasUserLiked ? 'text-primary' : ''}`}
                      >
                        <ThumbsUp size={12} className={comment.hasUserLiked ? 'fill-primary' : ''} />
                        <span>
                          {comment.likes > 0 ? `${comment.likes} J'aime` : "J'aime"}
                        </span>
                      </button>
                      <span>{new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun commentaire pour le moment. Soyez le premier à commenter !
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default CommentSystem;
