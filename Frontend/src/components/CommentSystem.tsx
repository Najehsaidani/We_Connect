
import React, { useState } from 'react';
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
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommentSystemProps {
  postId: number;
  initialComments?: Comment[];
}

const CommentSystem = ({ postId, initialComments = [] }: CommentSystemProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now(),
        author: 'Utilisateur Actuel',
        authorAvatar: '/placeholder.svg',
        content: newComment,
        timestamp: 'À l\'instant',
        likes: 0,
        isLiked: false
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
      setIsSubmitting(false);
      setShowComments(true);
      
      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
    }, 500);
  };
  
  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          } 
        : comment
    ));
  };
  
  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    toast({
      title: "Commentaire supprimé",
      description: "Votre commentaire a été supprimé.",
    });
  };
  
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleComments}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <MessageSquare size={18} />
          <span>{comments.length} commentaires</span>
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
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 animate-fade-in">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{comment.author}</span>
                        {comment.author === 'Utilisateur Actuel' && (
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
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${comment.isLiked ? 'text-primary' : ''}`}
                      >
                        <ThumbsUp size={12} className={comment.isLiked ? 'fill-primary' : ''} />
                        <span>
                          {comment.likes > 0 ? `${comment.likes} J'aime` : "J'aime"}
                        </span>
                      </button>
                      <span>{comment.timestamp}</span>
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
