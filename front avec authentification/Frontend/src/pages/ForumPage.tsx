
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
import ForumPost, { Post } from "@/components/ForumPost";
import PhotoUploader from "@/components/PhotoUploader";

// Categories for filtering
const categories = [
  { name: 'Tous', icon: <Filter size={16} /> },
  { name: 'Études', icon: <Filter size={16} /> },
  { name: 'Campus', icon: <Filter size={16} /> },
  { name: 'Événements', icon: <Calendar size={16} /> },
  { name: 'Carrière', icon: <Filter size={16} /> },
  { name: 'Marketplace', icon: <Filter size={16} /> },
];

// Sample forum posts data
const initialPosts = [
  {
    id: 1,
    author: 'Marie Dupont',
    authorAvatar: '/placeholder.svg',
    timestamp: 'Il y a 2 heures',
    content: 'Est-ce que quelqu\'un a le planning des examens pour le semestre prochain ? Le site ne semble pas être mis à jour.',
    likes: 24,
    comments: 12,
    category: 'Études'
  },
  {
    id: 2,
    author: 'Thomas Martin',
    authorAvatar: '/placeholder.svg',
    timestamp: 'Il y a 5 heures',
    content: 'Je cherche des volontaires pour le projet associatif de nettoyage du campus ce weekend. On se retrouve samedi à 10h devant la bibliothèque !',
    imageUrl: '/placeholder.svg',
    likes: 56,
    comments: 8,
    category: 'Événements'
  },
  {
    id: 3,
    author: 'Léa Rousseau',
    authorAvatar: '/placeholder.svg',
    timestamp: 'Il y a 10 heures',
    content: 'Quelqu\'un aurait des conseils pour trouver un stage en marketing digital ? Je commence mes recherches et je ne sais pas trop par où commencer...',
    likes: 15,
    comments: 22,
    category: 'Carrière'
  },
  {
    id: 4,
    author: 'Hugo Petit',
    authorAvatar: '/placeholder.svg',
    timestamp: 'Hier',
    content: 'La nouvelle cafétéria est enfin ouverte ! Les prix sont raisonnables et le café est vraiment bon. À tester !',
    likes: 87,
    comments: 34,
    category: 'Campus'
  },
  {
    id: 5,
    author: 'Emma Lefevre',
    authorAvatar: '/placeholder.svg',
    timestamp: 'Avant-hier',
    content: 'Je vends mes livres de première année de droit si ça intéresse quelqu\'un. Ils sont en très bon état et je fais un prix pour le lot complet.',
    likes: 9,
    comments: 16,
    category: 'Marketplace'
  }
];

const ForumPage = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostCategory, setNewPostCategory] = useState('Général');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulate loading posts with a delay
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load more posts
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 3);
  };

  // Filter posts by category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'Tous' || post.category === activeCategory;
    const matchesQuery = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesQuery;
  });

  // Create a new post
  const handleCreatePost = () => {
    if (newPostContent.trim() === '') {
      toast({
        title: "Champ requis",
        description: "Veuillez entrer du contenu pour votre publication.",
        variant: "destructive"
      });
      return;
    }

    const newPost: Post = {
      id: posts.length + 1,
      author: 'Utilisateur Actuel',
      authorAvatar: '/placeholder.svg',
      timestamp: 'À l\'instant',
      content: newPostContent,
      ...(newPostImage && { imageUrl: newPostImage }),
      likes: 0,
      comments: 0,
      category: newPostCategory
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setIsCreatePostOpen(false);
    
    toast({
      title: "Publication créée",
      description: "Votre publication a été publiée avec succès !",
    });
  };

  // Handle photo upload for a new post
  const handlePhotoAdded = (photoUrl: string) => {
    setNewPostImage(photoUrl);
  };

  // Handle photo removal for a new post
  const handlePhotoRemoved = () => {
    setNewPostImage(null);
  };

  // Delete a post
  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
    toast({
      title: "Publication supprimée",
      description: "Votre publication a été supprimée avec succès.",
    });
  };

  // Change active category
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

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Categories */}
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

        {/* Search */}
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

      {/* Posts */}
      <div className="space-y-6">
        {isLoading ? (
          // Skeleton loader for posts
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
          filteredPosts.slice(0, visiblePosts).map((post, index) => (
            <ForumPost 
              key={post.id} 
              post={post} 
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          // No results found
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

        {/* Load more button */}
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

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreatePostOpen(true)}
        className="floating-action-button"
        aria-label="Créer une publication"
      >
        <Plus size={24} />
      </button>

      {/* Create Post Dialog */}
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
                className="input-field"
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
            <Button onClick={handleCreatePost}>Publier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumPage;
