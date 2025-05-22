
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ForumPost from "@/components/ForumPost";
import PhotoUploader from "@/components/PhotoUploader";

// Définition du type Post adapté à Spring Boot
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

// URL de base de l'API Spring Boot
const API_BASE_URL = 'http://localhost:8082/api';

// Catégories pour le filtrage
const categories = [
  { name: 'Tous', icon: <Filter size={16} /> },
  { name: 'Études', icon: <Filter size={16} /> },
  { name: 'Campus', icon: <Filter size={16} /> },
  { name: 'Événements', icon: <Calendar size={16} /> },
  { name: 'Carrière', icon: <Filter size={16} /> },
  { name: 'Marketplace', icon: <Filter size={16} /> },
];

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const ForumPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostCategory, setNewPostCategory] = useState('Général');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { toast } = useToast();

  // Fonction pour récupérer les posts depuis l'API Spring Boot
  const fetchPosts = async () => {
    try {
      // Get current user ID from localStorage or null for anonymous users
      const currentUserId = localStorage.getItem('userId') || null;
      const response = await fetch(`${API_BASE_URL}/posts${currentUserId ? `?userId=${currentUserId}` : ''}`);

      if (!response.ok) {
        // Essayez de parser le message d'erreur du backend
        let errorMessage = 'Erreur de chargement';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Erreur lors du parsing de la réponse d'erreur:", e);
        }

        throw new Error(errorMessage);
      }

      const posts = await response.json();
      return posts;
    } catch (error) {
      console.error("Erreur lors de la récupération des posts:", error);
      throw error;
    }
  };
  // Fonction pour créer un post via l'API Spring Boot
  const createPost = async (postData: {
    content: string;
    imageUrl?: string;
    category: string;
  }) => {
    try {
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        throw new Error('Vous devez être connecté pour créer un post');
      }

      console.log("Envoi de la requête de création de post:", {
        userId: currentUserId,
        content: postData.content,
        imageUrl: postData.imageUrl || null,
        category: postData.category
      });

      const response = await fetch(`${API_BASE_URL}/posts?userId=${currentUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postData.content,
          imageUrl: postData.imageUrl || null,
          category: postData.category
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Erreur de création';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas du JSON valide, utiliser le texte brut
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur API:", error);
      throw error;
    }
  };

  // Fonction pour supprimer un post via l'API Spring Boot
  const deletePost = async (postId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
      });

      // If we get a 404 or 500 error, it might mean the post was already deleted
      // or doesn't exist, which is fine for our purposes
      if (response.status === 404 || response.status === 500) {
        console.log(`Post ${postId} not found or already deleted`);
        return true;
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur de suppression');
        } catch (e) {
          // If we can't parse the error as JSON, just use the status text
          throw new Error(`Erreur de suppression: ${response.statusText}`);
        }
      }
      return true;
    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  // Chargement initial des posts
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les publications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Charger plus de posts
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 3);
  };

  // Filtrer les posts par catégorie et recherche
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'Tous' || post.category === activeCategory;
    const matchesQuery = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.username.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  // Créer un nouveau post
  const handleCreatePost = async () => {
    try {
      setIsCreatingPost(true);

      const postData = {
        content: newPostContent,
        category: newPostCategory,
        imageUrl: newPostImage || null // Envoyer null si pas d'image
      };

      // Essayer de créer le post
      try {
        const response = await createPost(postData);

        setPosts([response, ...posts]);
        setNewPostContent('');
        setNewPostImage(null);
        setIsCreatePostOpen(false);

        toast({
          title: "Succès",
          description: "Publication créée avec succès!",
        });
      } catch (error) {
        console.error("Erreur lors de la création du post:", error);

        // Créer un post local temporaire pour une meilleure expérience utilisateur
        const tempPost = {
          id: Date.now(), // ID temporaire
          content: newPostContent,
          category: newPostCategory,
          imageUrl: newPostImage,
          userId: Number(localStorage.getItem('userId')),
          username: "Utilisateur Actuel",
          authorAvatar: "/placeholder.svg",
          likeCount: 0,
          commentCount: 0,
          reportCount: 0,
          hasUserLiked: false,
          comments: [],
          createdAt: new Date().toISOString(),
          isTemporary: true // Marquer comme temporaire
        };

        setPosts([tempPost, ...posts]);
        setNewPostContent('');
        setNewPostImage(null);
        setIsCreatePostOpen(false);

        toast({
          title: "Publication créée localement",
          description: "Votre publication a été créée localement. Elle sera synchronisée avec le serveur ultérieurement.",
          variant: "default"
        });
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes("Data too long")) {
          errorMessage = "L'image est trop grande. Veuillez en choisir une autre.";
        }
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  // REMOVE THIS ENTIRE COMPONENT DEFINITION
  // const PhotoUploader = ({ onPhotoAdded }) => {
  //   const handleChange = async (e) => {
  //     const file = e.target.files[0];
  //     if (file.size > 5 * 1024 * 1024) { // 5MB
  //       alert("Le fichier est trop volumineux (max 5MB)");
  //       return;
  //     }
  //
  //     // Solution 1: URL locale (limité)
  //     const url = URL.createObjectURL(file);
  //     onPhotoAdded(url);
  //
  //     // Solution 2: Upload vers le serveur
  //     /*
  //     const formData = new FormData();
  //     formData.append('file', file);
  //
  //     try {
  //       const response = await fetch('/api/upload', {
  //         method: 'POST',
  //         body: formData
  //       });
  //       const data = await response.json();
  //       onPhotoAdded(data.url);
  //     } catch (error) {
  //       console.error("Upload failed:", error);
  //     }
  //     */
  //   };
  //
  //   return <input type="file" accept="image/*" onChange={handleChange} />;
  // };

  // Supprimer un post
  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Publication supprimée",
        description: "Votre publication a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer la publication",
        variant: "destructive"
      });
    }
  };

  // Fonction pour mettre à jour un post via l'API Spring Boot
  const updatePost = async (postId: number, updatedContent: string, category?: string) => {
    try {
      console.log("Sending update request with data:", {
        content: updatedContent,
        category: category || 'Général',
        imageUrl: null
      });

      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: updatedContent,
          category: category || 'Général',
          imageUrl: null,
          author: "Utilisateur Actuel", // Add this if your backend expects it
          authorAvatar: "/placeholder.svg" // Add this if your backend expects it
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
        } catch (e) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur :", error);
      throw error;
    }
  };

  // Modifier un post
  const handleEditPost = async (postId: number, updatedContent: string) => {
    try {
      // Trouver le post actuel pour obtenir sa catégorie
      const currentPost = posts.find(post => post.id === postId);
      if (!currentPost) {
        throw new Error("Post introuvable");
      }

      // Appeler l'API pour mettre à jour le post
      const updatedPost = await updatePost(postId, updatedContent, currentPost.category);

      // Mettre à jour localement
      setPosts(posts.map(post =>
        post.id === postId ? updatedPost : post
      ));

      toast({
        title: "Publication modifiée",
        description: "Votre publication a été modifiée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de modifier la publication",
        variant: "destructive"
      });
    }
  };

  // Gestion des photos
  const handlePhotoAdded = (photoUrl: string) => {
    if (photoUrl.length > 5000) {
      toast({
        title: "URL trop longue",
        description: "L'URL de l'image ne peut pas dépasser 5000 caractères",
        variant: "destructive"
      });
      return false; // Indique que l'ajout a échoué
    }
    setNewPostImage(photoUrl);
    return true;
  };

  const handlePhotoRemoved = () => {
    setNewPostImage(null);
  };

  // Changer de catégorie
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Forum Étudiant</h1>
        <p className="page-subtitle">
          Discutez, posez vos questions et partagez avec la communauté étudiante
        </p>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Catégories */}
        <div className="flex overflow-x-auto pb-2 space-x-2 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category.name
                  ? 'bg-primary text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Publications */}
      <div className="space-y-6">
        {isLoading ? (
          // Squelette de chargement
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-border animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6 mt-2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.slice(0, visiblePosts).map((post) => (
            <ForumPost
              key={post.id}
              post={post}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
            />
          ))
        ) : (
          // Aucun résultat
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium mb-2">Aucun résultat trouvé</h3>
            <p className="text-muted-foreground">
              Essayez d'utiliser d'autres mots-clés ou de changer de catégorie.
            </p>
          </div>
        )}

        {/* Bouton "Voir plus" */}
        {!isLoading && filteredPosts.length > visiblePosts && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="animate-fade-in"
            >
              Voir plus de publications
            </Button>
          </div>
        )}
      </div>

      {/* Bouton flottant pour créer un post */}
      <button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Créer une publication"
      >
        <Plus size={24} />
      </button>

      {/* Dialogue de création de post */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une publication</DialogTitle>
            <DialogDescription>
              Partagez vos questions, idées ou annonces avec la communauté étudiante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Que souhaitez-vous partager ?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[150px]"
            />

            <PhotoUploader
              onPhotoAdded={handlePhotoAdded}
              onPhotoRemoved={handlePhotoRemoved}
            />

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Catégorie
              </label>
              <select
                id="category"
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Général">Général</option>
                <option value="Études">Études</option>
                <option value="Campus">Campus</option>
                <option value="Événements">Événements</option>
                <option value="Carrière">Carrière</option>
                <option value="Marketplace">Marketplace</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePost} disabled={isCreatingPost}>
              {isCreatingPost ? 'Publication en cours...' : 'Publier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
