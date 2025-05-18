import React, { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { clubService } from '@/services/clubService';
import { PostsService } from '@/services/postService';
import { EventsService } from '@/services/eventService';
import { eventsClubsService} from '@/services/EventClubServices';
import { categoryService } from '@/services/categoryService';
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
  Check,
  MoreHorizontal,
  Plus,
  Club,
  AlertTriangle,
  AlertCircle, // Used in other parts of the admin page
  X,
  Upload,
  User,
  Blocks,
  Folder,
  FolderPlus,
  FolderEdit
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

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// Dropdown menu components are used in other parts of the admin page
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import ClubsList from '@/components/clubs/ClubsList';

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
    case 'ROLE_MODERATEUR':
      return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Modérateur</span>;
    case 'ROLE_PROFESSEUR':
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center"><GraduationCap size={12} className="mr-1" />Professeur</span>;
    case 'ROLE_ETUDIANT':
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"><BookOpen size={12} className="mr-1" />Étudiant</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Utilisateur</span>;
  }
};

const initialPosts = [
  {
    id: "1",
    author: "julien_m",
    date: "2025-05-15T10:30:00",
    content: "Notre nouveau site web est enfin en ligne ! Merci à toute l'équipe pour leur travail.",
    reported: false
  },
  {
    id: "2",
    author: "sophie_d",
    date: "2025-05-14T16:45:00",
    content: "La réunion de demain est reportée à 14h. Merci de mettre à jour vos agendas.",
    reported: false
  },
  {
    id: "3",
    author: "marc_p",
    date: "2025-05-13T09:15:00",
    content: "J'ai partagé des informations privées par erreur. Je suis vraiment désolé pour cette maladresse.",
    reported: true,
    reportedBy: "admin_user",
    reason: "Contenu inapproprié"
  },
  {
    id: "4",
    author: "laure_t",
    date: "2025-05-12T13:20:00",
    content: "Consultez ce lien pour des offres exclusives: bit.ly/suspicious-link",
    reported: true,
    reportedBy: "julien_m",
    reason: "Lien suspect"
  },
  {
    id: "5",
    author: "admin",
    date: "2025-05-16T11:20:00",
    content: "Bienvenue sur notre plateforme ! N'hésitez pas à partager vos idées dans le respect des règles de la communauté.",
    reported: false
  }
];

