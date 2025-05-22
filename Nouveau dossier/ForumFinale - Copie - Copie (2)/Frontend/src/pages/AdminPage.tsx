import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { clubService } from '@/services/clubService';
import { PostsService } from '@/services/postService';
import { EventsService } from '@/services/eventService';
import { eventsClubsService} from '@/services/EventClubServices';
import participantService from '@/services/participantService';
import participantClubService from '@/services/participantClubService';
import membreClubService, { MembreClub, RoleMembre } from '@/services/membreClubService';
import { categoryService } from '@/services/categoryService';
import { ReportService, ReportResponse } from '@/services/reportService';
import { ParticipantStatus, getParticipantStatusDisplay } from '@/types/participant';
import apiClient from '@/services/api';
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
  Clock,
  ChevronDown,
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
  FolderEdit,
  RefreshCw
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
  const [clubMembers, setClubMembers] = useState<MembreClub[]>([]);
  const [isLoadingClubMembers, setIsLoadingClubMembers] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [allEventsClub, setAllEventsClub] = useState<UIEvent[]>([]);
  const [allEvents, setAllEvents] = useState<UIEvent[]>([]);

  const [allClubs, setAllClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const { toast } = useToast();

  const [editClubData, setEditClubData] = useState({
    nom: '',
    description: '',
    categoryId: '',
    etat: 'ACTIVE',
    image: null as string | null,
    imageFile: null as File | null
  });
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Define Category interface
  interface Category {
    id: number;
    nom: string;
  }

  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ nom: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
  // Define a proper type for posts
  interface Post {
    id: number | string;
    author?: string;
    username?: string; // Nom complet de l'utilisateur
    content: string;
    date?: string;
    createdAt?: string;
    reported?: boolean;
    reportedBy?: string;
    reason?: string;
    image?: string | null;
    imageUrl?: string | null;
    authorAvatar?: string | null;
    fullName?: string | null;
  }
  const [posts, setPosts] = useState<Post[]>([]);
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
  const handleApprovePost = async (reportId: number) => {
    try {
      console.log("Approving report with ID:", reportId);

      // Call the ReportService to approve the report
      const result = await ReportService.approveReport(reportId);

      if (result === null) {
        console.warn("Report approval returned null result, but continuing with UI update");
      }

      // Update local state to remove the report from the list
      setReportedPosts(reportedPosts.filter(post => post.reportId !== reportId));

      setNotification({
        type: "success",
        message: "Publication approuvée avec succès"
      });

      // Update analytics
      setAnalytics((prev: any) => ({
        ...prev,
        posts: {
          ...prev.posts,
          reported: prev.posts.reported - 1
        }
      }));

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error approving report:", error);
      setNotification({
        type: "error",
        message: "Erreur lors de l'approbation de la publication"
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle removing a reported post
  const handleRemovePost = async (reportData: { reportId: number, postId: number }) => {
    try {
      console.log("Removing post with ID:", reportData.postId, "and report ID:", reportData.reportId);

      let postDeleted = false;
      let reportHandled = false;

      try {
        // First, delete the post using the PostsService
        await PostsService.deletePost(reportData.postId);
        postDeleted = true;
        console.log("Post deleted successfully");
      } catch (postError) {
        console.error("Error deleting post:", postError);
        // Continue to try to handle the report even if post deletion fails
      }

      try {
        // Then, mark the report as handled using the ReportService
        const result = await ReportService.approveReport(reportData.reportId);
        reportHandled = result !== null;
        console.log("Report handled successfully:", result);
      } catch (reportError) {
        console.error("Error handling report:", reportError);
        // Continue with UI update even if report handling fails
      }

      // Update local state if at least one operation succeeded
      if (postDeleted || reportHandled) {
        // Remove the report from the list regardless
        setReportedPosts(reportedPosts.filter(post => post.reportId !== reportData.reportId));

        // Only remove from all posts if the post was actually deleted
        if (postDeleted) {
          setAllPosts(allPosts.filter(post => post.id !== reportData.postId));
        }

        // Update analytics
        setAnalytics((prev: any) => ({
          ...prev,
          posts: {
            ...prev.posts,
            total: postDeleted ? prev.posts.total - 1 : prev.posts.total,
            reported: prev.posts.reported - 1
          }
        }));

        setNotification({
          type: "success",
          message: postDeleted
            ? "Publication supprimée avec succès"
            : "Publication marquée comme traitée"
        });
      } else {
        // Both operations failed
        setNotification({
          type: "error",
          message: "Échec de la suppression de la publication et du traitement du signalement"
        });
      }

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error in handleRemovePost:", error);
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

      // Get the current user ID from localStorage (admin user)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || 1; // Default to ID 1 if not found (usually admin)

      console.log("Creating post with userId:", userId);

      // Create the post using the service
      const createdPost = await PostsService.createPost({
        title: 'Post from Admin', // Default title
        content: newPost.content,
        category: 'General', // Default category
        imageUrl: imageUrl
      }, userId);

      // Add the new post to the list
      setAllPosts(prevPosts => [createdPost, ...prevPosts]);

      // Reset form and close it
      setNewPost({ content: '', image: null, imagePreview: null });
      setIsAdding(false);
      showNotification('Publication créée avec succès', 'success');
    } catch (error) {
      console.error("Error creating post:", error);
      showNotification('Erreur: ' + (error.message || 'Échec de la création de la publication'), 'error');
    }
  };
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

    const deletePost = async (postId: number | string) => {
    try {
      // Convert postId to number if it's a string
      const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;

      // Delete the post using the service
      await PostsService.deletePost(numericPostId);

      // Remove the post from the list
      setAllPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      showNotification('Publication supprimée avec succès', 'success');
    } catch (error) {
      console.error("Error deleting post:", error);
      showNotification('Erreur: ' + (error.message || 'Échec de la suppression de la publication'), 'error');
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
        etat: clubStatus,
        image: club.image || club.profilePhoto || null,
        imageFile: null
      });

      console.log("Edit form data set:", {
        nom: club.nom || '',
        description: club.description || '',
        categoryId: club.categoryId ? club.categoryId.toString() : '',
        etat: clubStatus,
        image: club.image || club.profilePhoto || null
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
      // Remove imageFile from the data sent to the backend
      const { imageFile, ...restData } = editClubData;
      const updatedClubData = {
        ...restData,
        categoryId: editClubData.categoryId ? parseInt(editClubData.categoryId) : undefined
      };

      console.log("Sending updated club data to backend:", updatedClubData);

      // Check if the status has changed
      const statusChanged = selectedClub.etat !== updatedClubData.etat;
      console.log("Status changed:", statusChanged, "Old:", selectedClub.etat, "New:", updatedClubData.etat);

      let updatedClub;

      // Handle image upload if there's a new image file
      if (editClubData.imageFile) {
        console.log("Uploading new image for club");
        try {
          const imageUrl = await clubService.uploadImage(selectedClub.id, editClubData.imageFile);
          console.log("Image uploaded successfully:", imageUrl);

          // Update the image URL in the data to be sent
          updatedClubData.image = imageUrl;
        } catch (imageError) {
          console.error("Error uploading image:", imageError);
          toast({
            title: 'Avertissement',
            description: 'Impossible de télécharger l\'image. Les autres informations seront mises à jour.',
            variant: 'destructive',
          });
        }
      }

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

      // For each club, update the member count if needed
      const clubsWithUpdatedMemberCounts = await Promise.all(
        clubs.map(async (club) => {
          // If the club already has a member count, use it
          if (club.membres !== undefined && club.membres !== null) {
            return club;
          }

          try {
            // Otherwise, fetch the members and update the count
            const members = await membreClubService.getClubMembers(club.id);
            return {
              ...club,
              membres: members.length
            };
          } catch (error) {
            console.error(`Error fetching members for club ${club.id}:`, error);
            return club;
          }
        })
      );

      setAllClubs(clubsWithUpdatedMemberCounts);
      setFilteredClubs(clubsWithUpdatedMemberCounts);
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
      // Just fetch roles but don't store them since we don't need them
      await roleService.getAllRoles();
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

      // For each club, update the member count if needed
      const clubsWithUpdatedMemberCounts = await Promise.all(
        allClubs.map(async (club) => {
          // If the club already has a member count, use it
          if (club.membres !== undefined && club.membres !== null) {
            return club;
          }

          try {
            // Otherwise, fetch the members and update the count
            const members = await membreClubService.getClubMembers(club.id);
            return {
              ...club,
              membres: members.length
            };
          } catch (error) {
            console.error(`Error fetching members for club ${club.id}:`, error);
            return club;
          }
        })
      );

      // Update analytics with accurate member counts
      setAnalytics(prev => ({
        ...prev,
        clubs: {
          total: clubsWithUpdatedMemberCounts.length,
          active: clubsWithUpdatedMemberCounts.filter(club => club.etat === 'ACCEPTER').length,
          members: clubsWithUpdatedMemberCounts.reduce((total, club) => total + (club.membres || 0), 0),
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

  // Fetch posts and reported posts
  const fetchPosts = async () => {
    try {
      // Fetch all posts
      const fetchedPosts = await PostsService.getAllPosts();
      setAllPosts(fetchedPosts);

      // Also update the posts state for the UI with author avatars and full names
      console.log("Fetched posts:", fetchedPosts);

      const postsWithAvatars = fetchedPosts.map(post => {
        // Récupérer l'image du post (soit de imageUrl, soit de image)
        const postImage = post.imageUrl || post.image || null;
        console.log(`Post ${post.id} image:`, postImage);

        // Construire le nom complet de l'utilisateur si possible
        // Utiliser le champ username qui contient le nom complet de l'utilisateur
        let fullName = post.username || post.author || 'Utilisateur';
        console.log(`Post ${post.id} author: ${post.author}, username: ${post.username}, fullName: ${fullName}`);

        // Formater la date correctement - utiliser la date actuelle comme fallback
        const now = new Date();
        let formattedDate = now.toISOString();

        try {
          // Vérifier si createdAt est une date valide
          if (post.createdAt && !isNaN(new Date(post.createdAt).getTime())) {
            formattedDate = post.createdAt;
            console.log(`Post ${post.id} date from createdAt:`, formattedDate);
          } else {
            // Si la date n'est pas valide, utiliser la date actuelle
            console.log(`Post ${post.id} has invalid date, using current date:`, formattedDate);
          }
        } catch (error) {
          console.log(`Error processing date for post ${post.id}:`, error);
        }

        const processedPost = {
          ...post,
          authorAvatar: post.authorAvatar || '/placeholder.svg', // Utiliser l'avatar de l'auteur s'il existe, sinon utiliser un placeholder
          date: formattedDate, // Utiliser la date formatée
          fullName: fullName, // Ajouter le nom complet
          image: postImage // S'assurer que l'image est définie
        };

        console.log(`Processed post ${post.id}:`, processedPost);
        return processedPost;
      });

      console.log("Posts with avatars:", postsWithAvatars);
      setPosts(postsWithAvatars);

      // Fetch reported posts from the backend
      let fetchedReports: any[] = [];
      try {
        console.log("Fetching reports...");
        const response: any = await ReportService.getAllReports();
        console.log("Fetched reports response:", response);
        console.log("Response type:", typeof response);
        console.log("Is array:", Array.isArray(response));

        // Ensure fetchedReports is an array
        if (Array.isArray(response)) {
          fetchedReports = response;
        } else if (response && typeof response === 'object') {
          // If it's an object but not an array, it might be a single report or have a data property
          if (response.data && Array.isArray(response.data)) {
            fetchedReports = response.data;
          } else if (response.id) {
            // It's a single report object
            fetchedReports = [response];
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        // Continue with empty array
      }

      console.log("Processed reports:", fetchedReports);

      // Transform reports into the format expected by the UI (with safety check)
      const formattedReportedPosts = Array.isArray(fetchedReports) ? fetchedReports.map(report => {
        if (!report) return null;

        // Find the associated post
        const post = fetchedPosts.find(p => p.id === report.postId) || report.post;

        // Get image from either post source or from the new field
        let imageUrl = null;
        if (report.postImageUrl) {
          imageUrl = report.postImageUrl;
        } else if (post) {
          if ('image' in post) {
            imageUrl = post.image;
          } else if ('imageUrl' in post) {
            imageUrl = post.imageUrl;
          }
        }

        return {
          id: report.id, // Use report ID for the reported post
          reportId: report.id,
          postId: report.postId,
          author: report.postAuthor || post?.author || 'Anonymous',
          postAuthorAvatar: report.postAuthorAvatar || null,
          content: post?.content || report.postContent || 'Contenu non disponible',
          reportedBy: report.username || report.user?.firstName || 'Utilisateur',
          userAvatar: report.userAvatar || null,
          date: post?.createdAt || report.createdAt || new Date().toISOString(),
          reason: report.reason || 'Contenu signalé',
          image: imageUrl,
          status: report.status
        };
      }).filter(Boolean) : [];

      setReportedPosts(formattedReportedPosts);

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      const postsToday = fetchedPosts.filter(post =>
        post.createdAt && post.createdAt.startsWith(today)
      ).length;

      setAnalytics(prev => ({
        ...prev,
        posts: {
          total: fetchedPosts.length,
          today: postsToday,
          reported: formattedReportedPosts.length,
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
      const formattedEvents = events.map(event => {
        return {
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
        };
      });

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
      const formattedClubEvents = eventsClubs.map(event => {
        return {
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
        };
      });

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
  const updateEventAnalytics = useCallback((regularEvents: UIEvent[], clubEvents: UIEvent[]) => {
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
  }, []);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();

      // Fetch roles for all users
      const usersWithRoles = await Promise.all(
        usersData.map(async (user: any) => {
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
      setAnalytics((prev: any) => ({
        ...prev,
        users: {
          total: usersData.length,
          new: usersData.filter((u: any) => {
            const joinDate = new Date(u.joined);
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return joinDate > oneWeekAgo;
          }).length,
          active: usersData.filter((u: any) => u.status === 'ACTIF').length,
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

  const handleEditCategory = (category: Category) => {
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
  const handleApproveClub = async (clubId: number) => {
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
  const handleRejectClub = async (clubId: number) => {
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

  // Fetch club members
  const fetchClubMembers = async (clubId: number) => {
    try {
      setIsLoadingClubMembers(true);
      console.log("Fetching members for club ID:", clubId);

      const members = await membreClubService.getClubMembers(clubId);
      console.log("Fetched club members:", members);

      // Update the member count in the selected club
      if (selectedClub && selectedClub.id === clubId) {
        const memberCount = members.length;
        console.log(`Updating member count for club ${clubId} to ${memberCount}`);

        // Update the selected club with the new member count
        setSelectedClub((prev: any) => ({
          ...prev,
          membres: memberCount
        }));

        // Also update the club in the allClubs array
        setAllClubs(prev => prev.map(club =>
          club.id === clubId ? { ...club, membres: memberCount } : club
        ));

        // Update the filtered clubs as well
        setFilteredClubs(prev => prev.map(club =>
          club.id === clubId ? { ...club, membres: memberCount } : club
        ));
      }

      setClubMembers(members);

      return members;
    } catch (error) {
      console.error("Error fetching club members:", error);
      toast({
        title: 'Erreur',
        description: 'Échec du chargement des membres du club. Veuillez réessayer.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoadingClubMembers(false);
    }
  };

  // Handle club details view
  const handleViewClubDetails = async (clubId: number) => {
    try {
      console.log("Fetching details for club ID:", clubId);
      setIsLoading(true);

      // Fetch the latest club data before showing details
      const clubDetail = await clubService.getClubById(clubId);
      console.log("Fetched club details:", clubDetail);

      // Make sure we have the latest data
      setSelectedClub(clubDetail);

      // Fetch club members and update the member count
      const members = await fetchClubMembers(clubId);

      // Update the member count in the club detail
      const updatedClubDetail = {
        ...clubDetail,
        membres: members.length
      };

      // Update the selected club with the correct member count
      setSelectedClub(updatedClubDetail);

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
  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
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
const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);
const [filteredEventsClubs, setFilteredEventsClubs] = useState<UIEvent[]>([]);
// Removed eventRequests state as it's no longer needed
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [editingEvent, setEditingEvent] = useState<UIEvent | null>(null);
const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
const [eventToDeleteId, setEventToDeleteId] = useState(null);
const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
const [newEventData, setNewEventData] = useState({
  name: '',
  description: '',
  date: '',
  location: '',
  status: 'AVENIR',
  image: null as string | null,
  imageFile: null as File | null
});

// Define Event interface for the UI
interface UIEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  date: string;
  createdAt: string;
  status: string;
  image: string | null;
  participantCount: number;
  participants: number;
  organizer: string;
  eventType: string;
  category?: string;
}

// Define participant type to match backend model
interface Participant {
  id: number;
  userId: number;
  // For regular events
  event?: {
    id: number;
    titre: string;
    description: string;
    lieu: string;
    dateDebut: string;
    dateFin: string;
    createurId: number;
    status?: string;
    nbParticipants?: number;
    image?: string;
  };
  // For club events
  eventClub?: {
    id: number;
    titre: string;
    description: string;
    lieu: string;
    dateDebut: string;
    dateFin: string;
    createurId: number;
    nomClub?: string;
    clubId?: number;
    status?: string;
    nbParticipants?: number;
    image?: string;
  };
  dateInscription: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  // Additional fields for UI display
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string;
    departement?: string;
    phoneNumber?: string;
    address?: string;
    biographie?: string;
    dateOfBirth?: Date;
    createdTimes?: Date;
  };
}

// Participant management state
const [eventParticipants, setEventParticipants] = useState<Participant[]>([]);
const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

// No longer using sample event requests





  // We'll use fetchData() instead which already calls fetchEvents()

  // Update analytics whenever events change
  useEffect(() => {
    if (allEvents.length > 0 || allEventsClub.length > 0) {
      updateEventAnalytics(allEvents, allEventsClub);
    }
  }, [allEvents, allEventsClub, updateEventAnalytics]);

  // Function to fetch participants for an event
  const fetchEventParticipants = async (eventId: number, eventType: string) => {
    setIsLoadingParticipants(true);

    // Clear previous participants immediately
    setEventParticipants([]);

    try {
      // Make sure we're using the correct event ID (convert to number)
      const numericEventId = Number(eventId);
      console.log(`Fetching participants for event ID: ${numericEventId}, type: ${eventType}`);

      let participants: Participant[] = [];

      if (eventType === "Club") {
        // Fetch club event participants
        const clubParticipants = await participantClubService.getEventParticipants(numericEventId);
        console.log(`Club participants for event ${numericEventId}:`, clubParticipants);

        // Convert to our Participant interface
        participants = clubParticipants.map(p => {
          // Make sure we have a valid eventClub object
          const eventClubData = p.eventClub ? {
            id: numericEventId, // Always use the requested eventId to ensure consistency
            titre: p.eventClub.titre || '',
            description: p.eventClub.description || '',
            lieu: p.eventClub.lieu || '',
            dateDebut: p.eventClub.dateDebut || new Date().toISOString(),
            dateFin: p.eventClub.dateFin || new Date().toISOString(),
            createurId: p.eventClub.createurId || 0,
            nomClub: p.eventClub.nomClub || '',
            clubId: p.eventClub.clubId || 0,
            status: p.eventClub.status || 'ACTIVE',
            nbParticipants: p.eventClub.nbParticipants || 0,
            image: p.eventClub.image || null
          } : {
            id: numericEventId, // Provide a fallback with the correct eventId
            titre: '',
            description: '',
            lieu: '',
            dateDebut: new Date().toISOString(),
            dateFin: new Date().toISOString(),
            createurId: 0,
            nomClub: '',
            clubId: 0,
            status: 'ACTIVE',
            nbParticipants: 0,
            image: null
          };

          return {
            id: p.id || 0,
            userId: p.userId,
            eventClub: eventClubData,
            dateInscription: p.dateInscription || new Date().toISOString(),
            status: (p.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED',
            firstName: p.firstName || p.user?.firstName || '',
            lastName: p.lastName || p.user?.lastName || '',
            email: p.email || p.user?.email || '',
            user: p.user
          };
        });
      } else {
        // Fetch regular event participants
        const eventParticipants = await participantService.getEventParticipants(numericEventId);
        console.log(`Regular event participants for event ${numericEventId}:`, eventParticipants);

        // Convert to our Participant interface
        participants = eventParticipants.map(p => {
          // Make sure we have a valid event object
          const eventData = p.event ? {
            id: numericEventId, // Always use the requested eventId to ensure consistency
            titre: p.event.titre || '',
            description: p.event.description || '',
            lieu: p.event.lieu || '',
            dateDebut: p.event.dateDebut || new Date().toISOString(),
            dateFin: p.event.dateFin || new Date().toISOString(),
            createurId: p.event.createurId || 0,
            status: p.event.status || 'ACTIVE',
            nbParticipants: p.event.nbParticipants || 0,
            image: p.event.image || null
          } : {
            id: numericEventId, // Provide a fallback with the correct eventId
            titre: '',
            description: '',
            lieu: '',
            dateDebut: new Date().toISOString(),
            dateFin: new Date().toISOString(),
            createurId: 0,
            status: 'ACTIVE',
            nbParticipants: 0,
            image: null
          };

          return {
            id: p.id || 0,
            userId: p.userId,
            event: eventData,
            dateInscription: p.dateInscription || new Date().toISOString(),
            status: (p.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED',
            firstName: p.firstName || p.user?.firstName || '',
            lastName: p.lastName || p.user?.lastName || '',
            email: p.email || p.user?.email || '',
            user: p.user
          };
        });
      }

      console.log(`Found ${participants.length} participants for ${eventType} event ${numericEventId}`);

      if (participants.length === 0) {
        // If no participants, update the UI and return early
        // Find the current event again to make sure we're updating the correct one
        const currentEvent = selectedEvent && Number(selectedEvent.id) === numericEventId
          ? selectedEvent
          : allEvents.find(e => Number(e.id) === numericEventId) ||
            allEventsClub.find(e => Number(e.id) === numericEventId);

        if (currentEvent) {
          // Only update if the selected event matches the requested event ID
          if (selectedEvent && Number(selectedEvent.id) === numericEventId) {
            setSelectedEvent({
              ...selectedEvent,
              participantCount: 0,
              participants: 0
            });
          }
        }

        toast({
          title: "Information",
          description: "Aucun participant trouvé pour cet événement.",
        });

        setIsLoadingParticipants(false);
        return;
      }

      // Process participants and fetch user details for each participant
      const processedParticipants = await Promise.all(
        participants.map(async (participant) => {
          try {
            // Fetch user details from the backend
            const user = await userService.getUserById(participant.userId);
            console.log(`User details for participant ${participant.userId}:`, user);

            return {
              ...participant,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              status: (participant.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED',
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                departement: user.departement,
                phoneNumber: user.phoneNumber,
                address: user.address,
                biographie: user.biographie,
                dateOfBirth: user.dateOfBirth,
                createdTimes: user.createdTimes
              }
            };
          } catch (error) {
            console.error(`Error fetching user details for participant ${participant.userId}:`, error);
            // Return participant with minimal info if user details can't be fetched
            return {
              ...participant,
              firstName: '',
              lastName: '',
              email: '',
              status: (participant.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED'
            };
          }
        })
      );

      setEventParticipants(processedParticipants);

      // Update the participant count in the selected event
      // Only update if the selected event matches the requested event ID
      if (selectedEvent && Number(selectedEvent.id) === numericEventId) {
        console.log(`Updating selected event (ID: ${selectedEvent.id}) with ${processedParticipants.length} participants`);
        setSelectedEvent({
          ...selectedEvent,
          participantCount: processedParticipants.length,
          participants: processedParticipants.length
        });
      }

      toast({
        title: "Participants chargés",
        description: `${processedParticipants.length} participant(s) trouvé(s) pour cet événement.`,
      });
    } catch (error) {
      console.error(`Error fetching participants for ${eventType} event ${eventId}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les participants.",
        variant: "destructive",
      });

      // Update the participant count to 0 in case of error
      // Only update if the selected event matches the requested event ID
      if (selectedEvent && Number(selectedEvent.id) === Number(eventId)) {
        setSelectedEvent({
          ...selectedEvent,
          participantCount: 0,
          participants: 0
        });
      }
    } finally {
      setIsLoadingParticipants(false);
    }
  };





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

  // Function to view regular event details
  const handleViewEventDetails = (id: number) => {
    console.log("Viewing regular event details for ID:", id);

    // First close the dialog to ensure a clean state
    setIsDetailsDialogOpen(false);

    // Clear previous participants immediately to avoid showing wrong data
    setEventParticipants([]);

    // Convert id to number to ensure correct comparison
    const eventId = Number(id);

    // Find the event in regular events only
    const regularEvent = allEvents.find(e => Number(e.id) === eventId);

    // Debug the event lookup
    console.log("Looking for regular event with ID:", eventId);
    console.log("Found regular event:", regularEvent);

    if (regularEvent) {
      console.log("Found regular event:", regularEvent);

      // Create a fresh copy of the event to avoid reference issues
      const eventCopy = JSON.parse(JSON.stringify(regularEvent));

      // Set the selected event with a temporary participant count
      // This will be updated when we fetch the actual participants
      const newSelectedEvent = {
        ...eventCopy,
        eventType: "Standard", // Explicitly set the event type
        participantCount: 0,
        participants: 0
      };

      console.log("Setting selected event to:", newSelectedEvent);

      // Reset the selected event to force a complete re-render
      setSelectedEvent(null);

      // Use requestAnimationFrame to ensure the state update has time to propagate
      requestAnimationFrame(() => {
        // Set the new selected event
        setSelectedEvent(newSelectedEvent);

        // Open the dialog after setting the event
        setIsDetailsDialogOpen(true);

        // Fetch participants for the event
        try {
          console.log(`Fetching participants for regular event ${eventId}`);
          fetchEventParticipants(eventId, "Standard");
        } catch (error) {
          console.error("Error fetching participants:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les participants.",
            variant: "destructive",
          });
        }
      });
    } else {
      console.error("Regular event not found with ID:", id);
      toast({
        title: "Erreur",
        description: "Impossible de trouver les détails de cet événement.",
        variant: "destructive",
      });
    }
  };

  // Function to fetch participants for a club event
  const fetchClubEventParticipants = async (eventId: number) => {
    setIsLoadingParticipants(true);

    // Clear previous participants immediately
    setEventParticipants([]);

    try {
      // Make sure we're using the correct event ID (convert to number)
      const numericEventId = Number(eventId);
      console.log(`Fetching participants for club event ID: ${numericEventId}`);

      // Fetch club event participants using the dedicated service
      const clubParticipants = await participantClubService.getEventParticipants(numericEventId);
      console.log(`Club participants for event ${numericEventId}:`, clubParticipants);

      if (clubParticipants.length === 0) {
        // If no participants, update the UI and return early
        if (selectedEvent && Number(selectedEvent.id) === numericEventId) {
          setSelectedEvent({
            ...selectedEvent,
            participantCount: 0,
            participants: 0
          });
        }

        toast({
          title: "Information",
          description: "Aucun participant trouvé pour cet événement de club.",
        });

        setIsLoadingParticipants(false);
        return;
      }

      // Convert to our Participant interface
      const participants = clubParticipants.map(p => {
        // Make sure we have a valid eventClub object
        const eventClubData = p.eventClub ? {
          id: numericEventId, // Always use the requested eventId to ensure consistency
          titre: p.eventClub.titre || '',
          description: p.eventClub.description || '',
          lieu: p.eventClub.lieu || '',
          dateDebut: p.eventClub.dateDebut || new Date().toISOString(),
          dateFin: p.eventClub.dateFin || new Date().toISOString(),
          createurId: p.eventClub.createurId || 0,
          nomClub: p.eventClub.nomClub || '',
          clubId: p.eventClub.clubId || 0,
          status: p.eventClub.status || 'ACTIVE',
          nbParticipants: p.eventClub.nbParticipants || 0,
          image: p.eventClub.image || null
        } : {
          id: numericEventId, // Provide a fallback with the correct eventId
          titre: '',
          description: '',
          lieu: '',
          dateDebut: new Date().toISOString(),
          dateFin: new Date().toISOString(),
          createurId: 0,
          nomClub: '',
          clubId: 0,
          status: 'ACTIVE',
          nbParticipants: 0,
          image: null
        };

        return {
          id: p.id || 0,
          userId: p.userId,
          eventClub: eventClubData,
          dateInscription: p.dateInscription || new Date().toISOString(),
          status: (p.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED',
          firstName: p.firstName || p.user?.firstName || '',
          lastName: p.lastName || p.user?.lastName || '',
          email: p.email || p.user?.email || '',
          user: p.user
        };
      });

      // Process participants and fetch user details for each participant
      const processedParticipants = await Promise.all(
        participants.map(async (participant) => {
          try {
            // Fetch user details from the backend
            const user = await userService.getUserById(participant.userId);
            console.log(`User details for club participant ${participant.userId}:`, user);

            return {
              ...participant,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              status: (participant.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED',
              user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
                departement: user.departement,
                phoneNumber: user.phoneNumber,
                address: user.address,
                biographie: user.biographie,
                dateOfBirth: user.dateOfBirth,
                createdTimes: user.createdTimes
              }
            };
          } catch (error) {
            console.error(`Error fetching user details for club participant ${participant.userId}:`, error);
            // Return participant with minimal info if user details can't be fetched
            return {
              ...participant,
              firstName: '',
              lastName: '',
              email: '',
              status: (participant.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || 'CONFIRMED'
            };
          }
        })
      );

      setEventParticipants(processedParticipants);

      // Update the participant count in the selected event
      if (selectedEvent && Number(selectedEvent.id) === numericEventId) {
        console.log(`Updating selected club event (ID: ${selectedEvent.id}) with ${processedParticipants.length} participants`);
        setSelectedEvent({
          ...selectedEvent,
          participantCount: processedParticipants.length,
          participants: processedParticipants.length
        });
      }

      toast({
        title: "Participants chargés",
        description: `${processedParticipants.length} participant(s) trouvé(s) pour cet événement de club.`,
      });
    } catch (error) {
      console.error(`Error fetching participants for club event ${eventId}:`, error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      toast({
        title: "Erreur",
        description: "Impossible de charger les participants de l'événement de club.",
        variant: "destructive",
      });

      // Update the participant count to 0 in case of error
      if (selectedEvent && Number(selectedEvent.id) === Number(eventId)) {
        setSelectedEvent({
          ...selectedEvent,
          participantCount: 0,
          participants: 0
        });
      }
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Function to view club event details
  const handleViewClubEventDetails = (id: number) => {
    console.log("Viewing club event details for ID:", id);

    // First close the dialog to ensure a clean state
    setIsDetailsDialogOpen(false);

    // Clear previous participants immediately to avoid showing wrong data
    setEventParticipants([]);

    // Convert id to number to ensure correct comparison
    const eventId = Number(id);

    // Find the event in club events only
    const clubEvent = allEventsClub.find(e => Number(e.id) === eventId);

    // Debug the event lookup
    console.log("Looking for club event with ID:", eventId);
    console.log("Found club event:", clubEvent);

    if (clubEvent) {
      console.log("Found club event:", clubEvent);

      // Create a fresh copy of the event to avoid reference issues
      const eventCopy = JSON.parse(JSON.stringify(clubEvent));

      // Set the selected event with a temporary participant count
      // This will be updated when we fetch the actual participants
      const newSelectedEvent = {
        ...eventCopy,
        eventType: "Club", // Explicitly set the event type
        participantCount: 0,
        participants: 0
      };

      console.log("Setting selected event to:", newSelectedEvent);

      // Reset the selected event to force a complete re-render
      setSelectedEvent(null);

      // Use requestAnimationFrame to ensure the state update has time to propagate
      requestAnimationFrame(() => {
        // Set the new selected event
        setSelectedEvent(newSelectedEvent);

        // Open the dialog after setting the event
        setIsDetailsDialogOpen(true);

        // Fetch participants for the event using the dedicated club event participants function
        try {
          console.log(`Fetching participants for club event ${eventId}`);
          fetchClubEventParticipants(eventId);
        } catch (error) {
          console.error("Error fetching club event participants:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les participants de l'événement de club.",
            variant: "destructive",
          });
        }
      });
    } else {
      console.error("Club event not found with ID:", id);
      toast({
        title: "Erreur",
        description: "Impossible de trouver les détails de cet événement de club.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditEventDialog = (event: UIEvent) => {
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
      const dateTime = new Date(editingEvent.eventDate).toISOString();

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

      let updatedEvent: {
        id: number;
        titre?: string;
        description?: string;
        lieu?: string;
        dateDebut?: string;
        dateFin?: string;
        status?: string;
        image?: string | null;
        nbParticipants?: number;
        nomClub?: string;
      };

      if (isClubEvent) {
        const result = await eventsClubsService.updateEvent(editingEvent.id, updateData, adminId);
        updatedEvent = { id: result.id || editingEvent.id, ...result };
      } else {
        const result = await EventsService.updateEvent(editingEvent.id, updateData, adminId);
        updatedEvent = { id: result.id || editingEvent.id, ...result };
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
  const isRegularEvent = allEvents.some(e => Number(e.id) === Number(eventId));
  const isClubEvent = allEventsClub.some(e => Number(e.id) === Number(eventId));

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
    const eventToCancel = allEvents.find(e => Number(e.id) === Number(eventId));
    const clubEventToCancel = allEventsClub.find(e => Number(e.id) === Number(eventId));

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

    let updatedEvent: {
      id: number;
      titre?: string;
      description?: string;
      lieu?: string;
      dateDebut?: string;
      dateFin?: string;
      status?: string;
      image?: string | null;
      nbParticipants?: number;
      nomClub?: string;
    };

    if (isClubEvent) {
      const result = await eventsClubsService.updateEvent(eventId, updateData, adminId);
      updatedEvent = { id: result.id || eventId, ...result };
    } else {
      const result = await EventsService.updateEvent(eventId, updateData, adminId);
      updatedEvent = { id: result.id || eventId, ...result };
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
        Number(event.id) === Number(eventId) ? formattedUpdatedEvent : event
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
        Number(event.id) === Number(eventId) ? formattedUpdatedEvent : event
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
    if (selectedEvent && Number(selectedEvent.id) === Number(eventId)) {
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
const createEvent = async (eventData: {
  name: string;
  description: string;
  date: string;
  location: string;
  status: string;
  image?: string | null;
  imageFile?: File | null;
}): Promise<void> => {
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

    // If there's an image file, upload it
    let imageUrl = null;
    if (eventData.imageFile && newEvent && newEvent.id) {
      try {
        console.log("Uploading image for event ID:", newEvent.id);
        imageUrl = await EventsService.uploadImage(newEvent.id, eventData.imageFile);
        console.log("Image uploaded successfully:", imageUrl);
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        toast({
          title: "Avertissement",
          description: "L'événement a été créé mais l'image n'a pas pu être téléchargée.",
        });
      }
    } else if (eventData.imageFile && (!newEvent || !newEvent.id)) {
      console.error("Cannot upload image: Event ID is undefined or null");
      toast({
        title: "Avertissement",
        description: "L'événement a été créé mais l'image n'a pas pu être téléchargée car l'ID de l'événement est manquant.",
      });
    }

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
      image: imageUrl || newEvent.image || null,
      participantCount: 0,
      participants: 0,
      organizer: "Administration",
      eventType: "Standard"
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
      status: 'AVENIR',
      image: null,
      imageFile: null
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
                          <div className="flex items-center">
                            {post.postAuthorAvatar && (
                              <img
                                src={post.postAuthorAvatar}
                                alt="Avatar de l'auteur"
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                            )}
                            <div>
                              <span className="font-medium">{post.author}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {new Date(post.date).toLocaleDateString()} à {new Date(post.date).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {post.reason}
                          </span>
                        </div>
                        <p className="text-foreground mb-3">{post.content}</p>
                        {post.image && (
                          <div className="mb-3">
                            <img
                              src={post.image}
                              alt="Image de la publication"
                              className="max-w-full max-h-60 rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {post.userAvatar && (
                              <img
                                src={post.userAvatar}
                                alt="Avatar du signaleur"
                                className="w-6 h-6 rounded-full mr-2 object-cover"
                              />
                            )}
                            <span className="text-sm text-muted-foreground">
                              Signalé par: <span className="font-medium">{post.reportedBy}</span>
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprovePost(post.reportId)}
                            >
                              <CheckCircle size={16} className="mr-1" /> Approuver
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemovePost({ reportId: post.reportId, postId: post.postId })}
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
              onClick={(e) => {
                // Reset the value to ensure onChange fires even if the same file is selected
                (e.target as HTMLInputElement).value = '';
              }}
              onChange={(e) => {
                e.preventDefault(); // Prevent form submission
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
    {posts.map((post) => (
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
                onClick={() => setEditingPost(null)}
              >
                <X size={16} className="mr-1" /> Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setPosts(posts.map(post =>
                    post.id === editingPost.id ? editingPost : post
                  ));
                  setEditingPost(null);
                  toast({
                    title: "Succès",
                    description: "Publication modifiée avec succès",
                  });
                }}
              >
                <Check size={16} className="mr-1" /> Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                {post.authorAvatar && (
                  <img
                    src={post.authorAvatar}
                    alt="Avatar de l'auteur"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                )}
                <div>
                  <span className="font-medium">{post.fullName || post.author}</span>
                  <span className="text-sm text-muted-foreground mt-1 block">
                    {(() => {
                      try {
                        const date = new Date(post.date);
                        if (!isNaN(date.getTime())) {
                          return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR')}`;
                        }
                        return "Date non disponible";
                      } catch (error) {
                        console.error("Erreur d'affichage de la date:", error);
                        return "Date non disponible";
                      }
                    })()}
                  </span>
                </div>
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
                  className="max-w-full max-h-60 rounded-md object-contain"
                  onError={(e) => {
                    console.log("Erreur de chargement de l'image pour le post", post.id);
                    // Masquer l'image en cas d'erreur
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {!post.image && post.imageUrl && (
              <div className="mb-3">
                <img
                  src={post.imageUrl}
                  alt="Image de la publication"
                  className="max-w-full max-h-80 rounded-md object-contain"
                  onError={(e) => {
                    console.log("Erreur de chargement de l'image pour le post", post.id);
                    // Masquer l'image en cas d'erreur
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2">
              {post.author === currentAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPost({...post})}
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
                          <div className="text-xs text-muted-foreground">{user.firstName + " "+ user.lastName|| 'anonyme'}</div>
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
            onClick={fetchEvents}
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
                        <div className="font-medium truncate" title={event.name}>{event.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Université
                        </div>
                        <div className="flex md:hidden mt-1 space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate">
                            {event.location || "Non défini"}
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
            onClick={fetchEvents}
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
                        <div className="font-medium truncate" title={event.name}>{event.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Club: {event.organizer || "Non défini"}
                        </div>
                        <div className="flex md:hidden mt-1 space-x-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate">
                            {event.location || "Non défini"}
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
                        onClick={() => handleViewClubEventDetails(event.id)}
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
                        onClick={() => handleViewClubEventDetails(event.id)}
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
      <form onSubmit={(e) => e.preventDefault()}>
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
            onChange={(e) => setEditingEvent({...editingEvent, eventDate: e.target.value})}
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

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">
            Image
          </Label>
          <div className="col-span-3 space-y-2">
            {editingEvent?.image && (
              <div className="relative w-full max-w-[200px] h-[120px] rounded-md overflow-hidden border">
                <img
                  src={editingEvent.image}
                  alt={editingEvent.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  type="button" // Explicitly set type to button to prevent form submission
                  onClick={async (e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event propagation
                    try {
                      setIsLoading(true);
                      // Determine if this is a regular event or a club event
                      const isClubEvent = editingEvent.eventType === "Club";
                      const eventId = editingEvent.id;

                      if (isClubEvent) {
                        await eventsClubsService.removeImage(eventId);
                      } else {
                        await EventsService.removeImage(eventId);
                      }

                      // Update the editingEvent with no image
                      const updatedEditingEvent = {...editingEvent, image: null};
                      setEditingEvent(updatedEditingEvent);

                      // Don't close the edit dialog, keep it open

                      // Update the event in the appropriate list
                      if (isClubEvent) {
                        // Update the club event in the list
                        const updatedClubEvents = allEventsClub.map(event =>
                          event.id === eventId ? {...event, image: null} : event
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
                        // Update the regular event in the list
                        const updatedEvents = allEvents.map(event =>
                          event.id === eventId ? {...event, image: null} : event
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

                      toast({
                        title: "Image supprimée",
                        description: "L'image de l'événement a été supprimée avec succès.",
                      });

                      // Don't automatically show event details after removing image
                    } catch (error) {
                      console.error("Erreur lors de la suppression de l'image:", error);
                      toast({
                        title: "Erreur",
                        description: "Impossible de supprimer l'image.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <X size={12} />
                </Button>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              <Input
                id="event-image"
                type="file"
                accept="image/*"
                onClick={(e) => {
                  // Reset the value to ensure onChange fires even if the same file is selected
                  (e.target as HTMLInputElement).value = '';
                }}
                onChange={async (e) => {
                  e.preventDefault(); // Prevent form submission
                  e.stopPropagation(); // Stop event propagation
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    setIsLoading(true);
                    // Determine if this is a regular event or a club event
                    const isClubEvent = editingEvent.eventType === "Club";
                    const eventId = editingEvent.id;

                    let imageUrl: string;
                    if (isClubEvent) {
                      imageUrl = await eventsClubsService.uploadImage(eventId, file);
                    } else {
                      imageUrl = await EventsService.uploadImage(eventId, file);
                    }

                    // Update the editingEvent with the new image URL
                    const updatedEditingEvent = {...editingEvent, image: imageUrl};
                    setEditingEvent(updatedEditingEvent);

                    // Don't close the edit dialog, keep it open

                    // Update the event in the appropriate list
                    if (isClubEvent) {
                      // Update the club event in the list
                      const updatedClubEvents = allEventsClub.map(event =>
                        event.id === eventId ? {...event, image: imageUrl} : event
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
                      // Update the regular event in the list
                      const updatedEvents = allEvents.map(event =>
                        event.id === eventId ? {...event, image: imageUrl} : event
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

                    // Show success message
                    toast({
                      title: "Image téléchargée",
                      description: "L'image de l'événement a été mise à jour avec succès.",
                    });

                    // Don't automatically show event details after upload
                  } catch (error) {
                    console.error("Erreur lors du téléchargement de l'image:", error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de télécharger l'image.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
              />
            </form>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditDialogOpen(false);
          }}
        >
          Annuler
        </Button>
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveEventChanges();
          }}
        >
          Enregistrer
        </Button>
      </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  {/* Event Details Dialog */}
  <Dialog
    key={selectedEvent ? `event-details-${selectedEvent.id}` : 'no-event'}
    open={isDetailsDialogOpen}
    onOpenChange={(open) => {
      if (!open) {
        setIsDetailsDialogOpen(false);
      }
    }}
  >
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
                <p>{selectedEvent.organizer || "Non défini"}</p>
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

          <div className="py-2">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground flex items-center justify-between">
              <span>Liste des participants ({selectedEvent.participantCount || 0})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedEvent.eventType === "Club") {
                    fetchClubEventParticipants(selectedEvent.id);
                  } else {
                    fetchEventParticipants(selectedEvent.id, "Standard");
                  }
                }}
              >
                <RefreshCw size={14} className="mr-1" /> Actualiser
              </Button>
            </h4>
            <div className="border rounded-md p-3 bg-muted/30 max-h-60 overflow-y-auto">
              {isLoadingParticipants ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Chargement des participants...</span>
                </div>
              ) : eventParticipants.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Aucun participant pour cet événement.</p>
              ) : (
                <div className="space-y-2">
                  {eventParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                          {participant.user?.image ? (
                            <img
                              src={participant.user.image}
                              alt={`${participant.user.firstName} ${participant.user.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {participant.firstName || ''} {participant.lastName || ''}
                            {!participant.firstName && !participant.lastName && `Utilisateur #${participant.userId}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.email || `ID: ${participant.userId}`}
                          </div>
                          {participant.user?.departement && (
                            <div className="text-xs text-muted-foreground">
                              Département: {participant.user.departement}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Inscrit le: {new Date(participant.dateInscription).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {selectedEvent.eventType === "Club" ? (
                          // For club events, just display the status without dropdown
                          (() => {
                            const statusInfo = getParticipantStatusDisplay(participant.status);
                            return (
                              <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                {statusInfo.label}
                              </span>
                            );
                          })()
                        ) : (
                          // For regular events, keep the dropdown functionality
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                                {(() => {
                                  const statusInfo = getParticipantStatusDisplay(participant.status);
                                  return (
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                      {statusInfo.label}
                                    </span>
                                  );
                                })()}
                                <ChevronDown size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  console.log(`Direct status update: userId=${participant.userId}, eventId=${selectedEvent.id}, status=CONFIRMED`);
                                  participantService.updateParticipantStatus(
                                    Number(participant.userId),
                                    Number(selectedEvent.id),
                                    'CONFIRMED'
                                  ).then(() => {
                                    // Update the UI
                                    setEventParticipants(prev =>
                                      prev.map(p =>
                                        p.id === participant.id
                                          ? { ...p, status: 'CONFIRMED' }
                                          : p
                                      )
                                    );
                                    toast({
                                      title: "Statut mis à jour",
                                      description: "Le statut du participant a été changé à 'Confirmé'",
                                    });
                                  }).catch(error => {
                                    console.error("Error updating status:", error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de mettre à jour le statut du participant.",
                                      variant: "destructive",
                                    });
                                  });
                                }}
                              >
                                <CheckCircle size={14} className="text-green-600" />
                                <span>Confirmer</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  console.log(`Direct status update: userId=${participant.userId}, eventId=${selectedEvent.id}, status=PENDING`);
                                  participantService.updateParticipantStatus(
                                    Number(participant.userId),
                                    Number(selectedEvent.id),
                                    'PENDING'
                                  ).then(() => {
                                    // Update the UI
                                    setEventParticipants(prev =>
                                      prev.map(p =>
                                        p.id === participant.id
                                          ? { ...p, status: 'PENDING' }
                                          : p
                                      )
                                    );
                                    toast({
                                      title: "Statut mis à jour",
                                      description: "Le statut du participant a été changé à 'En attente'",
                                    });
                                  }).catch(error => {
                                    console.error("Error updating status:", error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de mettre à jour le statut du participant.",
                                      variant: "destructive",
                                    });
                                  });
                                }}
                              >
                                <Clock size={14} className="text-yellow-600" />
                                <span>En attente</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  console.log(`Direct status update: userId=${participant.userId}, eventId=${selectedEvent.id}, status=CANCELLED`);
                                  participantService.updateParticipantStatus(
                                    Number(participant.userId),
                                    Number(selectedEvent.id),
                                    'CANCELLED'
                                  ).then(() => {
                                    // Update the UI
                                    setEventParticipants(prev =>
                                      prev.map(p =>
                                        p.id === participant.id
                                          ? { ...p, status: 'CANCELLED' }
                                          : p
                                      )
                                    );
                                    toast({
                                      title: "Statut mis à jour",
                                      description: "Le statut du participant a été changé à 'Annulé'",
                                    });
                                  }).catch(error => {
                                    console.error("Error updating status:", error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de mettre à jour le statut du participant.",
                                      variant: "destructive",
                                    });
                                  });
                                }}
                              >
                                <XCircle size={14} className="text-red-600" />
                                <span>Annuler</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-red-600"
                                onClick={() => {
                                  console.log(`Direct participant removal: userId=${participant.userId}, eventId=${selectedEvent.id}`);
                                  participantService.leaveEvent(
                                    Number(participant.userId),
                                    Number(selectedEvent.id)
                                  ).then(() => {
                                    // Update the UI
                                    setEventParticipants(prev => prev.filter(p => p.id !== participant.id));

                                    // Update the participant count in the selected event
                                    if (selectedEvent) {
                                      const newCount = Math.max((selectedEvent.participantCount || 0) - 1, 0);
                                      setSelectedEvent({
                                        ...selectedEvent,
                                        participantCount: newCount,
                                        participants: newCount
                                      });
                                    }

                                    toast({
                                      title: "Participant retiré",
                                      description: "Le participant a été retiré de l'événement avec succès.",
                                    });
                                  }).catch(error => {
                                    console.error("Error removing participant:", error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de retirer le participant.",
                                      variant: "destructive",
                                    });
                                  });
                                }}
                              >
                                <UserX size={14} />
                                <span>Retirer</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
              const isRegularEvent = allEvents.some(e => Number(e.id) === Number(eventToDeleteId));
              const isClubEvent = allEventsClub.some(e => Number(e.id) === Number(eventToDeleteId));

              console.log("Is regular event:", isRegularEvent);
              console.log("Is club event:", isClubEvent);

              // Use admin ID (1) as the creator ID for admin operations
              const adminId = 1;

              try {
                // Delete the event using the appropriate service
                if (isClubEvent) {
                  await eventsClubsService.deleteEvent(eventToDeleteId, adminId);

                  // Update club events state
                  setAllEventsClub(allEventsClub.filter(event => Number(event.id) !== Number(eventToDeleteId)));
                  setFilteredEventsClubs(filteredEventsClubs.filter(event => Number(event.id) !== Number(eventToDeleteId)));
                } else {
                  await EventsService.deleteEvent(eventToDeleteId, adminId);

                  // Update regular events state
                  setAllEvents(allEvents.filter(event => Number(event.id) !== Number(eventToDeleteId)));
                  setFilteredEvents(filteredEvents.filter(event => Number(event.id) !== Number(eventToDeleteId)));
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

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">
            Image
          </Label>
          <div className="col-span-3 space-y-2">
            {newEventData.image && (
              <div className="relative w-full max-w-[200px] h-[120px] rounded-md overflow-hidden border">
                <img
                  src={newEventData.image}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={() => {
                    setNewEventData({...newEventData, image: null, imageFile: null});
                  }}
                >
                  <X size={12} />
                </Button>
              </div>
            )}

            <Input
              id="new-event-image"
              type="file"
              accept="image/*"
              onClick={(e) => {
                // Reset the value to ensure onChange fires even if the same file is selected
                (e.target as HTMLInputElement).value = '';
              }}
              onChange={(e) => {
                e.preventDefault(); // Prevent form submission
                const file = e.target.files?.[0];
                if (!file) return;

                // Create a preview URL
                const previewUrl = URL.createObjectURL(file);
                setNewEventData({
                  ...newEventData,
                  image: previewUrl,
                  imageFile: file
                });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
            </p>
          </div>
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
                              {club.image || club.profilePhoto ? (
                                <img
                                  src={club.image || club.profilePhoto}
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
                              {club.image || club.profilePhoto ? (
                                <img
                                  src={club.image || club.profilePhoto}
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
                <p className="text-muted-foreground">{userDetails.firstName + " " + userDetails.lastName || 'anonyme'}</p>
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
            <p className="text-muted-foreground">{userProfile.firstName || userProfile.firstName?.toLowerCase() || 'anonyme'}</p>
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du club</DialogTitle>
          <DialogDescription>
            Consultez les détails complets du club
          </DialogDescription>
        </DialogHeader>

        {selectedClub && (
          <div className="py-2">
            {/* Club header with large image */}
            <div className="mb-6 text-center">
              {/* Large club image */}
              <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4 border border-border shadow-sm">
                {selectedClub.image || selectedClub.profilePhoto ? (
                  <img
                    src={selectedClub.image || selectedClub.profilePhoto}
                    alt={selectedClub.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Activity size={40} className="text-primary" />
                  </div>
                )}
              </div>

              {/* Club name */}
              <h2 className="text-2xl font-semibold mb-2">{selectedClub.nom}</h2>

              {/* Creation date */}
              <div className="text-sm text-muted-foreground">
                Créé le {new Date(selectedClub.dateCreation || new Date()).toLocaleDateString()}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {selectedClub.description}
              </p>
            </div>

            {/* Info and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-3">Informations</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-2 text-sm">Statut:</span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
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

                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-2 text-sm">Catégorie:</span>
                    {selectedClub.categoryId ? (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm inline-block">
                        {getCategoryName(selectedClub.categoryId)}
                      </span>
                    ) : (
                      <span className="font-medium">Non définie</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Membres:</span>
                    <span className="font-medium">{selectedClub.membres || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{selectedClub.id}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Actions</h4>
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

            {/* Club Members Section - Responsive Table */}
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-3">Membres du club</h3>

              {isLoadingClubMembers ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : clubMembers.length > 0 ? (
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-3 text-left text-sm font-medium">Utilisateur</th>
                        <th className="py-2 px-3 text-left text-sm font-medium hidden md:table-cell">Email</th>
                        <th className="py-2 px-3 text-left text-sm font-medium">Rôle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {clubMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-muted/50">
                          <td className="py-2 px-3">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                                {member.user?.image ? (
                                  <img
                                    src={member.user.image}
                                    alt={`${member.user.firstName || ''} ${member.user.lastName || ''}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-medium">
                                    {member.user?.firstName?.charAt(0) || member.firstName?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {member.user?.firstName || member.firstName || 'Utilisateur'} {member.user?.lastName || member.lastName || ''}
                                </p>
                                <p className="text-xs text-muted-foreground md:hidden">
                                  {member.user?.email || member.email || 'Non disponible'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-sm hidden md:table-cell">
                            {member.user?.email || member.email || 'Non disponible'}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              member.role === RoleMembre.ADMIN_CLUB
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {member.role === RoleMembre.ADMIN_CLUB ? 'Admin Club' : 'Membre'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Aucun membre trouvé pour ce club</p>
                </div>
              )}
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

              <div>
                <label className="text-sm font-medium">Image du club</label>
                <div className="mt-2 space-y-3">
                  {/* Show current image if available */}
                  {editClubData.image && (
                    <div className="relative w-full max-w-[200px] h-[120px] rounded-md overflow-hidden border">
                      <img
                        src={editClubData.image}
                        alt="Image du club"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => {
                          setEditClubData({...editClubData, image: null, imageFile: null});
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  )}

                  {/* Image upload input */}
                  <Input
                    type="file"
                    accept="image/*"
                    onClick={(e) => {
                      // Reset the value to ensure onChange fires even if the same file is selected
                      (e.target as HTMLInputElement).value = '';
                    }}
                    onChange={(e) => {
                      e.preventDefault(); // Prevent form submission
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Create a preview URL and store the file
                      const previewUrl = URL.createObjectURL(file);
                      setEditClubData({
                        ...editClubData,
                        image: previewUrl,
                        imageFile: file
                      });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                  </p>
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