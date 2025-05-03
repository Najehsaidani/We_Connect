import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Activity, 
  Flag, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle, 
  Search,
  Trash,
  UserCog,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  UserX,
  User as UserIcon, // Renamed to avoid conflict
  Shield,
  Edit,
  Loader2,
  Filter,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from '@/types';

// Sample reported posts
const initialReportedPosts = [
  {
    id: 1,
    author: 'user123',
    content: 'Ce contenu contient des propos inappropriés et des insultes.',
    reportedBy: 'moderator1',
    date: '2025-04-28',
    reason: 'Contenu inapproprié'
  },
  {
    id: 2,
    author: 'anonymous',
    content: 'Lien vers un site frauduleux : fakewebsite.com',
    reportedBy: 'student456',
    date: '2025-04-27',
    reason: 'Contenu malveillant'
  },
  {
    id: 3,
    author: 'spammer99',
    content: 'Achetez notre produit incroyable ! Promotion limitée !',
    reportedBy: 'admin',
    date: '2025-04-25',
    reason: 'Spam'
  }
];

// Sample user management data
const initialUsers = [
  {
    id: 1,
    username: 'marie.dupont',
    name: 'Marie Dupont',
    email: 'marie.dupont@universite.fr',
    role: 'student',
    status: 'Actif',
    joined: '2024-09-10'
  },
  {
    id: 2,
    username: 'thomas.martin',
    name: 'Thomas Martin',
    email: 'thomas.martin@universite.fr',
    role: 'moderator',
    status: 'Actif',
    joined: '2024-09-08'
  },
  {
    id: 3,
    username: 'prof.leclerc',
    name: 'Sophie Leclerc',
    email: 'sophie.leclerc@universite.fr',
    role: 'professor',
    status: 'Actif',
    joined: '2023-01-15'
  },
  {
    id: 4,
    username: 'jean.dupuis',
    name: 'Jean Dupuis',
    email: 'jean.dupuis@universite.fr',
    role: 'student',
    status: 'Bloqué',
    joined: '2024-09-20'
  }
];

// Sample club approval requests
const initialClubRequests = [
  {
    id: 1,
    name: 'Club de Robotique',
    description: 'Un club pour les passionnés de robotique et d\'électronique.',
    requestedBy: 'Alex Moreau',
    date: '2025-04-26',
    members: 12,
    coverImage: '/placeholder.svg',
    avatar: '/placeholder.svg'
  },
  {
    id: 2,
    name: 'Association Artistique',
    description: 'Pour tous les amateurs d\'art sous toutes ses formes.',
    requestedBy: 'Emma Bernard',
    date: '2025-04-25',
    members: 8,
    coverImage: '/placeholder.svg',
    avatar: '/placeholder.svg'
  }
];

// Sample analytics data
const analyticsData = {
  users: {
    total: 2587,
    new: 145,
    active: 1897,
    growth: '+5.7%'
  },
  posts: {
    total: 12458,
    today: 342,
    reported: 15,
    growth: '+12.3%'
  },
  events: {
    total: 87,
    upcoming: 42,
    participants: 1256,
    growth: '+3.4%'
  },
  clubs: {
    total: 56,
    active: 48,
    members: 1876,
    growth: '+2.1%'
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Admin</span>;
    case 'moderator':
      return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Modérateur</span>;
    case 'professor':
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center"><GraduationCap size={12} className="mr-1" />Professeur</span>;
    case 'student':
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"><BookOpen size={12} className="mr-1" />Étudiant</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Utilisateur</span>;
  }
};