const AdminPage = () => {
  // State to track if there was a critical error
  const [hasCriticalError, setHasCriticalError] = useState(false);
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
  const [allEventsClub, setAllEventsClub] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  const [allClubs, setAllClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const { toast } = useToast();

  const [editClubData, setEditClubData] = useState({
    nom: '',
    description: '',
    categoryId: '',
    etat: 'ACTIVE'
  });
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Category management state
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [newCategory, setNewCategory] = useState({ nom: '' });
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);



  useEffect(() => {
    // Set a default tab to ensure something is displayed
    try {
      console.log("Starting initial data load");
      setIsLoading(true);

      // First try to fetch categories and clubs since they're related
      Promise.all([
        fetchCategories().catch(e => {
          console.error("Error fetching categories:", e);
          return [];
        }),
        fetchAllClubs().catch(e => {
          console.error("Error fetching all clubs:", e);
          return [];
        })
      ]).then(() => {
        // Then fetch remaining data
        Promise.all([
          fetchUsers().catch(e => {
            console.error("Error fetching users:", e);
            return [];
          }),
          fetchRoles().catch(e => {
            console.error("Error fetching roles:", e);
            return [];
          }),
          fetchPendingClubs().catch(e => {
            console.error("Error fetching pending clubs:", e);
            return [];
          }),
          fetchPosts().catch(e => {
            console.error("Error fetching posts:", e);
            return [];
          }),
          fetchEvents().catch(e => {
            console.error("Error fetching events:", e);
            return [];
          }),
          fetchEventsClubs().catch(e => {
            console.error("Error fetching event clubs:", e);
            return [];
          })
        ]).finally(() => {
          setIsLoading(false);
        });
      });
    } catch (error) {
      console.error("Critical error in initial load:", error);
      setHasCriticalError(true);
      setIsLoading(false); // Ensure loading state is cleared even if there's an error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 const [activeTab, setActiveTab] = useState("moderation");
  const [posts, setPosts] = useState(initialPosts);
     const [newPost, setNewPost] = useState({
    content: '',
    image: null,
    imagePreview: null
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [notification, setNotification] = useState(null);

  const currentAdmin = "admin";

  // Filter reported posts

  // Handle approving a reported post
  const handleApprovePost = async (postId) => {
    try {
      // In a real implementation, you would have an API endpoint for approving posts
      // For now, we'll just update the local state
      setReportedPosts(reportedPosts.filter(post => post.id !== postId));

      setNotification({
        type: "success",
        message: "Publication approuvée avec succès"
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error approving post:", error);
      setNotification({
        type: "error",
        message: "Erreur lors de l'approbation de la publication"
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle removing a post
  const handleRemovePost = async (postId) => {
    try {
      // Delete the post using the service
      await PostsService.deletePost(postId);

      // Update local state
      setReportedPosts(reportedPosts.filter(post => post.id !== postId));
      setAllPosts(allPosts.filter(post => post.id !== postId));

      setNotification({
        type: "success",
        message: "Publication supprimée avec succès"
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error removing post:", error);
      setNotification({
        type: "error",
        message: "Erreur lors de la suppression de la publication"
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle editing a post


  const handleAddPost = async () => {
    if (!newPost.content.trim()) {
      showNotification('Le contenu de la publication ne peut pas être vide', 'error');
      return;
    }

    try {
      // First, upload the image if there is one
      let imageUrl = null;
      if (newPost.image) {
        const uploadResult = await PostsService.uploadImage(newPost.image);
        imageUrl = uploadResult.url;
      }

      // Create the post using the service
      const createdPost = await PostsService.createPost({
        title: 'Post from Admin', // Default title
        content: newPost.content,
        category: 'General', // Default category
        imageUrl: imageUrl
      });

      // Add the new post to the list
      setAllPosts(prevPosts => [createdPost, ...prevPosts]);

      // Reset form and close it
      setNewPost({ content: '', image: null, imagePreview: null });
      setIsAdding(false);
      showNotification('Publication créée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

    const deletePost = async (postId: number) => {
    try {
      // Delete the post using the service
      await PostsService.deletePost(postId);

      // Remove the post from the list
      setAllPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      showNotification('Publication supprimée avec succès', 'success');
    } catch (error) {
      showNotification('Erreur: ' + error.message, 'error');
    }
  };

  // Save edited post
  const saveEditedPost = () => {
    setPosts(posts.map(post =>
      post.id === editingPost.id ? editingPost : post
    ));
    setEditingPost(null);
    setNotification({
      type: "success",
      message: "Publication modifiée avec succès"
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Cancel editing
  const handleEditPost = (post) => {
    setEditingPost({
      ...post,
      // If you need to handle image editing, make sure to properly set up image preview
    });
  };

  const cancelEditing = () => {
    setEditingPost(null);
  };

  // Handle adding a new post
  // const handleAddPost = () => {
  //   if (newPost.content.trim() === "") return;

  //   const currentDate = new Date().toISOString();
  //   setPosts([
  //     {
  //       id: Date.now().toString(),
  //       author: currentAdmin,
  //       date: currentDate,
  //       content: newPost.content,
  //       reported: false
  //     },
  //     ...posts
  //   ]);

  //   setNewPost({ author: currentAdmin,image:"", imagePreview:"", content: "" });
  //   setIsAdding(false);
  //   setNotification({
  //     type: "success",
  //     message: "Publication ajoutée avec succès"
  //   });
  //   setTimeout(() => setNotification(null), 3000);
  // };



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
        fetchEvents(),
        fetchEventsClubs(),
        fetchCategories()
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log("Starting category fetch...");
      setIsLoading(true);

      // Make the API call directly without timeout to ensure we get a proper response
      const response = await categoryService.getAllCategories();
      console.log("Category API response:", response);

      // Check if we have valid data
      if (Array.isArray(response)) {
        console.log("Fetched categories successfully:", response);
        setCategories(response);

        // Show success message when manually refreshing
        if (categories.length > 0) {
          toast({
            title: 'Catégories mises à jour',
            description: `${response.length} catégories chargées avec succès.`,
          });
        }

        return response;
      } else {
        console.error("Invalid categories data format:", response);
        toast({
          title: 'Format de données incorrect',
          description: 'Les données des catégories ne sont pas dans le format attendu.',
          variant: 'destructive',
        });
        return [];
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des catégories. Veuillez réessayer.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClub = async (clubId) => {
    try {
      console.log("Editing club with ID:", clubId);
      setIsLoading(true);

      // Make sure categories are loaded before opening the edit dialog
      if (categories.length === 0) {
        console.log("Categories not loaded, fetching them first");
        await fetchCategories();
      }

      // Fetch the club details
      const club = await clubService.getClubById(clubId);
      console.log("Fetched club details for editing:", club);

      // Set the selected club
      setSelectedClub(club);

      // Make sure we have a valid status
      let clubStatus = club.etat;
      if (!clubStatus || !['ACCEPTER', 'REFUSER', 'EN_ATTENTE'].includes(clubStatus)) {
        console.log("Invalid or missing status, defaulting to EN_ATTENTE");
        clubStatus = 'EN_ATTENTE';
      }

      // Set the edit form data
      setEditClubData({
        nom: club.nom || '',
        description: club.description || '',
        categoryId: club.categoryId ? club.categoryId.toString() : '',
        etat: clubStatus
      });

      console.log("Edit form data set:", {
        nom: club.nom || '',
        description: club.description || '',
        categoryId: club.categoryId ? club.categoryId.toString() : '',
        etat: clubStatus
      });

      // Open the edit dialog
      setIsEditClubDialogOpen(true);
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des détails du club. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating club status (accept/reject/pending)
  const handleUpdateClubStatus = async (clubId, newStatus) => {
    try {
      setIsLoading(true);
      console.log("Updating club with ID:", clubId, "to status:", newStatus);

      let updatedClub;

      // Use the appropriate endpoint based on the status
      if (newStatus === 'ACCEPTER') {
        updatedClub = await clubService.acceptClub(clubId);
        console.log("Club accepted successfully:", updatedClub);
      } else if (newStatus === 'REFUSER') {
        updatedClub = await clubService.rejectClub(clubId);
        console.log("Club rejected successfully:", updatedClub);
      } else if (newStatus === 'EN_ATTENTE') {
        // For EN_ATTENTE status, use the updateClubStatus method
        updatedClub = await clubService.updateClubStatus(clubId, newStatus);
        console.log("Club set to pending successfully:", updatedClub);
      } else {
        // For other status updates, use the generic update method
        updatedClub = await clubService.updateClub(clubId, { etat: newStatus });
        console.log("Club status updated successfully:", updatedClub);
      }

      // Update local state
      setAllClubs(allClubs.map(club =>
        club.id === clubId ? { ...club, etat: newStatus } : club
      ));

      setFilteredClubs(filteredClubs.map(club =>
        club.id === clubId ? { ...club, etat: newStatus } : club
      ));

      // Update selectedClub if it's the one being modified
      if (selectedClub && selectedClub.id === clubId) {
        setSelectedClub({
          ...selectedClub,
          etat: newStatus
        });
      }

      // Update club requests based on the new status
      if (newStatus === 'ACCEPTER' || newStatus === 'REFUSER') {
        // Remove from pending requests if accepted or rejected
        setClubRequests(prevRequests => prevRequests.filter(club => club.id !== clubId));
      } else if (newStatus === 'EN_ATTENTE') {
        // Add to pending requests if set to pending
        const club = allClubs.find(c => c.id === clubId);
        if (club) {
          setClubRequests(prevRequests => {
            // Only add if not already in the list
            if (!prevRequests.some(c => c.id === clubId)) {
              return [...prevRequests, { ...club, etat: newStatus }];
            }
            return prevRequests;
          });
        }
      }

      toast({
        title: 'Succès',
        description: newStatus === 'ACCEPTER' ? 'Le club a été accepté avec succès.' :
                     newStatus === 'REFUSER' ? 'Le club a été refusé avec succès.' :
                     newStatus === 'EN_ATTENTE' ? 'Le club a été mis en attente avec succès.' :
                     'Le statut du club a été mis à jour avec succès.',
      });

      // Refresh data to ensure we have the latest information
      fetchAllClubs();
      fetchPendingClubs();

      // If we're in the club detail dialog, refresh the club details
      if (selectedClub && selectedClub.id === clubId && isClubDetailDialogOpen) {
        const refreshedClub = await clubService.getClubById(clubId);
        setSelectedClub(refreshedClub);
      }
    } catch (error) {
      console.error(`Error updating club status to ${newStatus}:`, error);
      toast({
        title: 'Erreur',
        description: `Échec de la mise à jour du statut du club. Veuillez réessayer.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up state for club deletion confirmation dialog
  const [isDeleteClubDialogOpen, setIsDeleteClubDialogOpen] = useState(false);
  const [clubToDeleteId, setClubToDeleteId] = useState<number | null>(null);

  // Handle showing the delete confirmation dialog
  const handleDeleteClubConfirmation = (clubId) => {
    setClubToDeleteId(clubId);
    setIsDeleteClubDialogOpen(true);
  };

  // Handle deleting a club
  const handleDeleteClub = async () => {
    if (!clubToDeleteId) return;

    setIsLoading(true);
    try {
      console.log("Deleting club with ID:", clubToDeleteId);

      // Delete the club in the backend
      await clubService.deleteClub(clubToDeleteId);
      console.log("Club deleted successfully");

      // Update local state
      setAllClubs(prevClubs => prevClubs.filter(club => club.id !== clubToDeleteId));
      setFilteredClubs(prevFilteredClubs => prevFilteredClubs.filter(club => club.id !== clubToDeleteId));

      // If the club detail dialog is open and showing this club, close it
      if (selectedClub && selectedClub.id === clubToDeleteId) {
        setIsClubDetailDialogOpen(false);
      }

      toast({
        title: 'Succès',
        description: 'Le club a été supprimé avec succès.',
      });

      // Refresh data to ensure we have the latest information
      fetchAllClubs();
    } catch (error) {
      console.error("Error deleting club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression du club. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setClubToDeleteId(null);
      setIsDeleteClubDialogOpen(false);
    }
  };

  const handleSaveClubChanges = async () => {
    if (!selectedClub) return;

    // Validate form data
    if (!editClubData.nom.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du club ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    if (!editClubData.categoryId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une catégorie',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Saving club changes for club ID:", selectedClub.id);
      console.log("Edit club data:", editClubData);

      // Convert categoryId to number before sending to backend
      const updatedClubData = {
        ...editClubData,
        categoryId: editClubData.categoryId ? parseInt(editClubData.categoryId) : undefined
      };

      console.log("Sending updated club data to backend:", updatedClubData);

      // Check if the status has changed
      const statusChanged = selectedClub.etat !== updatedClubData.etat;
      console.log("Status changed:", statusChanged, "Old:", selectedClub.etat, "New:", updatedClubData.etat);

      let updatedClub;

      // If only the status has changed, use updateClubStatus
      if (statusChanged && updatedClubData.etat) {
        console.log("Using updateClubStatus for status change to:", updatedClubData.etat);

        // First update other club data without the status
        const { etat, ...otherData } = updatedClubData;
        if (Object.keys(otherData).length > 0) {
          await clubService.updateClub(selectedClub.id, otherData);
        }

        // Then update the status separately using the specialized method
        updatedClub = await clubService.updateClubStatus(selectedClub.id, updatedClubData.etat);
        console.log("Club status updated successfully:", updatedClub);
      } else {
        // Update the club in the backend using the regular method
        updatedClub = await clubService.updateClub(selectedClub.id, updatedClubData);
        console.log("Club updated successfully:", updatedClub);
      }

      // Update local data
      setAllClubs(prevClubs => prevClubs.map(club =>
        club.id === selectedClub.id
          ? { ...club, ...updatedClubData }
          : club
      ));

      // Update filtered clubs
      setFilteredClubs(prevClubs => prevClubs.map(club =>
        club.id === selectedClub.id
          ? { ...club, ...updatedClubData }
          : club
      ));

      // Update the selectedClub state to reflect changes
      setSelectedClub(prev => ({
        ...prev,
        ...updatedClubData
      }));

      toast({
        title: 'Succès',
        description: 'Les informations du club ont été mises à jour avec succès.',
      });

      setIsEditClubDialogOpen(false);

      // Refresh data to ensure we have the latest information
      fetchAllClubs();

      // If the status was changed, refresh pending clubs
      if (statusChanged) {
        fetchPendingClubs();
      }
    } catch (error) {
      console.error("Error updating club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour du club. Veuillez réessayer.',
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
      console.log("Fetching pending clubs...");
      const pendingClubs = await clubService.getPendingClubs();
      console.log("Pending clubs:", pendingClubs);

      // Filter clubs with EN_ATTENTE status
      const filteredPendingClubs = pendingClubs.filter(club => club.etat === 'EN_ATTENTE');
      console.log("Filtered pending clubs:", filteredPendingClubs);

      setClubRequests(filteredPendingClubs);

      // Fetch all clubs for analytics
      const allClubs = await clubService.getAllClubs();

      setAnalytics(prev => ({
        ...prev,
        clubs: {
          total: allClubs.length,
          active: allClubs.filter(club => club.etat === 'ACCEPTER').length,
          members: allClubs.reduce((total, club) => total + (club.membres || 0), 0),
          growth: '' // Removed percentage
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

  // Update categories display when clubs change
  useEffect(() => {
    // This ensures the category usage counts are updated when clubs change
    console.log("Clubs updated, refreshing category display");

    // Force a re-render of the categories component using functional update
    setCategories(currentCategories => {
      if (currentCategories.length > 0) {
        return [...currentCategories];
      }
      return currentCategories;
    });
  }, [allClubs]);

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
          growth: '' // Removed percentage
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
      console.log("Fetching regular events...");
      const events = await EventsService.getAllEvents();
      console.log("Regular events fetched:", events);

      // Map the events to a common format
      const formattedEvents = events.map(event => ({
        id: event.id,
        name: event.titre || "Sans titre",
        description: event.description || "",
        location: event.lieu || "Non défini",
        eventDate: event.dateDebut || new Date().toISOString(),
        date: event.dateDebut || new Date().toISOString(),
        createdAt: event.dateDebut || new Date().toISOString(),
        status: event.status || "UPCOMING",
        image: event.image || null,
        participantCount: event.nbParticipants || 0,
        participants: event.nbParticipants || 0,
        organizer: "Administration",
        eventType: "Standard"
      }));

      setAllEvents(formattedEvents);
      setFilteredEvents(formattedEvents);

      // Now fetch club events
      await fetchEventsClubs();

      // Update analytics with combined events
      updateEventAnalytics(formattedEvents, allEventsClub);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des événements',
        variant: 'destructive',
      });

      // Try to fetch club events even if regular events fail
      try {
        await fetchEventsClubs();
      } catch (clubError) {
        console.error("Error fetching club events after regular events failed:", clubError);
      }
    }
  };

  const fetchEventsClubs = async () => {
    try {
      console.log("Fetching club events...");
      const eventsClubs = await eventsClubsService.getAllEventsClubs();
      console.log("Club events fetched:", eventsClubs);

      // Map the events to a common format
      const formattedClubEvents = eventsClubs.map(event => ({
        id: event.id,
        name: event.titre || "Sans titre",
        description: event.description || "",
        location: event.lieu || "Non défini",
        eventDate: event.dateDebut || new Date().toISOString(),
        date: event.dateDebut || new Date().toISOString(),
        createdAt: event.dateDebut || new Date().toISOString(),
        status: event.status || "UPCOMING",
        image: event.image || null,
        participantCount: event.nbParticipants || 0,
        participants: event.nbParticipants || 0,
        organizer: event.nomClub || "Club",
        eventType: "Club"
      }));

      setAllEventsClub(formattedClubEvents);
      setFilteredEventsClubs(formattedClubEvents);

      // Update analytics with combined events if we have regular events
      if (allEvents.length > 0) {
        updateEventAnalytics(allEvents, formattedClubEvents);
      }
    } catch (error) {
      console.error("Error fetching club events:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des événements de clubs',
        variant: 'destructive',
      });
    }
  };

  // Update analytics with combined events data
  const updateEventAnalytics = (regularEvents: any[], clubEvents: any[]) => {
    const today = new Date();
    const allEventsArray = [...regularEvents, ...clubEvents];

    // Count events with AVENIR status
    const upcomingEvents = allEventsArray.filter(event =>
      event.status === 'AVENIR'
    );

    const totalParticipants = allEventsArray.reduce((sum, event) =>
      sum + (event.participantCount || 0), 0
    );

    setAnalytics(prev => ({
      ...prev,
      events: {
        total: allEventsArray.length,
        upcoming: upcomingEvents.length,
        participants: totalParticipants,
        growth: '' // Removed percentage
      }
    }));
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();

      // Fetch roles for all users
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Get the user role from the backend
            const userRole = await roleService.getUserRole(user.id);
            return { ...user, role: userRole.role };
          } catch (error) {
            console.error(`Error fetching role for user ${user.id}:`, error);
            return user; // Return user without role if there's an error
          }
        })
      );

      setUsers(usersWithRoles);

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
          growth: '' // Removed percentage
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

  // Removed unused calculateGrowth function

  // Helper function to get category name from category ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return category.nom;
    }

    // Fallback mapping if categories aren't loaded yet
    const categoryMap = {
      1: 'Sport',
      2: 'Culture',
      3: 'Informatique',
      4: 'Science',
      5: 'Autre'
    };

    return categoryMap[categoryId] || 'Catégorie ' + categoryId;
  };

  // Category management functions
  const handleAddCategory = async () => {
    if (!newCategory.nom.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la catégorie ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Adding new category with data:", newCategory);

      // Create the category with the backend field name 'nom'
      const createdCategory = await categoryService.createCategory(newCategory);
      console.log("Created category response:", createdCategory);

      if (createdCategory && createdCategory.id) {
        // Add the new category to the list
        setCategories(prevCategories => [...prevCategories, createdCategory]);

        // Reset the form
        setNewCategory({ nom: '' });
        setIsAddCategoryDialogOpen(false);

        toast({
          title: 'Catégorie ajoutée',
          description: `La catégorie "${createdCategory.nom}" a été ajoutée avec succès.`,
        });

        // Refresh categories to ensure we have the latest data
        fetchCategories();
      } else {
        throw new Error("La réponse du serveur ne contient pas les données attendues");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'ajout de la catégorie. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: CategoryDto) => {
    setEditingCategory(category);
    setIsEditCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!editingCategory.nom.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la catégorie ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating category with ID:", editingCategory.id, "and data:", { nom: editingCategory.nom });

      // Update the category with the backend field name 'nom'
      const updatedCategory = await categoryService.updateCategory(
        editingCategory.id,
        { nom: editingCategory.nom }
      );

      console.log("Updated category response:", updatedCategory);

      if (updatedCategory && updatedCategory.id) {
        // Update the category in the list
        setCategories(prevCategories => prevCategories.map(cat =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        ));

        setIsEditCategoryDialogOpen(false);

        toast({
          title: 'Catégorie mise à jour',
          description: `La catégorie "${updatedCategory.nom}" a été mise à jour avec succès.`,
        });

        // Refresh categories to ensure we have the latest data
        fetchCategories();
      } else {
        throw new Error("La réponse du serveur ne contient pas les données attendues");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de la catégorie. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up state for category deletion confirmation dialog
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
  const [categoryDeleteWarning, setCategoryDeleteWarning] = useState<string | null>(null);

  const handleDeleteCategoryConfirmation = (categoryId: number) => {
    // Check if any clubs are using this category
    const clubsUsingCategory = allClubs.filter(club => club.categoryId === categoryId);

    // Set warning message if clubs are using this category
    if (clubsUsingCategory.length > 0) {
      setCategoryDeleteWarning(`Attention: ${clubsUsingCategory.length} clubs utilisent cette catégorie. La suppression pourrait affecter ces clubs.`);
    } else {
      setCategoryDeleteWarning(null);
    }

    // Set the category ID to delete and open the confirmation dialog
    setCategoryToDeleteId(categoryId);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDeleteId) return;

    setIsLoading(true);
    try {
      console.log("Deleting category with ID:", categoryToDeleteId);

      // Delete the category
      await categoryService.deleteCategory(categoryToDeleteId);
      console.log("Category deleted successfully");

      // Update the categories list
      setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryToDeleteId));

      toast({
        title: 'Succès',
        description: 'La catégorie a été supprimée avec succès.',
      });

      // Refresh categories to ensure we have the latest data
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression de la catégorie. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setCategoryToDeleteId(null);
      setIsDeleteCategoryDialogOpen(false);
    }
  };

  // Handle post moderation
  // const handleApprovePost = async (postId) => {
  //   try {
  //     // In a real implementation, you might have an endpoint for this
  //     // For now, we'll just remove it from the reported posts
  //     setReportedPosts(reportedPosts.filter(post => post.id !== postId));

  //     toast({
  //       title: 'Post approuvé',
  //       description: 'Le post a été approuvé et reste visible.',
  //     });
  //   } catch (error) {
  //     console.error("Error approving post:", error);
  //     toast({
  //       title: 'Erreur',
  //       description: 'Échec de l\'approbation du post',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // const handleRemovePost = async (postId) => {
  //   try {
  //     await PostsService.deletePost(postId);

  //     // Update state to remove the post
  //     setReportedPosts(reportedPosts.filter(post => post.id !== postId));
  //     setAllPosts(allPosts.filter(post => post.id !== postId));

  //     toast({
  //       title: 'Post supprimé',
  //       description: 'Le post a été supprimé avec succès.',
  //       variant: 'destructive'
  //     });
  //   } catch (error) {
  //     console.error("Error removing post:", error);
  //     toast({
  //       title: 'Erreur',
  //       description: 'Échec de la suppression du post',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // Handle club approval - now using handleUpdateClubStatus with 'ACCEPTER'
  const handleApproveClub = async (clubId) => {
    try {
      setIsLoading(true);
      console.log("Approving club with ID:", clubId);

      // Use the handleUpdateClubStatus function with 'ACCEPTER' status
      await handleUpdateClubStatus(clubId, 'ACCEPTER');

      console.log("Club approved successfully");
    } catch (error) {
      console.error("Error approving club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de l\'approbation du club. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle club rejection - now using handleUpdateClubStatus with 'REFUSER'
  const handleRejectClub = async (clubId) => {
    try {
      setIsLoading(true);
      console.log("Rejecting club with ID:", clubId);

      // Use the handleUpdateClubStatus function with 'REFUSER' status
      await handleUpdateClubStatus(clubId, 'REFUSER');

      console.log("Club rejected successfully");
    } catch (error) {
      console.error("Error rejecting club:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du rejet du club. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle club details view
  const handleViewClubDetails = async (clubId) => {
    try {
      console.log("Fetching details for club ID:", clubId);
      setIsLoading(true);

      // Fetch the latest club data before showing details
      const clubDetail = await clubService.getClubById(clubId);
      console.log("Fetched club details:", clubDetail);

      // Make sure we have the latest data
      setSelectedClub(clubDetail);
      setIsClubDetailDialogOpen(true);
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des détails du club',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user management
  const handleViewUser = async (userId: number) => {
    console.log("Viewing user details for ID:", userId);
    setSelectedUser(userId);
    setIsUserDialogOpen(true);

    try {
      // Fetch the current role for this user from the backend
      const userRole = await roleService.getUserRole(userId);
      console.log("User role from backend:", userRole);

      const user = users.find(u => u.id === userId);
      console.log("Found user:", user);

      // Update the user object with the latest role information
      if (user && userRole) {
        const updatedUsers = users.map(u =>
          u.id === userId ? { ...u, role: userRole.role } : u
        );
        console.log("Updating user with role:", userRole.role);
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Even if there's an error, we still want to show the dialog
    }
  };

const fetchUserProfile = async (userId: number) => {
  try {
    // Utilisez le service utilisateur existant pour récupérer les détails complets
    const userDetails = await userService.getUserById(userId);
    console.log("User details:", userDetails);

    // Fetch the user's role from the backend
    try {
      const userRole = await roleService.getUserRole(userId);
      console.log("User role from backend for profile:", userRole);

      // Update the user details with the role from the backend
      userDetails.role = userRole.role;

      // Also update the user in the users array
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: userRole.role } : user
      );
      setUsers(updatedUsers);
    } catch (roleError) {
      console.error("Error fetching role for profile:", roleError);
      // Continue with existing role if there's an error
    }

    // Combiner les données de base de l'utilisateur avec ses statistiques
    return {
      ...userDetails
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    toast({
      title: 'Erreur',
      description: 'Impossible de charger le profil utilisateur',
      variant: 'destructive',
    });
    return null;
  }
};

// Fonction pour ouvrir le dialogue de profil utilisateur
const handleOpenProfileDialog = async (userId: number) => {
  try {
    setIsLoading(true);

    // Récupérer les données complètes du profil utilisateur
    const profileData = await fetchUserProfile(userId);

    // Stocker les données du profil dans l'état
    setUserProfile(profileData);

    // Ouvrir le dialogue de profil
    setIsProfileDialogOpen(true);
  } catch (error) {
    console.error("Erreur lors de l'ouverture du profil:", error);
    toast({
      title: 'Erreur',
      description: 'Impossible d\'ouvrir le profil utilisateur',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
const DeleteUser = async (userId: number): Promise<void> => {
  try {
    // Call the API client's deleteUser method
    const result = await userService.deleteUser(userId);
    console.log(`User with ID ${userId} successfully deleted`);
    return result;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
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
  const handleOpenRoleDialog = async (userId: number) => {
    try {
      console.log("Opening role dialog for user:", userId);

      // Get the latest role from the backend
      const userRole = await roleService.getUserRole(userId);
      console.log("User role from backend:", userRole);

      // Update the user in the users array with the latest role
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, role: userRole.role } : user
      );
      setUsers(updatedUsers);

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
      console.log(`Updating user ${selectedUser} role to ${selectedRole}`);

      try {
        // Call backend API to update user role
        await roleService.assignRole(selectedUser, selectedRole);
        console.log("Role updated successfully in backend");

        // Update local state
        const updatedUsers = users.map(user =>
          user.id === selectedUser ? { ...user, role: selectedRole } : user
        );
        setUsers(updatedUsers);
        console.log("Updated users state with new role");

        toast({
          title: 'Rôle mis à jour',
          description: `Le rôle de l'utilisateur a été mis à jour avec succès.`,
        });

        // Close the dialog
        setIsRoleDialogOpen(false);

        // If the user details dialog is open, update the selected user
        if (isUserDialogOpen) {
          const updatedUser = updatedUsers.find(u => u.id === selectedUser);
          if (updatedUser) {
            setSelectedUser(updatedUser.id);
          }
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        toast({
          title: 'Erreur',
          description: 'Échec de la mise à jour du rôle',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter users based on search query and exclude admin users
  const filteredUsers = users.filter(user => {
    // Exclude admin users from the list
    if (user.role === 'ROLE_ADMIN') return false;

    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(lowerQuery) ||
      user.lastName?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery)
    );
  });

  // Find the admin user
  const adminUser = users.find(user => user.role === 'ROLE_ADMIN');
  // Get selected user details
  const userDetails = users.find(user => user.id === selectedUser);


  const [eventSearchQuery, setEventSearchQuery] = useState('');
const [filteredEvents, setFilteredEvents] = useState([]);
const [filteredEventsClubs, setFilteredEventsClubs] = useState([]);
// Removed eventRequests state as it's no longer needed
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [editingEvent, setEditingEvent] = useState(null);
const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [eventToDeleteId, setEventToDeleteId] = useState(null);
const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
const [newEventData, setNewEventData] = useState({
  name: '',
  description: '',
  date: '',
  location: '',
  status: 'AVENIR'
});

// No longer using sample event requests





  // We'll use fetchData() instead which already calls fetchEvents()

  // Update analytics whenever events change
  useEffect(() => {
    if (allEvents.length > 0 || allEventsClub.length > 0) {
      updateEventAnalytics(allEvents, allEventsClub);
    }
  }, [allEvents, allEventsClub]);

  // Filter events when search query changes
  useEffect(() => {
    if (eventSearchQuery.trim() === '') {
      setFilteredEvents(allEvents);
      setFilteredEventsClubs(allEventsClub);
    } else {
      const lowercaseQuery = eventSearchQuery.toLowerCase();

      // Filter regular events
      const filteredRegularEvents = allEvents.filter(event =>
        event.name.toLowerCase().includes(lowercaseQuery) ||
        (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
        (event.description && event.description.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredEvents(filteredRegularEvents);

      // Filter club events
      const filteredClubEvents = allEventsClub.filter(event =>
        event.name.toLowerCase().includes(lowercaseQuery) ||
        (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
        (event.description && event.description.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredEventsClubs(filteredClubEvents);
    }
  }, [eventSearchQuery, allEvents, allEventsClub]);




/**************************************************event codes and requests**************************************************/
  const fetchPendingEvents = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would have an API endpoint for pending events
      // For now, we'll just refresh the events
      await fetchEvents();

      toast({
        title: "Données actualisées",
        description: "La liste des événements a été mise à jour.",
      });
    } catch (error) {
      console.error("Error fetching pending events:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des événements en attente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEventDetails = (id: number) => {
    console.log("Viewing event details for ID:", id);

    // Find the event in both regular events and club events
    const regularEvent = allEvents.find(e => e.id === id);
    const clubEvent = allEventsClub.find(e => e.id === id);

    const event = regularEvent || clubEvent;

    if (event) {
      console.log("Found event:", event);
      setSelectedEvent(event);
      setIsDetailsDialogOpen(true);
    } else {
      console.error("Event not found with ID:", id);
      toast({
        title: "Erreur",
        description: "Impossible de trouver les détails de cet événement.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditEventDialog = (event: any) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleSaveEventChanges = async () => {
    if (!editingEvent) return;

    setIsLoading(true);
    console.log("Saving event changes for:", editingEvent);

    try {
      // Determine if this is a regular event or a club event
      const isClubEvent = editingEvent.eventType === "Club";

      // Format the date properly
      const dateTime = editingEvent.eventDate instanceof Date
        ? editingEvent.eventDate.toISOString()
        : new Date(editingEvent.eventDate).toISOString();

      // Prepare the update data with the correct field names
      const updateData = {
        titre: editingEvent.name,
        description: editingEvent.description,
        lieu: editingEvent.location,
        dateDebut: dateTime,
        dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), // 1 hour after start
        status: editingEvent.status || "AVENIR"
      };

      console.log("Update data:", updateData);

      // Update the event using the appropriate service
      // Use admin ID (1) as the creator ID for admin operations
      const adminId = 1;

      let updatedEvent: any;
      if (isClubEvent) {
        updatedEvent = await eventsClubsService.updateEvent(editingEvent.id, updateData, adminId);
      } else {
        updatedEvent = await EventsService.updateEvent(editingEvent.id, updateData, adminId);
      }

      console.log("Updated event response:", updatedEvent);

      // Format the updated event to match our UI format
      const formattedUpdatedEvent = {
        ...editingEvent,
        name: updatedEvent.titre || editingEvent.name,
        description: updatedEvent.description || editingEvent.description,
        location: updatedEvent.lieu || editingEvent.location,
        eventDate: updatedEvent.dateDebut || editingEvent.eventDate,
        date: updatedEvent.dateDebut || editingEvent.date,
        status: updatedEvent.status || editingEvent.status
      };

      // Update the appropriate local state
      if (isClubEvent) {
        const updatedClubEvents = allEventsClub.map(event =>
          event.id === editingEvent.id ? formattedUpdatedEvent : event
        );
        setAllEventsClub(updatedClubEvents);
        setFilteredEventsClubs(updatedClubEvents.filter(event => {
          if (eventSearchQuery.trim() === '') return true;

          const lowercaseQuery = eventSearchQuery.toLowerCase();
          return event.name.toLowerCase().includes(lowercaseQuery) ||
                (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
                (event.description && event.description.toLowerCase().includes(lowercaseQuery));
        }));
      } else {
        const updatedEvents = allEvents.map(event =>
          event.id === editingEvent.id ? formattedUpdatedEvent : event
        );
        setAllEvents(updatedEvents);
        setFilteredEvents(updatedEvents.filter(event => {
          if (eventSearchQuery.trim() === '') return true;

          const lowercaseQuery = eventSearchQuery.toLowerCase();
          return event.name.toLowerCase().includes(lowercaseQuery) ||
                (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
                (event.description && event.description.toLowerCase().includes(lowercaseQuery));
        }));
      }

      setIsEditDialogOpen(false);

      toast({
        title: "Événement modifié",
        description: `Les modifications pour ${editingEvent.name} ont été enregistrées.`,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused event approval function

  // Removed unused event rejection function












// Fonction pour préparer la suppression d'un événement (ouvre la boîte de dialogue de confirmation)
const handleDeleteEventConfirmation = (eventId: number): void => {
  console.log("Preparing to delete event:", eventId);

  // Check if this is a regular event or a club event
  const isRegularEvent = allEvents.some(e => e.id === eventId);
  const isClubEvent = allEventsClub.some(e => e.id === eventId);

  console.log("Is regular event:", isRegularEvent);
  console.log("Is club event:", isClubEvent);

  setEventToDeleteId(eventId);
  setIsDeleteDialogOpen(true);
};

// Note: This function is no longer used directly
// The delete functionality is now handled in the AlertDialogAction onClick handler

// Fonction pour annuler un événement sans le supprimer
const handleCancelEvent = async (eventId: number): Promise<void> => {
  setIsLoading(true);
  console.log("Cancelling event:", eventId);

  try {
    // Trouver l'événement à annuler
    const eventToCancel = allEvents.find(e => e.id === eventId);
    const clubEventToCancel = allEventsClub.find(e => e.id === eventId);

    // Determine if this is a club event or regular event
    const isClubEvent = !!clubEventToCancel;
    const eventToUpdate = eventToCancel || clubEventToCancel;

    if (!eventToUpdate) {
      throw new Error("Événement non trouvé");
    }

    console.log("Event to cancel:", eventToUpdate);

    // Prepare the update data with the correct field names
    const updateData = {
      titre: eventToUpdate.name,
      description: eventToUpdate.description,
      lieu: eventToUpdate.location,
      dateDebut: eventToUpdate.eventDate,
      dateFin: eventToUpdate.eventDate, // Keep the same end date
      status: "INACTIVE"
    };

    console.log("Update data for cancellation:", updateData);

    // Mettre à jour le statut de l'événement avec le service approprié
    // Use admin ID (1) as the creator ID for admin operations
    const adminId = 1;

    let updatedEvent: any;
    if (isClubEvent) {
      updatedEvent = await eventsClubsService.updateEvent(eventId, updateData, adminId);
    } else {
      updatedEvent = await EventsService.updateEvent(eventId, updateData, adminId);
    }

    console.log("Updated event after cancellation:", updatedEvent);

    // Format the updated event to match our UI format
    const formattedUpdatedEvent = {
      ...eventToUpdate,
      name: updatedEvent.titre || eventToUpdate.name,
      description: updatedEvent.description || eventToUpdate.description,
      location: updatedEvent.lieu || eventToUpdate.location,
      eventDate: updatedEvent.dateDebut || eventToUpdate.eventDate,
      date: updatedEvent.dateDebut || eventToUpdate.date,
      status: "INACTIVE"
    };

    // Mettre à jour l'état local approprié
    if (isClubEvent) {
      const updatedClubEvents = allEventsClub.map(event =>
        event.id === eventId ? formattedUpdatedEvent : event
      );
      setAllEventsClub(updatedClubEvents);
      setFilteredEventsClubs(updatedClubEvents.filter(event => {
        if (eventSearchQuery.trim() === '') return true;

        const lowercaseQuery = eventSearchQuery.toLowerCase();
        return event.name.toLowerCase().includes(lowercaseQuery) ||
              (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
              (event.description && event.description.toLowerCase().includes(lowercaseQuery));
      }));
    } else {
      const updatedEvents = allEvents.map(event =>
        event.id === eventId ? formattedUpdatedEvent : event
      );
      setAllEvents(updatedEvents);
      setFilteredEvents(updatedEvents.filter(event => {
        if (eventSearchQuery.trim() === '') return true;

        const lowercaseQuery = eventSearchQuery.toLowerCase();
        return event.name.toLowerCase().includes(lowercaseQuery) ||
              (event.location && event.location.toLowerCase().includes(lowercaseQuery)) ||
              (event.description && event.description.toLowerCase().includes(lowercaseQuery));
      }));
    }

    // Update the selected event if it's currently being viewed
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(formattedUpdatedEvent);
    }

    toast({
      title: "Succès",
      description: "L'événement a été annulé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de l'événement:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'annulation de l'événement.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

// Fonction pour créer un nouvel événement
// This function is used in the "Nouvel événement" button onClick handler
const createEvent = async (eventData: { name: string; description: string; date: string; location: string; status: string }): Promise<void> => {
  setIsLoading(true);
  console.log("Creating new event:", eventData);

  try {
    // Format the date properly
    const dateTime = eventData.date ? new Date(eventData.date).toISOString() : new Date().toISOString();

    // Prepare the event data with the correct field names
    const createData = {
      titre: eventData.name,
      description: eventData.description,
      lieu: eventData.location,
      dateDebut: dateTime,
      dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), // 1 hour after start
      status: eventData.status || "AVENIR"
    };

    console.log("Create data:", createData);

    // Create the event using the service
    // Use admin ID (1) as the creator ID for admin operations
    const adminId = 1;

    const newEvent = await EventsService.createEvent(
      adminId,
      createData
    );

    console.log("New event response:", newEvent);

    // Format the new event to match our UI format
    const formattedNewEvent = {
      id: newEvent.id,
      name: newEvent.titre || eventData.name,
      description: newEvent.description || eventData.description,
      location: newEvent.lieu || eventData.location,
      eventDate: newEvent.dateDebut || dateTime,
      date: newEvent.dateDebut || dateTime,
      createdAt: new Date().toISOString(),
      status: newEvent.status || eventData.status,
      image: newEvent.image || null,
      participantCount: 0,
      participants: 0,
      organizer: "Administration",
      eventType: "Université"
    };

    // Update the local state
    const updatedEvents = [formattedNewEvent, ...allEvents];
    setAllEvents(updatedEvents);
    setFilteredEvents(updatedEvents);

    setShowCreateEventDialog(false);
    setNewEventData({
      name: '',
      description: '',
      date: '',
      location: '',
      status: 'AVENIR'
    });

    toast({
      title: "Succès",
      description: "L'événement a été créé avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la création de l'événement.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};



/**********************************************end event  */

  // If there's a critical error, show a fallback UI
  if (hasCriticalError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-4">
            Une erreur s'est produite lors du chargement de la page d'administration. Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  // Show a loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Chargement en cours</h2>
        <p className="text-muted-foreground">
          Veuillez patienter pendant le chargement des données...
        </p>
      </div>
    );
  }

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
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">Cette semaine: {analytics.users.new}</span>
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
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">Signalées: {analytics.posts.reported}</span>
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
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">À venir: {analytics.events.upcoming}</span>
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
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">Actifs: {analytics.clubs.active}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Main Content Tabs */}
    <Tabs defaultValue="moderation">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="moderation" className="flex items-center">
          <Flag className="mr-2 h-4 w-4" /> Modération
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center">
          <Users className="mr-2 h-4 w-4" /> Utilisateurs
        </TabsTrigger>
        <TabsTrigger value="Events" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" /> Events
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center">
          <Folder className="mr-2 h-4 w-4" /> Catégories
        </TabsTrigger>
        <TabsTrigger value="clubs" className="flex items-center">
          <Activity className="mr-2 h-4 w-4" /> Clubs
        </TabsTrigger>
      </TabsList>

      {/* Moderation Tab Content */}
      <TabsContent value="moderation" className="space-y-4 mt-6 animate-fade-in">
        <Tabs defaultValue="reported-posts" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reported-posts">Publications signalées</TabsTrigger>
            <TabsTrigger value="all-posts">Toutes les publications</TabsTrigger>
          </TabsList>

          {/* Reported Posts Content */}
          <TabsContent value="reported-posts" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Publications signalées</CardTitle>
                <CardDescription>
                  Examinez et moderez les publications signalées par les utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Notification */}
                {notification && (
                  <div className={`mb-4 p-3 rounded-lg ${notification.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    <div className="flex items-center">
                      {notification.type === "error" ?
                        <AlertTriangle size={18} className="mr-2" /> :
                        <CheckCircle size={18} className="mr-2" />
                      }
                      {notification.message}
                    </div>
                  </div>
                )}

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

          {/* All Posts Content */}
          <TabsContent value="all-posts" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Toutes les publications</CardTitle>
                  <CardDescription>
                    Gérez toutes les publications du site
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Nouvelle publication
                </Button>
              </CardHeader>

              <CardContent>
  {/* Notification */}
  {notification && (
    <div className={`mb-4 p-3 rounded-lg ${notification.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
      <div className="flex items-center">
        {notification.type === "error" ?
          <AlertTriangle size={18} className="mr-2" /> :
          <CheckCircle size={18} className="mr-2" />
        }
        {notification.message}
      </div>
    </div>
  )}

  {/* Add New Post Form */}
  {isAdding && (
    <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="font-medium mb-2">Créer une nouvelle publication</h3>
      <div className="mb-3">
        <Textarea
          className="w-full"
          rows={3}
          placeholder="Contenu de la publication..."
          value={newPost.content}
          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
        />
      </div>

      {/* Image Upload Section */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Ajouter une image</label>
        <div className="flex items-center">
          <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Upload size={16} className="mr-2" />
            <span>Choisir une image</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNewPost({
                    ...newPost,
                    image: e.target.files[0],
                    imagePreview: URL.createObjectURL(e.target.files[0])
                  });
                }
              }}
            />
          </label>
          {newPost.imagePreview && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-red-500"
              onClick={() => setNewPost({...newPost, image: null, imagePreview: null})}
            >
              <X size={16} className="mr-1" /> Supprimer
            </Button>
          )}
        </div>
        {newPost.imagePreview && (
          <div className="mt-2">
            <img
              src={newPost.imagePreview}
              alt="Aperçu"
              className="max-h-40 rounded-md"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          onClick={() => {
            setIsAdding(false);
            setNewPost({ content: '', image: null, imagePreview: null });
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleAddPost}
        >
          Publier
        </Button>
      </div>
    </div>
  )}

  {/* All Posts List */}
  <div className="space-y-4">
    {allPosts.map((post) => (
      <div
        key={post.id}
        className={`p-4 border rounded-lg ${post.reported ? 'border-red-200 bg-red-50' : 'border-border bg-card'}`}
      >
        {editingPost && editingPost.id === post.id ? (
          // Edit Mode
          <div>
            <div className="mb-3">
              <Textarea
                className="w-full"
                rows={3}
                value={editingPost.content}
                onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
              />
            </div>
            {editingPost.image && (
              <div className="mb-3">
                <img
                  src={typeof editingPost.image === 'string' ? editingPost.image : URL.createObjectURL(editingPost.image)}
                  alt="Image de la publication"
                  className="max-h-40 rounded-md"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-red-500"
                  onClick={() => setEditingPost({...editingPost, image: null})}
                >
                  <X size={16} className="mr-1" /> Supprimer l'image
                </Button>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={cancelEditing}
              >
                <X size={16} className="mr-1" /> Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={saveEditedPost}
              >
                <Check size={16} className="mr-1" /> Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium">@{post.author}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
              {post.reported && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {post.reason}
                </span>
              )}
            </div>
            <p className="text-foreground mb-3">{post.content}</p>
            {post.image && (
              <div className="mb-3">
                <img
                  src={post.image}
                  alt="Image de la publication"
                  className="max-w-full max-h-80 rounded-md"
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              {post.author === currentAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPost(post)}
                >
                  <Edit size={16} className="mr-1" /> Modifier
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePost(post.id)}
              >
                <Trash size={16} className="mr-1" /> Supprimer
              </Button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
            {/* Admin Profile Section */}
            {adminUser && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden">
                    {adminUser.image ? (
                      <img
                        src={adminUser.image}
                        alt={adminUser.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShieldAlert size={24} className="text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">{adminUser.firstName || 'Administrateur'} {adminUser.lastName || ''}</h3>
                    <p className="text-muted-foreground">{adminUser.email}</p>
                    <div className="mt-2">
                      {getRoleBadge('ROLE_ADMIN')}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        // Fetch the latest role before opening the profile
                        try {
                          const userRole = await roleService.getUserRole(adminUser.id);
                          const updatedUsers = users.map(user =>
                            user.id === adminUser.id ? { ...user, role: userRole.role } : user
                          );
                          setUsers(updatedUsers);
                        } catch (error) {
                          console.error("Error fetching admin role:", error);
                        }
                        handleOpenProfileDialog(adminUser.id);
                      }}
                    >
                      <User size={14} className="mr-1" /> Voir profil
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                      onClick={async () => {
                        // Fetch the latest role before viewing the user
                        try {
                          const userRole = await roleService.getUserRole(user.id);
                          const updatedUsers = users.map(u =>
                            u.id === user.id ? { ...u, role: userRole.role } : u
                          );
                          setUsers(updatedUsers);
                        } catch (error) {
                          console.error(`Error fetching role for user ${user.id}:`, error);
                        }
                        handleViewUser(user.id);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user.firstName?.split(' ').map((n: string) => n?.[0]).join('') || '??'}
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
              Affichage de {filteredUsers.length} sur {users.length - (adminUser ? 1 : 0)} utilisateurs (hors administrateurs)
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
<TabsContent value="Events" className="space-y-4 mt-6 animate-fade-in">
  <Tabs defaultValue="all-events">
    <TabsList className="w-full">
      <TabsTrigger value="all-events" className="flex items-center">
        <Calendar className="mr-2 h-4 w-4" /> Événements
      </TabsTrigger>
      <TabsTrigger value="all-events_Clubs" className="flex items-center">
        <Calendar className="mr-2 h-4 w-4" /> Événements clubs
      </TabsTrigger>
      {/* Removed event requests tab */}
    </TabsList>

    {/* All Events Tab */}
    <TabsContent value="all-events" className="mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Gestion des événements</CardTitle>
            <CardDescription>
              Consultez et gérez les événements existants
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingEvents}
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
                placeholder="Rechercher un événement..."
                className="pl-10 pr-4 py-2"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="hidden md:grid md:grid-cols-6 gap-2 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-2">Événement</div>
              <div>Date</div>
              <div>Lieu</div>
              <div>Statut</div>
              <div>Actions</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Chargement des événements...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium mb-2">Aucun événement universitaire trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez une autre recherche.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {/* Display only university events */}
                {filteredEvents.map((event) => (
                  <div
                    key={`${event.eventType}-${event.id}`}
                    className="flex flex-col md:grid md:grid-cols-6 gap-2 p-3 items-start md:items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Event name and image - always visible */}
                    <div className="w-full md:col-span-2 flex items-center space-x-2">
                      <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Calendar size={16} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate" title={event.titre || event.name}>{event.titre || event.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Université
                        </div>
                        <div className="flex md:hidden mt-1 space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(event.dateDebut || event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate">
                            {event.lieu || event.location || "Non défini"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date - hidden on mobile */}
                    <div className="hidden md:block text-xs">
                      {new Date(event.dateDebut || event.eventDate).toLocaleDateString()}
                    </div>

                    {/* Location - hidden on mobile */}
                    <div className="hidden md:block text-xs truncate" title={event.lieu || event.location || "Non défini"}>
                      {event.lieu || event.location || "Non défini"}
                    </div>



                    {/* Status and action on mobile */}
                    <div className="flex w-full justify-between items-center md:hidden mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'AVENIR' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        event.status === 'TERMINE' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'AVENIR' ? 'À venir' :
                         event.status === 'ACTIVE' ? 'En cours' :
                         event.status === 'TERMINE' ? 'Terminé' :
                         event.status === 'INACTIVE' ? 'Annulé' :
                         'À venir'}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEventDetails(event.id)}
                        className="text-xs p-2"
                      >
                        <Eye size={14} className="mr-1" /> Voir
                      </Button>
                    </div>

                    {/* Status - desktop only */}
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'AVENIR' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        event.status === 'TERMINE' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'AVENIR' ? 'À venir' :
                         event.status === 'ACTIVE' ? 'En cours' :
                         event.status === 'TERMINE' ? 'Terminé' :
                         event.status === 'INACTIVE' ? 'Annulé' :
                         'À venir'}
                      </span>
                    </div>

                    {/* View Profile Button - desktop only */}
                    <div className="hidden md:block text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEventDetails(event.id)}
                        className="text-xs p-2"
                      >
                        <Eye size={14} className="mr-1" /> Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredEvents.length + filteredEventsClubs.length} sur {allEvents.length + allEventsClub.length} événements
          </div>
          <Button
            onClick={() => setShowCreateEventDialog(true)}
            size="sm"
          >
            <Plus size={14} className="mr-1" /> Nouvel événement
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
    <TabsContent value="all-events_Clubs" className="mt-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Gestion des événements</CardTitle>
            <CardDescription>
              Consultez et gérez les événements existants
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingEvents}
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
                placeholder="Rechercher un événement..."
                className="pl-10 pr-4 py-2"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="hidden md:grid md:grid-cols-6 gap-2 p-4 bg-muted/50 font-medium text-sm">
              <div className="col-span-2">Événement</div>
              <div>Date</div>
              <div>Lieu</div>
              <div>Statut</div>
              <div>Actions</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Chargement des événements...</p>
              </div>
            ) : filteredEventsClubs.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl font-medium mb-2">Aucun événement de club trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez une autre recherche.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredEventsClubs.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col md:grid md:grid-cols-6 gap-2 p-3 items-start md:items-center hover:bg-muted/30 transition-colors"
                  >
                    {/* Event name and image - always visible */}
                    <div className="w-full md:col-span-2 flex items-center space-x-2">
                      <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Calendar size={16} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate" title={event.titre || event.name}>{event.titre || event.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Club: {event.nomClub || event.organizer || "Non défini"}
                        </div>
                        <div className="flex md:hidden mt-1 space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(event.dateDebut || event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate">
                            {event.lieu || event.location || "Non défini"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date - hidden on mobile */}
                    <div className="hidden md:block text-xs">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>

                    {/* Location - hidden on mobile */}
                    <div className="hidden md:block text-xs truncate" title={event.location || "Non défini"}>
                      {event.location || "Non défini"}
                    </div>



                    {/* Status and action on mobile */}
                    <div className="flex w-full justify-between items-center md:hidden mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'AVENIR' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        event.status === 'TERMINE' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'AVENIR' ? 'À venir' :
                         event.status === 'ACTIVE' ? 'En cours' :
                         event.status === 'TERMINE' ? 'Terminé' :
                         event.status === 'INACTIVE' ? 'Annulé' :
                         'À venir'}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEventDetails(event.id)}
                        className="text-xs p-2"
                      >
                        <Eye size={14} className="mr-1" /> Voir
                      </Button>
                    </div>

                    {/* Status - desktop only */}
                    <div className="hidden md:block">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'AVENIR' ? 'bg-blue-100 text-blue-800' :
                        event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        event.status === 'TERMINE' ? 'bg-gray-100 text-gray-800' :
                        event.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === 'AVENIR' ? 'À venir' :
                         event.status === 'ACTIVE' ? 'En cours' :
                         event.status === 'TERMINE' ? 'Terminé' :
                         event.status === 'INACTIVE' ? 'Annulé' :
                         'À venir'}
                      </span>
                    </div>

                    {/* View Profile Button - desktop only */}
                    <div className="hidden md:block text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEventDetails(event.id)}
                        className="text-xs p-2"
                      >
                        <Eye size={14} className="mr-1" /> Voir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {filteredEventsClubs.length} sur {allEventsClub.length} événements de club
          </div>
        </CardFooter>
      </Card>
    </TabsContent>

    {/* Event Requests Tab removed */}
  </Tabs>

  {/* Edit Event Dialog */}
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Modifier l'événement</DialogTitle>
        <DialogDescription>
          Apportez des modifications aux détails de l'événement ci-dessous.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-name" className="text-right">
            Nom
          </Label>
          <Input
            id="event-name"
            className="col-span-3"
            value={editingEvent?.name || ""}
            onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-date" className="text-right">
            Date
          </Label>
          <Input
            id="event-date"
            type="datetime-local"
            className="col-span-3"
            value={editingEvent?.eventDate ? new Date(editingEvent.eventDate).toISOString().slice(0, 16) : ""}
            onChange={(e) => setEditingEvent({...editingEvent, eventDate: new Date(e.target.value)})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-location" className="text-right">
            Lieu
          </Label>
          <Input
            id="event-location"
            className="col-span-3"
            value={editingEvent?.location || ""}
            onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-status" className="text-right">
            Statut
          </Label>
          <Select
            value={editingEvent?.status || "AVENIR"}
            onValueChange={(value) => setEditingEvent({...editingEvent, status: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVENIR">À venir</SelectItem>
              <SelectItem value="ACTIVE">En cours</SelectItem>
              <SelectItem value="TERMINE">Terminé</SelectItem>
              <SelectItem value="INACTIVE">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="event-description" className="text-right">
            Description
          </Label>
          <Textarea
            id="event-description"
            className="col-span-3"
            rows={4}
            value={editingEvent?.description || ""}
            onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
          Annuler
        </Button>
        <Button onClick={handleSaveEventChanges}>
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Event Details Dialog */}
  <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto w-[95vw]">
      {selectedEvent && (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                {selectedEvent.image ? (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Calendar size={16} />
                )}
              </div>
              {selectedEvent.name}
            </DialogTitle>
            <DialogDescription>
              Informations détaillées sur l'événement
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Date</h4>
                <p>{new Date(selectedEvent.eventDate).toLocaleDateString()} à {new Date(selectedEvent.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Lieu</h4>
                <p>{selectedEvent.location || "Non défini"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Participants</h4>
                <p>{selectedEvent.participantCount || selectedEvent.participants || 0} participants</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Statut</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.status === 'AVENIR' ? 'bg-blue-100 text-blue-800' :
                  selectedEvent.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  selectedEvent.status === 'TERMINE' ? 'bg-gray-100 text-gray-800' :
                  selectedEvent.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedEvent.status === 'AVENIR' ? 'À venir' :
                   selectedEvent.status === 'ACTIVE' ? 'En cours' :
                   selectedEvent.status === 'TERMINE' ? 'Terminé' :
                   selectedEvent.status === 'INACTIVE' ? 'Annulé' :
                   'À venir'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Créé le</h4>
                <p>{new Date(selectedEvent.createdAt || selectedEvent.date).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Organisateur</h4>
                <p>{selectedEvent.organizer || selectedEvent.requestedBy || "Non défini"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Catégorie</h4>
                <p>{selectedEvent.category || "Non définie"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 text-muted-foreground">Type</h4>
                <p>{selectedEvent.eventType || "Standard"}</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
            <div className="border rounded-md p-3 bg-muted/30 max-h-40 overflow-y-auto">
              <p>{selectedEvent.description || "Aucune description disponible."}</p>
            </div>
          </div>

          {selectedEvent.participants > 0 && (
            <div className="py-2">
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Liste des participants</h4>
              <div className="border rounded-md p-3 bg-muted/30 max-h-40 overflow-y-auto">
                {/* Ici on simulerait une liste de participants, mais pour l'exemple on met un placeholder */}
                <p className="text-muted-foreground text-sm">Liste des participants non disponible.</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2">
              {selectedEvent.eventType !== "Club" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditEventDialog(selectedEvent)}
                >
                  <Edit size={16} className="mr-1" /> Modifier
                </Button>
              )}
              {selectedEvent.status !== 'TERMINE' && selectedEvent.status !== 'INACTIVE' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                >
                  <XCircle size={16} className="mr-1" /> Annuler l'événement
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleDeleteEventConfirmation(selectedEvent.id);
                }}
              >
                <Trash size={16} className="mr-1" /> Supprimer
              </Button>
            </div>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>

  {/* Delete Confirmation Dialog */}
  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
    <DialogContent className="sm:max-w-[425px] w-[95vw]">
      <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => setIsDeleteDialogOpen(false)}
        >
          Non
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            if (eventToDeleteId) {
              setIsLoading(true);
              console.log("Deleting event:", eventToDeleteId);

              // Check if this is a regular event or a club event
              const isRegularEvent = allEvents.some(e => e.id === eventToDeleteId);
              const isClubEvent = allEventsClub.some(e => e.id === eventToDeleteId);

              console.log("Is regular event:", isRegularEvent);
              console.log("Is club event:", isClubEvent);

              // Use admin ID (1) as the creator ID for admin operations
              const adminId = 1;

              try {
                // Delete the event using the appropriate service
                if (isClubEvent) {
                  await eventsClubsService.deleteEvent(eventToDeleteId, adminId);

                  // Update club events state
                  setAllEventsClub(allEventsClub.filter(event => event.id !== eventToDeleteId));
                  setFilteredEventsClubs(filteredEventsClubs.filter(event => event.id !== eventToDeleteId));
                } else {
                  await EventsService.deleteEvent(eventToDeleteId, adminId);

                  // Update regular events state
                  setAllEvents(allEvents.filter(event => event.id !== eventToDeleteId));
                  setFilteredEvents(filteredEvents.filter(event => event.id !== eventToDeleteId));
                }

                toast({
                  title: "Succès",
                  description: "L'événement a été supprimé avec succès.",
                });
              } catch (error) {
                console.error("Erreur lors de la suppression de l'événement:", error);
                toast({
                  title: "Erreur",
                  description: "Une erreur est survenue lors de la suppression de l'événement.",
                  variant: "destructive",
                });
              } finally {
                setIsLoading(false);
                setEventToDeleteId(null);
                setIsDeleteDialogOpen(false);
              }
            }
          }}
        >
          Oui
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  {/* Create Event Dialog */}
  <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Créer un nouvel événement</DialogTitle>
        <DialogDescription>
          Remplissez les détails pour créer un nouvel événement.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-event-name" className="text-right">
            Nom
          </Label>
          <Input
            id="new-event-name"
            className="col-span-3"
            value={newEventData.name}
            onChange={(e) => setNewEventData({...newEventData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-event-date" className="text-right">
            Date
          </Label>
          <Input
            id="new-event-date"
            type="datetime-local"
            className="col-span-3"
            value={newEventData.date}
            onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-event-location" className="text-right">
            Lieu
          </Label>
          <Input
            id="new-event-location"
            className="col-span-3"
            value={newEventData.location}
            onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-event-status" className="text-right">
            Statut
          </Label>
          <Select
            value={newEventData.status}
            onValueChange={(value) => setNewEventData({...newEventData, status: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVENIR">À venir</SelectItem>
              <SelectItem value="ACTIVE">En cours</SelectItem>
              <SelectItem value="TERMINE">Terminé</SelectItem>
              <SelectItem value="INACTIVE">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="new-event-description" className="text-right">
            Description
          </Label>
          <Textarea
            id="new-event-description"
            className="col-span-3"
            rows={4}
            value={newEventData.description}
            onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setShowCreateEventDialog(false)}>
          Annuler
        </Button>
        <Button onClick={() => createEvent(newEventData)}>
          Créer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
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
                  <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm">
                    <div className="col-span-2">Club</div>
                    <div>Catégorie</div>
                    <div>Statut</div>
                    <div>Membres</div>
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
                          className="flex flex-col md:grid md:grid-cols-6 gap-2 p-4 items-start md:items-center hover:bg-muted/30 transition-colors"
                        >
                          {/* Club name and image - always visible */}
                          <div className="w-full md:col-span-2 flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                              {club.profilePhoto ? (
                                <img
                                  src={club.profilePhoto}
                                  alt={club.nom}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Activity size={18} />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-medium truncate">{club.nom}</div>
                              <div className="text-xs text-muted-foreground">
                                Créé le {new Date(club.dateCreation || new Date()).toLocaleDateString()}
                              </div>

                              {/* Mobile-only status and category */}
                              <div className="flex md:hidden mt-1 space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  club.etat === 'ACCEPTER' ? 'bg-green-100 text-green-800' :
                                  club.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                                  club.etat === 'REFUSER' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {club.etat === 'ACCEPTER' ? 'Accepté' :
                                   club.etat === 'EN_ATTENTE' ? 'En attente' :
                                   club.etat === 'REFUSER' ? 'Refusé' :
                                   club.etat || 'Inconnu'}
                                </span>
                                {club.categoryId && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {getCategoryName(club.categoryId)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Category - hidden on mobile */}
                          <div className="hidden md:block text-sm">
                            {club.categoryId ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {getCategoryName(club.categoryId)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Non définie</span>
                            )}
                          </div>

                          {/* Status - hidden on mobile */}
                          <div className="hidden md:block text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              club.etat === 'ACCEPTER' ? 'bg-green-100 text-green-800' :
                              club.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                              club.etat === 'REFUSER' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {club.etat === 'ACCEPTER' ? 'Accepté' :
                               club.etat === 'EN_ATTENTE' ? 'En attente' :
                               club.etat === 'REFUSER' ? 'Refusé' :
                               club.etat || 'Inconnu'}
                            </span>
                          </div>

                          {/* Members - hidden on mobile */}
                          <div className="hidden md:block text-sm">{club.membres || 0} membres</div>

                          {/* Actions - different on mobile and desktop */}
                          <div className="flex w-full md:w-auto justify-between md:justify-end items-center mt-2 md:mt-0">
                            {/* Mobile status is shown above */}

                            {/* Simple View button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full md:w-auto"
                              onClick={() => handleViewClubDetails(club.id)}
                            >
                              <Eye size={14} className="mr-1" /> Voir
                            </Button>
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Chargement des demandes de club...</p>
                  </div>
                ) : clubRequests.length > 0 ? (
                  <div className="space-y-4">
                    {clubRequests.map((club) => (
                      <div
                        key={club.id}
                        className="p-4 border border-border rounded-lg bg-muted/30"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex-shrink-0 mr-3 flex items-center justify-center overflow-hidden">
                              {club.profilePhoto ? (
                                <img
                                  src={club.profilePhoto}
                                  alt={club.nom}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Activity size={18} />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-lg">{club.nom}</h3>
                              <span className="text-sm text-muted-foreground">
                                Demande du {new Date(club.dateCreation || new Date()).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {club.membres || 0} membres potentiels
                            </span>
                            {club.categoryId && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {getCategoryName(club.categoryId)}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-foreground mb-3">{club.description}</p>

                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            Proposé par: {club.createdBy || 'Utilisateur'}
                          </span>
                          <div className="flex flex-wrap gap-2">
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

      {/* Categories Tab */}
      <TabsContent value="categories" className="space-y-4 mt-6 animate-fade-in">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Gestion des catégories</CardTitle>
              <CardDescription>
                Gérez les catégories utilisées pour classer les clubs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Refreshing categories...");
                  fetchCategories();
                }}
              >
                <Loader2 className="h-4 w-4 mr-1" /> Actualiser
              </Button>
              <Button
                onClick={() => setIsAddCategoryDialogOpen(true)}
                className="flex items-center"
              >
                <FolderPlus size={16} className="mr-1" /> Nouvelle catégorie
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Chargement des catégories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <Folder size={48} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-2">Aucune catégorie trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par ajouter une nouvelle catégorie.
                </p>
                <Button onClick={() => setIsAddCategoryDialogOpen(true)}>
                  <FolderPlus size={16} className="mr-1" /> Ajouter une catégorie
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <div>Nom</div>
                  <div>Clubs associés</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                    >
                      <div className="font-medium">{category.nom}</div>
                      <div className="text-sm">
                        {allClubs.filter(club => club.categoryId === category.id).length} clubs
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <FolderEdit size={14} className="mr-1" /> Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategoryConfirmation(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash size={14} className="mr-1" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    {/* Add Category Dialog */}
    <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une catégorie</DialogTitle>
          <DialogDescription>
            Créez une nouvelle catégorie pour les clubs
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category-name">Nom de la catégorie</Label>
            <Input
              id="category-name"
              value={newCategory.nom}
              onChange={(e) => setNewCategory({ nom: e.target.value })}
              placeholder="Ex: Sport, Culture, Informatique..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleAddCategory} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>Ajouter</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Edit Category Dialog */}
    <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la catégorie</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la catégorie
          </DialogDescription>
        </DialogHeader>
        {editingCategory && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-category-name">Nom de la catégorie</Label>
              <Input
                id="edit-category-name"
                value={editingCategory.nom}
                onChange={(e) => setEditingCategory({ ...editingCategory, nom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Cette catégorie est utilisée par {allClubs.filter(club => club.categoryId === editingCategory.id).length} clubs.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdateCategory} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>Enregistrer</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Category Confirmation Dialog */}
    <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
      <DialogContent className="sm:max-w-[425px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        {categoryDeleteWarning && (
          <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <AlertTriangle size={16} className="inline-block mr-2" />
            {categoryDeleteWarning}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsDeleteCategoryDialogOpen(false)}
          >
            Non
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCategory}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>Oui</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

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
                  {userDetails.firstName?.split(' ').map((n: string) => n?.[0]).join('') || '??'}
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
              {userDetails.createdTimes  ? new Date(userDetails.craetedtimes).toLocaleDateString() : 'Non défini'}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Actions</h4>
                <div className="flex flex-col space-y-2">
                <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleOpenProfileDialog(userDetails.id)}
              >
                <User size={16} className="mr-2" /> Voir le profil complet
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
                  {userDetails.status === 'BLOQUE' ? (
                  <Button
                    variant="outline"
                    className="justify-start text-green-700"
                    onClick={() => handleUpdateUserStatus(userDetails.id, 'ACTIF')}
                  >
                    <Blocks size={16} className="mr-2" /> Debloquer l'utilisateur
                  </Button>) : userDetails.status === 'ACTIF' ? (
                  <Button
                    variant="outline"
                    className="justify-start text-destructive"
                    onClick={() => handleUpdateUserStatus(userDetails.id, 'BLOQUE')}
                  >
                    <Blocks size={16} className="mr-2" /> Bloquer l'utilisateur
                  </Button>
                ) : null}
                 <Button
                    variant="outline"
                    className="justify-start text-red-900"
                    onClick={() => DeleteUser(userDetails.id)}
                  >
                    <Trash size={16} className="mr-2" /> Delete l'utilisateur
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
    {/* User Profile Dialog */}
    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Profil utilisateur</DialogTitle>
      <DialogDescription>
        Consultez les informations détaillées du profil
      </DialogDescription>
    </DialogHeader>

    {userProfile && (
      <div className="py-4">
        {/* En-tête du profil */}
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mr-4">
             <img
              src={userProfile.image }
              alt={`${userProfile.firstName} ${userProfile.lastName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-xl">{userProfile.firstName || 'Sans nom'} {userProfile.lastName || ''}</h3>
            <p className="text-muted-foreground">@{userProfile.firstName || userProfile.firstName?.toLowerCase() || 'anonyme'}</p>
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Informations personnelles</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile.email || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{userProfile.phoneNumber || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de naissance</p>
                <p className="font-medium">{userProfile.dateOfBirth  ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localisation</p>
                <p className="font-medium">{userProfile.address || 'Non défini'}</p>
              </div>
            </div>
          </div>

          {/* Statut et rôle */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Compte</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <div className="mt-1">{getRoleBadge(userProfile.role || 'user')}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.status === 'ACTIF' ? 'bg-green-100 text-green-800' :
                    userProfile.status === 'BLOQUE' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userProfile.status}
                  </span>
                </p>
              </div>

            </div>
          </div>

          {/* Activité */}
          {/* <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Activité</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Publications</p>
                <p className="text-lg font-semibold">{userProfile.stats?.posts || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Commentaires</p>
                <p className="text-lg font-semibold">{userProfile.stats?.comments || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Contributions</p>
                <p className="text-lg font-semibold">{userProfile.stats?.contributions || 0}</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    )}

    <DialogFooter className="flex justify-between items-center">
      <div>
        <Button
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => {
            setIsProfileDialogOpen(false);
            handleOpenRoleDialog(userProfile.id);
          }}
        >
          <UserCog size={14} className="mr-1" /> Modifier le rôle
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsProfileDialogOpen(false);
            // Ajoutez ici l'ouverture d'un autre dialogue d'édition si nécessaire
          }}
        >
          <Edit size={14} className="mr-1" /> Modifier le profil
        </Button> */}
      </div>
      <Button onClick={() => setIsProfileDialogOpen(false)}>Fermer</Button>
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
              <SelectItem value="ROLE_ADMIN">
                <div className="flex items-center">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Administrateur
                </div>
              </SelectItem>
              <SelectItem value="ROLE_MODERATEUR">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  Modérateur
                </div>
              </SelectItem>
              <SelectItem value="ROLE_PROFESSEUR">
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Professeur
                </div>
              </SelectItem>
              <SelectItem value="ROLE_ETUDIANT">
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
              {selectedRole === 'ROLE_MODERATEUR' && "Peut modérer le contenu et gérer les utilisateurs."}
              {selectedRole === 'ROLE_PROFESSEUR' && "Enseignant avec accès à des fonctionnalités spécifiques."}
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
            Consultez les détails complets du club
          </DialogDescription>
        </DialogHeader>

        {selectedClub && (
          <div className="py-4">
            <div className="relative w-full h-48 rounded-lg bg-muted mb-16 overflow-hidden">
              {selectedClub.coverPhoto ? (
                <img
                  src={selectedClub.coverPhoto}
                  alt={selectedClub.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Activity size={48} className="text-primary/50" />
                </div>
              )}
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-white flex items-center justify-center overflow-hidden">
                  {selectedClub.profilePhoto ? (
                    <img
                      src={selectedClub.profilePhoto}
                      alt={selectedClub.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Activity size={24} className="text-primary" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold">{selectedClub.nom}</h2>
              <div className="flex flex-wrap items-center mt-1 mb-4 gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedClub.etat === 'ACCEPTER' ? 'bg-green-100 text-green-800' :
                  selectedClub.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                  selectedClub.etat === 'REFUSER' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedClub.etat === 'ACCEPTER' ? 'Accepté' :
                   selectedClub.etat === 'EN_ATTENTE' ? 'En attente' :
                   selectedClub.etat === 'REFUSER' ? 'Refusé' :
                   selectedClub.etat || 'Inconnu'}
                </span>

                {selectedClub.categoryId && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {getCategoryName(selectedClub.categoryId)}
                  </span>
                )}

                <span className="text-sm text-muted-foreground ml-auto">
                  Créé le {new Date(selectedClub.dateCreation || new Date()).toLocaleDateString()}
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
                  <h4 className="font-medium mb-2">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Membres:</span>
                      <span className="font-medium">{selectedClub.membres || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie:</span>
                      <span className="font-medium">
                        {selectedClub.categoryId ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {getCategoryName(selectedClub.categoryId)}
                          </span>
                        ) : (
                          'Non définie'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedClub.etat === 'ACCEPTER' ? 'bg-green-100 text-green-800' :
                        selectedClub.etat === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                        selectedClub.etat === 'REFUSER' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedClub.etat === 'ACCEPTER' ? 'Accepté' :
                         selectedClub.etat === 'EN_ATTENTE' ? 'En attente' :
                         selectedClub.etat === 'REFUSER' ? 'Refusé' :
                         selectedClub.etat || 'Inconnu'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">{selectedClub.id}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-3">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsClubDetailDialogOpen(false);
                        handleEditClub(selectedClub.id);
                      }}
                      className="flex items-center"
                    >
                      <Edit size={14} className="mr-1" /> Modifier
                    </Button>

                    {selectedClub.etat === 'EN_ATTENTE' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleUpdateClubStatus(selectedClub.id, 'ACCEPTER');
                          }}
                          className="flex items-center text-green-600"
                        >
                          <CheckCircle size={14} className="mr-1" /> Accepter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleUpdateClubStatus(selectedClub.id, 'REFUSER');
                          }}
                          className="flex items-center text-red-600"
                        >
                          <XCircle size={14} className="mr-1" /> Refuser
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = selectedClub.etat === 'ACCEPTER' ? 'REFUSER' : 'ACCEPTER';
                          handleUpdateClubStatus(selectedClub.id, newStatus);
                        }}
                        className={`flex items-center ${selectedClub.etat === 'ACCEPTER' ? 'text-yellow-600' : 'text-green-600'}`}
                      >
                        {selectedClub.etat === 'ACCEPTER' ? (
                          <>
                            <XCircle size={14} className="mr-1" /> Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="mr-1" /> Activer
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDeleteClubConfirmation(selectedClub.id);
                      }}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Trash size={14} className="mr-1" /> Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsClubDetailDialogOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {/* Delete Club Confirmation Dialog */}
    <Dialog open={isDeleteClubDialogOpen} onOpenChange={setIsDeleteClubDialogOpen}>
      <DialogContent className="sm:max-w-[425px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce club ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsDeleteClubDialogOpen(false)}
          >
            Non
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteClub}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>Oui</>
            )}
          </Button>
        </div>
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
                  value={editClubData.nom}
                  onChange={(e) => setEditClubData({...editClubData, nom: e.target.value})}
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
                  value={editClubData.categoryId}
                  onValueChange={(value) => setEditClubData({...editClubData, categoryId: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nom}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1">Sport</SelectItem>
                        <SelectItem value="2">Culture</SelectItem>
                        <SelectItem value="3">Informatique</SelectItem>
                        <SelectItem value="4">Science</SelectItem>
                        <SelectItem value="5">Autre</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Statut</label>
                <Select
                  value={editClubData.etat}
                  onValueChange={(value) => {
                    console.log("Status changed in dropdown to:", value);
                    setEditClubData({...editClubData, etat: value});
                  }}
                  defaultValue="EN_ATTENTE"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCEPTER">Accepté</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="REFUSER">Refusé</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-1">
                  Statut actuel: {editClubData.etat === 'ACCEPTER' ? 'Accepté' :
                                 editClubData.etat === 'EN_ATTENTE' ? 'En attente' :
                                 editClubData.etat === 'REFUSER' ? 'Refusé' :
                                 editClubData.etat || 'Non défini'}
                </div>
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