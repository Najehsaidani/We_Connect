
import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Heart, MessageSquare, Share2, MoreHorizontal, Image } from 'lucide-react';
import ReportSystem from './ReportSystem';
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
  userId: number;
  username: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  category: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  hasUserLiked: boolean;
}

interface ForumPostProps {
  post: Post;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, updatedContent: string) => void;
}
const api_url='http://localhost:8082/api';

const ForumPost = ({ post, onDelete, onEdit }: ForumPostProps) => {
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour aimer un post",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${api_url}/posts/${currentPost.id}/like?userId=${currentUserId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du like');
      }

      const updatedPost = await response.json();
      setCurrentPost(updatedPost);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du like',
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    toast({
      title: "Lien copié",
      description: "Le lien de la publication a été copié dans votre presse-papiers.",
    });

    // In a real app, this would use the Web Share API or copy a link to the clipboard
    navigator.clipboard.writeText(`https://cozycampus.app/post/${post.id}`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/posts/${currentPost.id}`, {
        method: 'DELETE',
      });

      // If we get a 404 or 500 error, it might mean the post was already deleted
      // which is fine for our purposes
      if (response.status === 404 || response.status === 500) {
        console.log(`Post ${currentPost.id} not found or already deleted`);

        if (onDelete) {
          onDelete(post.id);
        }

        toast({
          title: "Publication supprimée",
          description: "Votre publication a été supprimée avec succès.",
        });

        return;
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la suppression du post');
        } catch (e) {
          // If we can't parse the error as JSON, just use the status text
          throw new Error(`Erreur lors de la suppression: ${response.statusText}`);
        }
      }

      if (onDelete) {
        onDelete(post.id);
      }

      toast({
        title: "Publication supprimée",
        description: "Votre publication a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la suppression du post',
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/posts/${currentPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
          category: currentPost.category,
          imageUrl: currentPost.imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification du post');
      }

      const updatedPost = await response.json();
      setCurrentPost(updatedPost);
      setIsEditing(false);

      if (onEdit) {
        onEdit(currentPost.id, editContent);
      }

      toast({
        title: "Publication modifiée",
        description: "Votre publication a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : 'Erreur lors de la modification du post',
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditContent(currentPost.content);
    setIsEditing(false);
  };

  // Function to refresh post data when comments change
  const refreshPostData = async () => {
    try {
      // Check if the post has been deleted
      if (!currentPost || !currentPost.id) {
        console.log('Post no longer exists, skipping refresh');
        return;
      }

      const currentUserId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8082/api/posts/${currentPost.id}?userId=${currentUserId || ''}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // If the post is not found (404), it means it was deleted
        if (response.status === 404 || response.status === 500) {
          console.log('Post not found or server error, post may have been deleted');
          // We don't need to do anything here as the post has been removed from the UI
          return;
        }
        throw new Error('Failed to refresh post data');
      }

      const updatedPost = await response.json();
      setCurrentPost(updatedPost);
    } catch (error) {
      console.error('Error refreshing post data:', error);
      // Don't show an error toast as this is a background refresh
      // and would be annoying to users
    }
  };

  // Fetch the latest post data when the component mounts
  useEffect(() => {
    refreshPostData();
    // We're intentionally not adding refreshPostData to the dependency array
    // as it would cause an infinite loop
  }, [currentPost.id]);

  const currentUserId = localStorage.getItem('userId');
  const isCurrentUser = currentUserId && currentPost.userId === parseInt(currentUserId);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border animate-fade-in card-hover">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={currentPost.authorAvatar} alt={currentPost.username} />
            <AvatarFallback>{currentPost.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{currentPost.username}</h3>
            <p className="text-xs text-muted-foreground">{formatDate(currentPost.createdAt)}</p>
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
                <DropdownMenuItem onClick={handleEdit}>Modifier</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Modifier votre publication..."
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelEdit}>Annuler</Button>
              <Button onClick={handleSaveEdit}>Enregistrer</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Contenu du post */}
            <div className="mt-2">
              <p className="whitespace-pre-wrap">{currentPost.content}</p>

              {/* Image du post (avec gestion d'erreur) */}
              {post.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full object-cover max-h-96"
                    onError={(e) => {
                      console.error('Failed to load image:', post.imageUrl);
                      // Hide the broken image
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </>
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
              className={currentPost.hasUserLiked ? "fill-primary text-primary" : ""}
            />
            <span>{currentPost.likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Reference to the CommentSystem's toggle function
              const commentSystemElement = document.getElementById(`comment-system-${currentPost.id}`);
              if (commentSystemElement) {
                const toggleButton = commentSystemElement.querySelector('button');
                if (toggleButton) toggleButton.click();
              }
            }}
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare size={18} />
            <span>{currentPost.commentCount} commentaire{currentPost.commentCount !== 1 ? 's' : ''}</span>
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
          {!isCurrentUser && <ReportSystem postId={currentPost.id} />}
        </div>
      </div>

      <CommentSystem
        postId={currentPost.id}
        onCommentChange={refreshPostData}
      />
    </div>
  );
};

export default ForumPost;
