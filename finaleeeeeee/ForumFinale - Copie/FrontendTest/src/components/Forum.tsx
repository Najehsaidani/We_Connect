import React, { useState } from 'react';
import ForumPost, { Post } from './ForumPost';

const Forum = () => {
  // État pour stocker les posts
  const [posts, setPosts] = useState<Post[]>([
    // Exemple de posts initiaux
    {
      id: 1,
      author: 'Utilisateur Actuel',
      authorAvatar: '/placeholder.svg',
      timestamp: 'Il y a 2 heures',
      content: 'Bonjour à tous ! Voici ma première publication sur le forum.',
      likes: 5,
      comments: 2,
      category: 'Général'
    },
    {
      id: 2,
      author: 'Jean Dupont',
      authorAvatar: '/placeholder.svg',
      timestamp: 'Il y a 3 heures',
      content: 'Quelqu\'un a-t-il des conseils pour les examens de fin d\'année ?',
      likes: 3,
      comments: 1,
      category: 'Études'
    }
  ]);

  // Fonction pour supprimer un post
  const handleDeletePost = (id: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
  };

  // Fonction pour modifier un post
  const handleEditPost = (id: number, updatedContent: string) => {
    // Mettre à jour l'état des posts dans le composant parent
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === id ? { ...post, content: updatedContent } : post
      )
    );
    
    // Éventuellement, envoyer les modifications à une API
    // updatePostInDatabase(id, updatedContent);
  };

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <ForumPost 
          key={post.id}
          post={post} 
          onDelete={handleDeletePost} 
          onEdit={handleEditPost} 
        />
      ))}
    </div>
  );
};

export default Forum;