import React, { useState, useEffect } from 'react'; 
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { clubService } from '@/services/clubService';
import { PostsService } from '@/services/postService';
import { EventsService } from '@/services/eventService';

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

// Sample analytics data
const analyticsData = {
  users: {
    total: 0, // Will be updated from backend
    new: 0,   // Will be updated from backend
    active: 0, // Will be updated from backend
    growth: '+0.0%'
  },
  posts: {
    total: 0,   // Will be updated from backend
    today: 0,   // Will be updated from backend
    reported: 0, // Will be updated from backend
    growth: '+0.0%'
  },
  events: {
    total: 0,     // Will be updated from backend
    upcoming: 0,  // Will be updated from backend
    participants: 0, // Will be updated from backend
    growth: '+0.0%'
  },
  clubs: {
    total: 0,    // Will be updated from backend
    active: 0,   // Will be updated from backend
    members: 0,  // Will be updated from backend
    growth: '+0.0%'
  }
};

const getRoleBadge = (role) => {
  switch (role) {
    case 'ROLE_ADMIN':
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Admin</span>;
    case 'ROLE_MODERATOR':
      return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Modérateur</span>;
    case 'ROLE_PROFESSOR':
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center"><GraduationCap size={12} className="mr-1" />Professeur</span>;
    case 'ROLE_ETUDIANT':
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"><BookOpen size={12} className="mr-1" />Étudiant</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Utilisateur</span>;
  }
};

