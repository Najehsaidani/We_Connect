
import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Image } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import CommentSystem from './CommentSystem';

export interface Post {
  id: number;
  author: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  category: string;
  isLiked?: boolean;
}

interface ForumPostProps {
  post: Post;
  onDelete?: (id: number) => void;
}

const ForumPost = ({ post, onDelete }: ForumPostProps) => {
  const [currentPost, setCurrentPost] = useState<Post>({
    ...post,
    isLiked: false
  });
  const { toast } = useToast();

  const handleLike = () => {
    setCurrentPost(prev => ({
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    }));
  };

  const handleShare = () => {
    toast({
      title: "Lien copié",
      description: "Le lien de la publication a été copié dans votre presse-papiers.",
    });
    
    // In a real app, this would use the Web Share API or copy a link to the clipboard
    navigator.clipboard.writeText(`https://cozycampus.app/post/${post.id}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const isCurrentUser = currentPost.author === 'Utilisateur Actuel';

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border animate-fade-in card-hover">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={currentPost.authorAvatar} alt={currentPost.author} />
            <AvatarFallback>{currentPost.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{currentPost.author}</h3>
            <p className="text-xs text-muted-foreground">{currentPost.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
            {currentPost.category}
          </span>
          {isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete}>Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-foreground">{currentPost.content}</p>
        
        {currentPost.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={currentPost.imageUrl} 
              alt="Post content" 
              className="w-full object-cover max-h-96" 
            />
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div className="flex space-x-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart 
              size={18} 
              className={currentPost.isLiked ? "fill-primary text-primary" : ""} 
            />
            <span>{currentPost.likes}</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare size={18} />
            <span>{currentPost.comments}</span>
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 size={18} />
            <span>Partager</span>
          </Button>
        </div>
      </div>
      
      <CommentSystem
        postId={currentPost.id}
        initialComments={[
          // Sample comments - in a real app, these would be fetched from an API
          {
            id: 1,
            author: 'Marie Dupont',
            authorAvatar: '/placeholder.svg',
            content: 'Super publication ! Je suis totalement d\'accord avec toi.',
            timestamp: 'Il y a 10 minutes',
            likes: 3,
            isLiked: false
          },
          {
            id: 2,
            author: 'Thomas Martin',
            authorAvatar: '/placeholder.svg',
            content: 'C\'est très intéressant, merci de partager !',
            timestamp: 'Il y a 30 minutes',
            likes: 1,
            isLiked: false
          }
        ]}
      />
    </div>
  );
};

export default ForumPost;