const AdminPage = () => {
  const [reportedPosts, setReportedPosts] = useState(initialReportedPosts);
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [clubRequests, setClubRequests] = useState(initialClubRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isClubDetailDialogOpen, setIsClubDetailDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();

  // Handle post moderation
  const handleApprovePost = (postId: number) => {
    setReportedPosts(reportedPosts.filter(post => post.id !== postId));
    toast({
      title: 'Post approuvé',
      description: 'Le post a été approuvé et reste visible.',
    });
  };

  const handleRemovePost = (postId: number) => {
    setReportedPosts(reportedPosts.filter(post => post.id !== postId));
    toast({
      title: 'Post supprimé',
      description: 'Le post a été supprimé avec succès.',
      variant: 'destructive'
    });
  };

  // Handle club approval
  const handleApproveClub = (clubId: number) => {
    setClubRequests(clubRequests.filter(club => club.id !== clubId));
    toast({
      title: 'Club approuvé',
      description: 'Le club a été approuvé et est maintenant visible.',
    });
  };

  const handleRejectClub = (clubId: number) => {
    setClubRequests(clubRequests.filter(club => club.id !== clubId));
    toast({
      title: 'Club rejeté',
      description: 'La demande de création de club a été rejetée.',
      variant: 'destructive'
    });
  };

  // Handle club details view
  const handleViewClubDetails = (clubId: number) => {
    setSelectedClub(clubId);
    setIsClubDetailDialogOpen(true);
  };

  // Handle user management
  const handleViewUser = (userId: number) => {
    setSelectedUser(userId);
    setIsUserDialogOpen(true);
  };

  const handleUpdateUserStatus = (userId: number, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setIsUserDialogOpen(false);
    
    toast({
      title: 'Statut mis à jour',
      description: `Le statut de l'utilisateur a été changé en "${newStatus}".`,
    });
  };

  // Handle user role management
  const handleOpenRoleDialog = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(userId);
      setSelectedRole(user.role);
      setIsRoleDialogOpen(true);
    }
  };
  
  const handleUpdateUserRole = () => {
    if (selectedUser && selectedRole) {
      setUsers(users.map(user => 
        user.id === selectedUser ? { ...user, role: selectedRole } : user
      ));
      
      setIsRoleDialogOpen(false);
      
      toast({
        title: 'Rôle mis à jour',
        description: `Le rôle de l'utilisateur a été mis à jour avec succès.`,
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected user details
  const userDetails = users.find(user => user.id === selectedUser);
  
  // Get selected club details
  const clubDetails = clubRequests.find(club => club.id === selectedClub);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Administration</h1>
        <p className="page-subtitle">
          Gérez et modérez le contenu et les utilisateurs de la plateforme
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-muted-foreground" /> Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.users.total}</div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">Nouveaux: {analyticsData.users.new}</span>
              <span className="text-sm text-green-600">{analyticsData.users.growth}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-muted-foreground" /> Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.posts.total}</div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">Aujourd'hui: {analyticsData.posts.today}</span>
              <span className="text-sm text-green-600">{analyticsData.posts.growth}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" /> Événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.events.total}</div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">À venir: {analyticsData.events.upcoming}</span>
              <span className="text-sm text-green-600">{analyticsData.events.growth}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-muted-foreground" /> Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.clubs.total}</div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">Actifs: {analyticsData.clubs.active}</span>
              <span className="text-sm text-green-600">{analyticsData.clubs.growth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="moderation">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="moderation" className="flex items-center">
            <Flag className="mr-2 h-4 w-4" /> Modération
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="clubs" className="flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4" /> Demandes de clubs
          </TabsTrigger>
        </TabsList>
        
        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4 mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Publications signalées</CardTitle>
              <CardDescription>
                Examinez et moderez les publications signalées par les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportedPosts.length > 0 ? (
                <div className="space-y-4">
                  {reportedPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">@{post.author}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {post.reason}
                        </span>
                      </div>
                      <p className="text-foreground mb-3">{post.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Signalé par: {post.reportedBy}
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApprovePost(post.id)}
                          >
                            <CheckCircle size={16} className="mr-1" /> Approuver
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemovePost(post.id)}
                          >
                            <XCircle size={16} className="mr-1" /> Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <h3 className="text-xl font-medium mb-2">Tout est en ordre !</h3>
                  <p className="text-muted-foreground">
                    Il n'y a actuellement aucune publication signalée à modérer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Consultez et gérez les comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="pl-10 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <div>Utilisateur</div>
                  <div>Email</div>
                  <div>Rôle</div>
                  <div>Statut</div>
                </div>
                
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                      <div className="text-sm truncate">{user.email}</div>
                      <div className="text-sm">{getRoleBadge(user.role)}</div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Actif' ? 'bg-green-100 text-green-800' :
                          user.status === 'Bloqué' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez une autre recherche.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {filteredUsers.length} sur {users.length} utilisateurs
              </div>
              <div>
                {/* Pagination would go here */}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Club Requests Tab */}
        <TabsContent value="clubs" className="space-y-4 mt-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Demandes de création de clubs</CardTitle>
              <CardDescription>
                Approuvez ou refusez les demandes de création de nouveaux clubs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clubRequests.length > 0 ? (
                <div className="space-y-4">
                  {clubRequests.map((club) => (
                    <div 
                      key={club.id} 
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex-shrink-0 mr-3 flex items-center justify-center overflow-hidden">
                            <img 
                              src={club.avatar} 
                              alt={club.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{club.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              Demande du {new Date(club.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {club.members} membres potentiels
                        </span>
                      </div>
                      
                      <p className="text-foreground mb-3">{club.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Proposé par: {club.requestedBy}
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewClubDetails(club.id)}
                          >
                            <Eye size={16} className="mr-1" /> Plus d'infos
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleApproveClub(club.id)}
                          >
                            <CheckCircle size={16} className="mr-1" /> Approuver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectClub(club.id)}
                          >
                            <XCircle size={16} className="mr-1" /> Refuser
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <h3 className="text-xl font-medium mb-2">Tout est à jour !</h3>
                  <p className="text-muted-foreground">
                    Il n'y a actuellement aucune demande de création de club en attente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>
              Consultez et gérez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          
          {userDetails && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-lg font-medium">
                    {userDetails.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-lg">{userDetails.name}</h3>
                  <p className="text-muted-foreground">@{userDetails.username}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{userDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <div className="flex items-center justify-between mt-1">
                      <div>{getRoleBadge(userDetails.role)}</div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenRoleDialog(userDetails.id)}
                      >
                        <UserCog size={14} className="mr-1" /> Modifier
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        userDetails.status === 'Actif' ? 'bg-green-100 text-green-800' :
                        userDetails.status === 'Bloqué' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userDetails.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inscrit le</p>
                    <p>{new Date(userDetails.joined).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline"
                      className="justify-start"
                      onClick={() => window.open(`/profile/${userDetails.id}`, '_blank')}
                    >
                      <ArrowUpRight size={16} className="mr-2" /> Voir le profil complet
                    </Button>
                    
                    {userDetails.status === 'Actif' ? (
                      <Button 
                        variant="outline"
                        className="justify-start text-amber-600"
                        onClick={() => handleUpdateUserStatus(userDetails.id, 'Suspendu')}
                      >
                        <ShieldAlert size={16} className="mr-2" /> Suspendre l'utilisateur
                      </Button>
                    ) : userDetails.status === 'Suspendu' ? (
                      <Button 
                        variant="outline"
                        className="justify-start text-green-600"
                        onClick={() => handleUpdateUserStatus(userDetails.id, 'Actif')}
                      >
                        <CheckCircle size={16} className="mr-2" /> Réactiver l'utilisateur
                      </Button>
                    ) : null}
                    
                    <Button 
                      variant="outline"
                      className="justify-start text-destructive"
                      onClick={() => handleUpdateUserStatus(userDetails.id, 'Bloqué')}
                    >
                      <Trash size={16} className="mr-2" /> Bloquer l'utilisateur
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Définissez le rôle de l'utilisateur sur la plateforme
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Administrateur
                  </div>
                </SelectItem>
                <SelectItem value="moderator">
                  <div className="flex items-center">
                    <Flag className="mr-2 h-4 w-4" />
                    Modérateur
                  </div>
                </SelectItem>
                <SelectItem value="professor">
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Professeur
                  </div>
                </SelectItem>
                <SelectItem value="student">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Étudiant
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">Description du rôle:</p>
              <p className="text-sm">
                {selectedRole === 'admin' && "Accès complet à toutes les fonctionnalités d'administration."}
                {selectedRole === 'moderator' && "Peut modérer le contenu et gérer les utilisateurs."}
                {selectedRole === 'professor' && "Enseignant avec accès à des fonctionnalités spécifiques."}
                {selectedRole === 'student' && "Utilisateur standard avec accès aux fonctionnalités de base."}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateUserRole}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Club Details Dialog */}
      <Dialog open={isClubDetailDialogOpen} onOpenChange={setIsClubDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du club</DialogTitle>
            <DialogDescription>
              Consultez les détails complets de la demande de création de club
            </DialogDescription>
          </DialogHeader>
          
          {clubDetails && (
            <div className="py-4">
              <div className="relative w-full h-48 rounded-lg bg-muted mb-16 overflow-hidden">
                <img 
                  src={clubDetails.coverImage} 
                  alt={clubDetails.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white flex items-center justify-center overflow-hidden">
                    <img 
                      src={clubDetails.avatar} 
                      alt={clubDetails.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h2 className="text-2xl font-semibold">{clubDetails.name}</h2>
                <div className="flex items-center mt-1 mb-4">
                  <span className="text-sm text-muted-foreground">
                    Proposé par: {clubDetails.requestedBy} • {new Date(clubDetails.date).toLocaleDateString()}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                    {clubDetails.members} membres potentiels
                  </span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {clubDetails.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Objectifs du club</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Organiser des rencontres et ateliers réguliers</li>
                      <li>Participer à des événements et compétitions</li>
                      <li>Proposer des formations aux débutants</li>
                      <li>Développer des projets collaboratifs</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Ressources demandées</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Salle de réunion (2h par semaine)</li>
                      <li>Budget initial pour matériel</li>
                      <li>Espace de stockage</li>
                      <li>Accès à la plateforme pour communication</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClubDetailDialogOpen(false)}>Fermer</Button>
            {clubDetails && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleRejectClub(clubDetails.id);
                    setIsClubDetailDialogOpen(false);
                  }}
                >
                  <XCircle size={16} className="mr-2" /> Refuser
                </Button>
                <Button 
                  onClick={() => {
                    handleApproveClub(clubDetails.id);
                    setIsClubDetailDialogOpen(false);
                  }}
                >
                  <CheckCircle size={16} className="mr-2" /> Approuver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