const AdminPage = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isClubDetailDialogOpen, setIsClubDetailDialogOpen] = useState(false);
  const [isEditClubDialogOpen, setIsEditClubDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(analyticsData);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const { toast } = useToast();
  const [editClubData, setEditClubData] = useState({
    name: '',
    description: '',
    category: '',
    etat: 'ACTIVE'
  });

  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch all data on component mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchPendingClubs(),
        fetchAllClubs(),
        fetchPosts(),
        fetchEvents()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClub = async (clubId) => {
    try {
      const club = await clubService.getClubById(clubId);
      setSelectedClub(club);
      setEditClubData({
        name: club.nom || '',
        description: club.description || '',
        category: club.categoryId + "" || '',
        etat: club.etat || 'ACTIVE'
      });
      setIsEditClubDialogOpen(true);
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des détails du club',
        variant: 'destructive',
      });
    }
  };

  const handleSaveClubChanges = async () => {
    if (!selectedClub) return;
    
    setIsLoading(true);
    try {
      await clubService.updateClub(selectedClub.id, editClubData);
      
      // Update local data
      setAllClubs(allClubs.map(club => 
        club.id === selectedClub.id 
          ? { ...club, ...editClubData } 
          : club
      ));
      
      toast({
        title: 'Club mis à jour',
        description: 'Les informations du club ont été mises à jour avec succès.',
      });
      
      setIsEditClubDialogOpen(false);
      
      // Refresh data
      fetchAllClubs();
    } catch (error) {
      console.error("Error updating club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour du club',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const clubs = await clubService.getAllClubs();
      setAllClubs(clubs);
      setFilteredClubs(clubs);
    } catch (error) {
      console.error("Error fetching all clubs:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des clubs',
        variant: 'destructive',
      });
    }
  };

  // Fetch all available roles from backend
  const fetchRoles = async () => {
    try {
      const roles = await roleService.getAllRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des rôles disponibles',
        variant: 'destructive',
      });
    }
  };
  
  // Fetch pending club requests
  const fetchPendingClubs = async () => {
    try {
      const pendingClubs = await clubService.getPendingClubs();
      setClubRequests(pendingClubs);
      
      // Fetch all clubs for analytics
      const allClubs = await clubService.getAllClubs();
      
      setAnalytics(prev => ({
        ...prev,
        clubs: {
          total: allClubs.length,
          active: allClubs.filter(club => club.etat === 'ACTIVE').length,
          members: allClubs.reduce((total, club) => total + (club.membres || 0), 0),
          growth: '+2.1%' // This would need actual calculation based on historical data
        }
      }));
    } catch (error) {
      console.error("Error fetching club requests:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des demandes de club',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (clubSearchQuery) {
      const filtered = allClubs.filter(club => 
        club.nom?.toLowerCase().includes(clubSearchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(clubSearchQuery.toLowerCase()) ||
        club.categorie?.toLowerCase().includes(clubSearchQuery.toLowerCase())
      );
      setFilteredClubs(filtered);
    } else {
      setFilteredClubs(allClubs);
    }
  }, [clubSearchQuery, allClubs]);
  
  // Fetch posts
  const fetchPosts = async () => {
    try {
      const posts = await PostsService.getAllPosts();
      setAllPosts(posts);
      
      // For demo purposes, marking some posts as reported
      // In a real implementation, you would have a separate endpoint for reported posts
      const mockReportedPosts = posts.slice(0, 3).map(post => ({
        id: post.id,
        author: post.author || 'Anonymous',
        content: post.content,
        reportedBy: 'System',
        date: post.createdAt || new Date().toISOString().split('T')[0],
        reason: 'Contenu signalé'
      }));
      
      setReportedPosts(mockReportedPosts);
      
      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      const postsToday = posts.filter(post => 
        post.createdAt && post.createdAt.startsWith(today)
      ).length;
      
      setAnalytics(prev => ({
        ...prev,
        posts: {
          total: posts.length,
          today: postsToday,
          reported: mockReportedPosts.length,
          growth: '+12.3%' // This would need actual calculation based on historical data
        }
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des publications',
        variant: 'destructive',
      });
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const events = await EventsService.getAllEvents();
      setAllEvents(events);
      
      // Update analytics
      const today = new Date();
      const upcomingEvents = events.filter(event => 
        new Date(event.date) >= today
      );
      
      setAnalytics(prev => ({
        ...prev,
        events: {
          total: events.length,
          upcoming: upcomingEvents.length,
          participants: 1256, // This would need an API endpoint to get actual participants
          growth: '+3.4%' // This would need actual calculation based on historical data
        }
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des événements',
        variant: 'destructive',
      });
    }
  };
  
  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      
      // Update analytics with real user data
      setAnalytics(prev => ({
        ...prev,
        users: {
          total: usersData.length,
          new: usersData.filter(u => {
            const joinDate = new Date(u.joined);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return joinDate > oneWeekAgo;
          }).length,
          active: usersData.filter(u => u.status === 'ACTIF').length,
          growth: calculateGrowth(usersData)
        }
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des utilisateurs',
        variant: 'destructive',
      });
    }
  };

  // Calculate growth based on new users
  const calculateGrowth = (usersData) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const newUsersThisWeek = usersData.filter(u => {
      const joinDate = new Date(u.joined);
      return joinDate > oneWeekAgo;
    }).length;
    
    const newUsersLastWeek = usersData.filter(u => {
      const joinDate = new Date(u.joined);
      return joinDate > twoWeeksAgo && joinDate <= oneWeekAgo;
    }).length;
    
    if (newUsersLastWeek === 0) return '+100%';
    
    const growthRate = ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100;
    return `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
  };

  // Handle post moderation
  const handleApprovePost = async (postId) => {
    try {
      // In a real implementation, you might have an endpoint for this
      // For now, we'll just remove it from the reported posts
      setReportedPosts(reportedPosts.filter(post => post.id !== postId));
      
      toast({
        title: 'Post approuvé',
        description: 'Le post a été approuvé et reste visible.',
      });
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'approbation du post',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePost = async (postId) => {
    try {
      await PostsService.deletePost(postId);
      
      // Update state to remove the post
      setReportedPosts(reportedPosts.filter(post => post.id !== postId));
      setAllPosts(allPosts.filter(post => post.id !== postId));
      
      toast({
        title: 'Post supprimé',
        description: 'Le post a été supprimé avec succès.',
        variant: 'destructive'
      });
    } catch (error) {
      console.error("Error removing post:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression du post',
        variant: 'destructive',
      });
    }
  };

  // Handle club approval
  const handleApproveClub = async (clubId) => {
    try {
      await clubService.acceptClub(clubId);
      
      // Update state
      setClubRequests(clubRequests.filter(club => club.id !== clubId));
      
      toast({
        title: 'Club approuvé',
        description: 'Le club a été approuvé et est maintenant visible.',
      });
      
      // Refresh the clubs data
      fetchPendingClubs();
    } catch (error) {
      console.error("Error approving club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'approbation du club',
        variant: 'destructive',
      });
    }
  };

  const handleRejectClub = async (clubId) => {
    try {
      await clubService.rejectClub(clubId);
      
      // Update state
      setClubRequests(clubRequests.filter(club => club.id !== clubId));
      
      toast({
        title: 'Club rejeté',
        description: 'La demande de création de club a été rejetée.',
        variant: 'destructive'
      });
      
      // Refresh the clubs data
      fetchPendingClubs();
    } catch (error) {
      console.error("Error rejecting club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du rejet du club',
        variant: 'destructive',
      });
    }
  };

  // Handle club details view
  const handleViewClubDetails = async (clubId) => {
    try {
      const clubDetail = await clubService.getClubById(clubId);
      setSelectedClub(clubDetail);
      setIsClubDetailDialogOpen(true);
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des détails du club',
        variant: 'destructive',
      });
    }
  };

  // Handle user management
  const handleViewUser = async (userId) => {
    setSelectedUser(userId);
    setIsUserDialogOpen(true);
    
    try {
      // Fetch the current role for this user from the backend
      const userRole = await roleService.getUserRole(userId);
      const user = users.find(u => u.id === userId);
      
      // Update the user object with the latest role information
      if (user && userRole) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: userRole.role } : u
        ));
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    setIsLoading(true);
    try {
      // Call backend API to update user status
      await roleService.updateUserStatus(userId, newStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de l'utilisateur a été changé en "${newStatus}".`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour du statut',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsUserDialogOpen(false);
    }
  };

  // Handle user role management
  const handleOpenRoleDialog = async (userId) => {
    try {
      // Get the latest role from the backend
      const userRole = await roleService.getUserRole(userId);
      
      setSelectedUser(userId);
      setSelectedRole(userRole.role);
      setIsRoleDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la récupération du rôle utilisateur',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateUserRole = async () => {
    if (selectedUser && selectedRole) {
      setIsLoading(true);
      try {
        // Call backend API to update user role
        await roleService.assignRole(selectedUser, selectedRole);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser ? { ...user, role: selectedRole } : user
        ));
        
        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle de l'utilisateur a été mis à jour avec succès.`,
        });
      } catch (error) {
        console.error("Error updating user role:", error);
        toast({
          title: 'Erreur',
          description: 'Échec de la mise à jour du rôle',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsRoleDialogOpen(false);
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(lowerQuery) || 
      user.prenom?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery)
    );
  });
  // Get selected user details
  const userDetails = users.find(user => user.id === selectedUser);
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
          <div className="text-3xl font-bold">{analytics.users.total}</div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-muted-foreground">Nouveaux: {analytics.users.new}</span>
            <span className="text-sm text-green-600">{analytics.users.growth}</span>
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
          <div className="text-3xl font-bold">{analytics.posts.total}</div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-muted-foreground">Aujourd'hui: {analytics.posts.today}</span>
            <span className="text-sm text-green-600">{analytics.posts.growth}</span>
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
          <div className="text-3xl font-bold">{analytics.events.total}</div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-muted-foreground">À venir: {analytics.events.upcoming}</span>
            <span className="text-sm text-green-600">{analytics.events.growth}</span>
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
          <div className="text-3xl font-bold">{analytics.clubs.total}</div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-muted-foreground">Actifs: {analytics.clubs.active}</span>
            <span className="text-sm text-green-600">{analytics.clubs.growth}</span>
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
          <Activity className="mr-2 h-4 w-4" /> Clubs
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Consultez et gérez les comptes utilisateurs
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-1" />
              )}
              Actualiser
            </Button>
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
              
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Chargement des utilisateurs...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-medium mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez une autre recherche.
                  </p>
                </div>
              ) : (
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
                            {user.firstName?.split(' ').map((n) => n?.[0]).join('') || '??'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName || 'Sans nom'}</div>
                          <div className="text-xs text-muted-foreground">@{user.firstName + " "+ user.lastName|| 'anonyme'}</div>
                        </div>
                      </div>
                      <div className="text-sm truncate">{user.email || 'Email non défini'}</div>
                      <div className="text-sm">{getRoleBadge(user.role || 'user')}</div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'ACTIF' ? 'bg-green-100 text-green-800' :
                          user.status === 'BLOQUÉ' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status || 'Inconnu'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredUsers.length} sur {users.length} utilisateurs
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      
      {/* Clubs Tab - Updated with nested tabs */}
      <TabsContent value="clubs" className="space-y-4 mt-6 animate-fade-in">
        <Tabs defaultValue="all-clubs">
          <TabsList className="w-full">
            <TabsTrigger value="all-clubs" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" /> Clubs Actifs
            </TabsTrigger>
            <TabsTrigger value="club-requests" className="flex items-center">
              <ShieldAlert className="mr-2 h-4 w-4" /> Demandes de Clubs
            </TabsTrigger>
          </TabsList>
          
          {/* All Clubs Tab */}
          <TabsContent value="all-clubs" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Gestion des clubs</CardTitle>
                  <CardDescription>
                    Consultez et gérez les clubs existants
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchPendingClubs}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Filter className="h-4 w-4 mr-1" />
                  )}
                  Actualiser
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      type="text"
                      placeholder="Rechercher un club..."
                      className="pl-10 pr-4 py-2"
                      value={clubSearchQuery}
                      onChange={(e) => setClubSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                    <div>Club</div>
                    <div>Catégorie</div>
                    <div>Membres</div>
                    <div>Statut</div>
                    <div>Actions</div>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Chargement des clubs...</p>
                    </div>
                  ) : filteredClubs.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-medium mb-2">Aucun club trouvé</h3>
                      <p className="text-muted-foreground">
                        Essayez une autre recherche.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredClubs.map((club) => (
                        <div 
                          key={club.id} 
                          className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                              {club.avatar ? (
                                <img 
                                  src={club.avatar} 
                                  alt={club.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Activity size={18} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{club.name}</div>
                              <div className="text-xs text-muted-foreground">Créé le {new Date(club.createdAt || club.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            {club.category ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {club.category}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Non définie</span>
                            )}
                          </div>
                          <div className="text-sm">{club.memberCount || club.members || 0} membres</div>
                          <div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              club.etat === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              club.etat === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {club.etat || 'ACTIVE'}
                            </span>
                          </div>
                          <div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClub(club.id)}
                              >
                                <Edit size={14} className="mr-1" /> Modifier
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewClubDetails(club.id)}
                              >
                                <Eye size={14} className="mr-1" /> Détails
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {filteredClubs.length} sur {allClubs.length} clubs
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Club Requests Tab */}
          <TabsContent value="club-requests" className="mt-4">
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
                              {club.avatar ? (
                                <img 
                                  src={club.avatar} 
                                  alt={club.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Activity size={18} />
                              )}
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
                  {userDetails.firstName?.split(' ').map(n => n?.[0]).join('') || '??'}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-lg">{userDetails.firstName|| 'Sans nom'}</h3>
                <p className="text-muted-foreground">@{userDetails.firstName + " " + userDetails.lastName || 'anonyme'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{userDetails.email || 'Non défini'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rôle</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>{getRoleBadge(userDetails.role || 'user')}</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenRoleDialog(userDetails.id)}
                      disabled={isLoading}
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
                      userDetails.status === 'ACTIF' ? 'bg-green-100 text-green-800' :
                      userDetails.status === 'BLOQUE' ? 'bg-red-100 text-red-800' :
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
                  
                  {userDetails.status === 'ACTIF' ? (
                    <Button 
                      variant="outline"
                      className="justify-start text-amber-600"
                      onClick={() => handleUpdateUserStatus(userDetails.id, 'SUSPENDU')}
                    >
                      <ShieldAlert size={16} className="mr-2" /> Suspendre l'utilisateur
                    </Button>
                  ) : userDetails.status === 'SUSPENDU' ? (
                    <Button 
                      variant="outline"
                      className="justify-start text-green-600"
                      onClick={() => handleUpdateUserStatus(userDetails.id, 'ACTIF')}
                    >
                      <CheckCircle size={16} className="mr-2" /> Réactiver l'utilisateur
                    </Button>
                  ) : null}
                  
                  <Button 
                    variant="outline"
                    className="justify-start text-destructive"
                    onClick={() => handleUpdateUserStatus(userDetails.id, 'BLOQUÉ')}
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
              {selectedRole === 'ROLE_ADMIN' && "Accès complet à toutes les fonctionnalités d'administration."}
              {selectedRole === 'ROLE_MODERATOR' && "Peut modérer le contenu et gérer les utilisateurs."}
              {selectedRole === 'ROLE_PROFESSOR' && "Enseignant avec accès à des fonctionnalités spécifiques."}
              {selectedRole === 'ROLE_ETUDIANT' && "Utilisateur standard avec accès aux fonctionnalités de base."}
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
        
        {selectedClub && (
          <div className="py-4">
            <div className="relative w-full h-48 rounded-lg bg-muted mb-16 overflow-hidden">
              <img 
                src={selectedClub.coverImage} 
                alt={selectedClub.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={selectedClub.avatar} 
                    alt={selectedClub.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold">{selectedClub.name}</h2>
              <div className="flex items-center mt-1 mb-4">
                <span className="text-sm text-muted-foreground">
                  Proposé par: {selectedClub.requestedBy} • {new Date(selectedClub.date).toLocaleDateString()}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                  {selectedClub.members} membres potentiels
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {selectedClub.description}
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
          {/* /*{selectedClub && (
            <>
              <Button 
                variant="destructive"
                onClick={() => {
                  handleRejectClub(selectedClub.id);
                  setIsClubDetailDialogOpen(false);
                }}
              >
                <XCircle size={16} className="mr-2" /> Refuser
              </Button>
              <Button 
                onClick={() => {
                  handleApproveClub(selectedClub.id);
                  setIsClubDetailDialogOpen(false);
                }}
              >
                <CheckCircle size={16} className="mr-2" /> Approuver
              </Button>
            </>
          )}*/ }
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={isEditClubDialogOpen} onOpenChange={setIsEditClubDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modifier le club</DialogTitle>
      <DialogDescription>
        Mettez à jour les informations du club
      </DialogDescription>
    </DialogHeader>
    
    {selectedClub && (
      <div className="py-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom du club</label>
            <Input 
              value={editClubData.name} 
              onChange={(e) => setEditClubData({...editClubData, name: e.target.value})}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={editClubData.description}
              onChange={(e) => setEditClubData({...editClubData, description: e.target.value})}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              rows={4}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Catégorie</label>
            <Select 
              value={editClubData.category} 
              onValueChange={(value) => setEditClubData({...editClubData, category: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPORT">Sport</SelectItem>
                <SelectItem value="CULTURE">Culture</SelectItem>
                <SelectItem value="INFORMATIQUE">Informatique</SelectItem>
                <SelectItem value="SCIENCE">Science</SelectItem>
                <SelectItem value="AUTRE">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Statut</label>
            <Select 
              value={editClubData.etat} 
              onValueChange={(value) => setEditClubData({...editClubData, etat: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="BLOCKED">Bloqué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )}
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsEditClubDialogOpen(false)}>Annuler</Button>
      <Button onClick={handleSaveClubChanges} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Check size={16} className="mr-1" />
        )}
        Enregistrer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  </div>
);
};

export default AdminPage;