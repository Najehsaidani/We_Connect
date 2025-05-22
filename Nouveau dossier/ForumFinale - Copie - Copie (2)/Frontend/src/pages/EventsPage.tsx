
import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Clock, Plus, Users, Filter, CalendarCheck, Edit, Trash2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventsService } from "@/services/eventService";
import { eventsClubsService } from "@/services/EventClubServices";
import ParticipantService from "@/services/participantService";
import ParticipantClubService from "@/services/participantClubService";
import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import apiClient from "@/services/api";
import { EventStatus, EventData, EventClubData, FormattedEvent, formatEventData, formatEventClubData, DEFAULT_EVENT_STATUS, normalizeEventStatus } from '../types/event';
import { userService } from "@/services/userService";

// Tous les événements seront chargés depuis le backend

// Event types for filtering
const eventTypes = [
  'Tous',
  'Event Club',
  'Event Universitaire'
];

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Tous');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attendingEvents, setAttendingEvents] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get user info from auth hook
  const { email, roles, isAuthenticated } = useAuth();
  const isModerator = roles?.includes('ROLE_MODERATEUR');

  // Get user ID from auth
  const [currentUserId, setCurrentUserId] = useState<number>(null);

  // Effect to get user ID from token
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && email) {
        try {
          console.log('Fetching user data for email:', email);
          // Get user data from API using email from token
          const userData = await userService.getUserByEmail(email);
          if (userData && userData.id) {
            console.log('User data fetched:', userData);
            setCurrentUserId(userData.id);
          } else {
            console.error('User data not found or invalid');
            // Fallback to a default ID for testing
            setCurrentUserId(1);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          console.error('Error details:', error.response?.data);
          // Fallback to a default ID for testing
          setCurrentUserId(1);
        }
      } else {
        console.log('User not authenticated or email not available');
        // For testing purposes
        setCurrentUserId(1);
      }
    };

    fetchUserData();
  }, [isAuthenticated, email]);

  // Form state for new/edit event
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'Event Club',
    id: null
  });

  const { toast } = useToast();

  // Fonction pour rafraîchir les événements
  const refreshEvents = async () => {
    setIsLoading(true);
    try {
      console.log('Refreshing events from backend...');

      // Fetch regular events
      let regularEvents = [];
      try {
        console.log('Calling EventsService.getAllEvents()...');
        regularEvents = await EventsService.getAllEvents();
        console.log('Fetched regular events:', regularEvents);
        console.log('Regular events count:', regularEvents.length);

        // Vérifier si les événements ont les propriétés attendues
        if (regularEvents.length > 0) {
          const sampleEvent = regularEvents[0];
          console.log('Sample regular event:', sampleEvent);
          console.log('Event properties:', Object.keys(sampleEvent));
          console.log('Event ID:', sampleEvent.id);
          console.log('Event titre:', sampleEvent.titre);
          console.log('Event status:', sampleEvent.status);
        }
      } catch (error) {
        console.error('Error fetching regular events:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        regularEvents = [];
      }

      // Format events for display
      const formattedRegularEvents = regularEvents
        .filter(event => event !== null && event !== undefined) // Filter out null or undefined events
        .map(event => {
          try {
            console.log('Formatting regular event:', event.id, event.titre);
            return formatEventData(event as EventData);
          } catch (error) {
            console.error('Error formatting regular event:', error, event);
            return null;
          }
        })
        .filter(Boolean); // Filter out null results

      console.log('Formatted regular events count:', formattedRegularEvents.length);

      // Fetch club events
      let eventsFromClubs = [];
      try {
        console.log('Calling eventsClubsService.getAllEventsClubs()...');
        eventsFromClubs = await eventsClubsService.getAllEventsClubs();
        console.log('Fetched club events:', eventsFromClubs);
        console.log('Club events count:', eventsFromClubs.length);

        // Vérifier si les événements ont les propriétés attendues
        if (eventsFromClubs.length > 0) {
          const sampleEvent = eventsFromClubs[0];
          console.log('Sample club event:', sampleEvent);
          console.log('Club event properties:', Object.keys(sampleEvent));
          console.log('Club event ID:', sampleEvent.id);
          console.log('Club event titre:', sampleEvent.titre);
          console.log('Club event status:', sampleEvent.status);
        }
      } catch (error) {
        console.error('Error fetching club events:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        eventsFromClubs = [];
      }

      // Format club events for display
      const formattedClubEvents = eventsFromClubs
        .filter(event => event !== null && event !== undefined) // Filter out null or undefined events
        .map(event => {
          try {
            console.log('Formatting club event:', event.id, event.titre);
            return formatEventClubData(event as EventClubData);
          } catch (error) {
            console.error('Error formatting club event:', error, event);
            return null;
          }
        })
        .filter(Boolean); // Filter out null results

      console.log('Formatted club events count:', formattedClubEvents.length);

      // Update state with fetched events
      setEvents(formattedRegularEvents);
      setClubEvents(formattedClubEvents);

      // Check which events the current user is participating in
      if (currentUserId) {
        try {
          // Récupérer les événements universitaires auxquels l'utilisateur participe
          const userEvents = await ParticipantService.getUserEvents(currentUserId);
          console.log('User regular events:', userEvents);

          // Récupérer les événements de club auxquels l'utilisateur participe
          const userClubEvents = await ParticipantClubService.getUserEvents(currentUserId);
          console.log('User club events:', userClubEvents);

          // Combiner les IDs des événements
          const participatingEventIds = [
            ...userEvents.map(event => {
              // Convertir l'ID en nombre pour éviter les problèmes de comparaison
              const id = event.id || event.eventId;
              return typeof id === 'string' ? parseInt(id, 10) : id;
            }),
            ...userClubEvents.map(event => {
              // Convertir l'ID en nombre pour éviter les problèmes de comparaison
              const id = event.id || event.eventClubId;
              return typeof id === 'string' ? parseInt(id, 10) : id;
            })
          ].filter(id => id !== undefined && id !== null && !isNaN(id));

          console.log('All participating event IDs:', participatingEventIds);

          if (participatingEventIds.length > 0) {
            setAttendingEvents(participatingEventIds);
          }
        } catch (error) {
          console.error('Error fetching user events:', error);
          // Continue without user events if this fails
        }
      }

      return true;
    } catch (error) {
      console.error('Error in refreshEvents:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events from backend
  useEffect(() => {
    // Utiliser la fonction refreshEvents pour charger les événements au chargement de la page
    refreshEvents();
  }, []);

  // Combine all events
  const allEvents = [...events, ...clubEvents];

  // Filter events based on search query, type and upcoming status
  const filteredEvents = allEvents.filter(event => {
    // Match search query in title, description or location
    const matchesQuery = searchQuery === '' ||
                        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

    // Match type - 'Tous' shows all events, otherwise match the specific type
    let matchesType = true;
    if (activeType === 'Event Club') {
      matchesType = event.source === 'club';
    } else if (activeType === 'Event Universitaire') {
      matchesType = event.source === 'university';
    }
    // Si activeType est 'Tous', on garde matchesType à true

    // Match upcoming status - if showUpcoming is true, only show upcoming events
    const matchesUpcoming = !showUpcoming || event.isUpcoming;

    return matchesQuery && matchesType && matchesUpcoming;
  });

  // Handle type change
  const handleTypeChange = (type: string) => {
    setActiveType(type);
  };

  // Handle toggle upcoming events
  const handleToggleUpcoming = () => {
    setShowUpcoming(!showUpcoming);
  };

  // Handle view event details
  const handleViewEventDetails = (event: FormattedEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  // Handle event creation
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Creating new event:', newEvent);

    try {
      // Format date and time for backend
      const dateTime = `${newEvent.date}T${newEvent.time}:00`;
      console.log('Formatted date time:', dateTime);

      // Create event using the appropriate service based on type
      let createdEvent;
      let formattedEvent;

      try {
        if (newEvent.type === 'Event Club') {
          // Create a club event
          console.log('Creating club event');
          createdEvent = await eventsClubsService.createEvent(
            currentUserId,
            {
              titre: newEvent.title,
              description: newEvent.description,
              lieu: newEvent.location,
              dateDebut: dateTime,
              dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), // 1 hour after start
              status: DEFAULT_EVENT_STATUS // Utiliser la constante pour le statut par défaut
            }
          );

          console.log('Club event created:', createdEvent);

          // Format for display
          formattedEvent = {
            id: createdEvent.id,
            title: createdEvent.titre,
            description: createdEvent.description,
            date: newEvent.date,
            time: newEvent.time,
            location: createdEvent.lieu || newEvent.location,
            image: createdEvent.image || '/placeholder.svg',
            organizer: 'Vous',
            attending: createdEvent.nbParticipants || 1,
            type: 'Event Club',
            isUpcoming: true,
            createurId: currentUserId, // Ajouter l'ID du créateur pour les permissions
            source: 'club' // Ajouter la source pour le filtrage
          };

          setClubEvents([formattedEvent, ...clubEvents]);
        } else {
          // Create a regular event (Event Universitaire)
          console.log('Creating university event');
          createdEvent = await EventsService.createEvent(
            currentUserId,
            {
              titre: newEvent.title,
              description: newEvent.description,
              lieu: newEvent.location,
              dateDebut: dateTime,
              dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), // 1 hour after start
              status: DEFAULT_EVENT_STATUS // Utiliser la constante pour le statut par défaut
            }
          );

          console.log('University event created:', createdEvent);

          // Format for display
          formattedEvent = {
            id: createdEvent.id,
            title: createdEvent.titre,
            description: createdEvent.description,
            date: newEvent.date,
            time: newEvent.time,
            location: createdEvent.lieu || newEvent.location,
            image: createdEvent.image || '/placeholder.svg',
            organizer: 'Vous',
            attending: createdEvent.nbParticipants || 1,
            type: 'Event Universitaire',
            isUpcoming: true,
            createurId: currentUserId, // Ajouter l'ID du créateur pour les permissions
            source: 'university' // Ajouter la source pour le filtrage
          };

          setEvents([formattedEvent, ...events]);
        }
      } catch (createError) {
        console.error('Error creating event:', createError);

        // If we're in development, simulate success
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: simulating successful event creation');

          // Create a mock event with a random ID
          createdEvent = {
            id: Math.floor(Math.random() * 1000),
            titre: newEvent.title,
            description: newEvent.description,
            lieu: newEvent.location,
            dateDebut: dateTime,
            dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(),
            status: DEFAULT_EVENT_STATUS, // Utiliser la constante pour le statut par défaut
            nbParticipants: 1,
            createurId: currentUserId
          };

          // Format for display
          formattedEvent = {
            id: createdEvent.id,
            title: createdEvent.titre,
            description: createdEvent.description,
            date: newEvent.date,
            time: newEvent.time,
            location: createdEvent.lieu || newEvent.location,
            image: createdEvent.image || '/placeholder.svg',
            organizer: 'Vous',
            attending: createdEvent.nbParticipants || 1,
            type: newEvent.type,
            isUpcoming: true,
            createurId: currentUserId, // Ajouter l'ID du créateur pour les permissions
            source: newEvent.type === 'Event Club' ? 'club' : 'university' // Ajouter la source pour le filtrage
          };

          if (newEvent.type === 'Event Club') {
            setClubEvents([formattedEvent, ...clubEvents]);
          } else {
            setEvents([formattedEvent, ...events]);
          }
        } else {
          throw createError;
        }
      }

      // Automatically join the event
      try {
        if (createdEvent && createdEvent.id) {
          console.log('Joining newly created event:', createdEvent.id);
          await ParticipantService.joinEvent(currentUserId, createdEvent.id);
          setAttendingEvents([...attendingEvents, createdEvent.id]);
        }
      } catch (joinError) {
        console.error('Error joining created event:', joinError);
        // Continue even if joining fails
        if (createdEvent && createdEvent.id) {
          setAttendingEvents([...attendingEvents, createdEvent.id]);
        }
      }

      setIsCreateEventOpen(false);

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'Event Club'
      });

      // Rafraîchir la liste des événements pour s'assurer que le nouvel événement est affiché
      console.log('Refreshing events after creation...');
      refreshEvents().then(success => {
        if (success) {
          console.log('Events refreshed successfully after creation');
        } else {
          console.error('Failed to refresh events after creation');
        }
      });

      toast({
        title: "Événement créé",
        description: "Votre événement a été créé avec succès !",
      });
    } catch (error) {
      console.error('Error in handleCreateEvent:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event attendance
  const handleAttendEvent = async (event: FormattedEvent) => {
    if (!currentUserId) {
      toast({
        title: "Erreur d'authentification",
        description: "Veuillez vous connecter pour participer à cet événement",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Handling attendance for event ${event.id}, user ${currentUserId}, type ${event.type}`);

      // Déterminer si c'est un événement de club ou un événement universitaire
      const isClubEvent = event.source === 'club';

      if (attendingEvents.includes(event.id)) {
        // Leave event
        console.log(`User ${currentUserId} is leaving event ${event.id} (${event.type})`);
        try {
          if (isClubEvent) {
            // Utiliser le service pour les événements de club
            await ParticipantClubService.leaveEvent(currentUserId, event.id);
          } else {
            // Utiliser le service pour les événements universitaires
            await ParticipantService.leaveEvent(currentUserId, event.id);
          }

          setAttendingEvents(attendingEvents.filter(id => id !== event.id));

          toast({
            title: "Participation annulée",
            description: "Vous ne participez plus à cet événement.",
          });
        } catch (leaveError) {
          console.error('Error leaving event:', leaveError);

          // Log détaillé de l'erreur
          if (leaveError.response) {
            console.error('Response status:', leaveError.response.status);
            console.error('Response data:', leaveError.response.data);
          } else if (leaveError.request) {
            console.error('No response received:', leaveError.request);
          } else {
            console.error('Error setting up request:', leaveError.message);
          }

          // If we're in development, simulate success
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: simulating successful leave event');
            setAttendingEvents(attendingEvents.filter(id => id !== event.id));

            toast({
              title: "Participation annulée",
              description: "Vous ne participez plus à cet événement.",
            });
          } else {
            throw leaveError;
          }
        }
      } else {
        // Join event
        console.log(`User ${currentUserId} is joining event ${event.id} (${event.type})`);
        try {
          if (isClubEvent) {
            // Utiliser le service pour les événements de club
            await ParticipantClubService.joinEvent(currentUserId, event.id);
          } else {
            // Utiliser le service pour les événements universitaires
            await ParticipantService.joinEvent(currentUserId, event.id);
          }

          setAttendingEvents([...attendingEvents, event.id]);

          toast({
            title: "Participation confirmée",
            description: "Votre participation à l'événement a été enregistrée !",
          });
        } catch (joinError) {
          console.error('Error joining event:', joinError);

          // Log détaillé de l'erreur
          if (joinError.response) {
            console.error('Response status:', joinError.response.status);
            console.error('Response data:', joinError.response.data);
          } else if (joinError.request) {
            console.error('No response received:', joinError.request);
          } else {
            console.error('Error setting up request:', joinError.message);
          }

          // If we're in development, simulate success
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: simulating successful join event');
            setAttendingEvents([...attendingEvents, event.id]);

            toast({
              title: "Participation confirmée",
              description: "Votre participation à l'événement a été enregistrée !",
            });
          } else {
            throw joinError;
          }
        }
      }

      // Rafraîchir les événements pour mettre à jour le nombre de participants
      refreshEvents();
    } catch (error) {
      console.error('Error updating event participation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour votre participation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    // Set the selected event and populate the form
    setSelectedEvent(event);

    // Format date and time for the form
    const dateTime = event.date && event.time
      ? {
          date: event.date,
          time: event.time
        }
      : {
          date: new Date().toISOString().split('T')[0],
          time: '12:00'
        };

    setNewEvent({
      id: event.id,
      title: event.title || '',
      description: event.description || '',
      date: dateTime.date,
      time: dateTime.time,
      location: event.location || '',
      type: event.type || 'Event Club'
    });

    setIsEditEventOpen(true);
  };

  // Handle delete event
  const handleDeleteEvent = (event) => {
    setSelectedEvent(event);
    setIsDeleteConfirmOpen(true);
  };

  // Save edited event
  const saveEditedEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Erreur d'authentification",
        description: "Impossible d'identifier l'utilisateur. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Updating event:', newEvent);

    try {
      // Format date and time for backend
      const dateTime = `${newEvent.date}T${newEvent.time}:00`;

      // Prepare event data
      const eventData = {
        titre: newEvent.title,
        description: newEvent.description,
        lieu: newEvent.location,
        dateDebut: dateTime,
        dateFin: new Date(new Date(dateTime).getTime() + 3600000).toISOString(), // 1 hour after start
        status: DEFAULT_EVENT_STATUS // Utiliser la constante pour le statut par défaut
      };

      console.log(`Updating event with ID ${newEvent.id} as user ${currentUserId}`);

      let updatedEvent;

      try {
        // Update the event using the appropriate service
        const selectedEventSource = selectedEvent?.source;
        if (selectedEventSource === 'club') {
          // Utiliser le service pour mettre à jour l'événement de club
          updatedEvent = await eventsClubsService.updateEvent(newEvent.id, eventData, currentUserId);
        } else {
          // Utiliser le service pour mettre à jour l'événement
          updatedEvent = await EventsService.updateEvent(newEvent.id, eventData, currentUserId);
        }

        console.log('Event updated successfully:', updatedEvent);
      } catch (updateError) {
        console.error('Error in update API call:', updateError);
        if (updateError.response) {
          console.error('Response status:', updateError.response.status);
          console.error('Response data:', updateError.response.data);
        }
        throw updateError;
      }

      // Update the events list
      try {
        // Fetch regular events
        let regularEvents = await EventsService.getAllEvents();

        // Format events for display using the utility functions with error handling
        const formattedRegularEvents = regularEvents.map(event => {
          if (!event) return null;
          try {
            return formatEventData(event as EventData);
          } catch (error) {
            console.error('Error formatting regular event:', error, event);
            // Retourner un événement formaté manuellement en cas d'erreur
            return {
              id: event.id || 0,
              title: event.titre || 'Événement sans titre',
              description: event.description || 'Aucune description disponible',
              date: event.dateDebut ? event.dateDebut.split('T')[0] : new Date().toISOString().split('T')[0],
              time: event.dateDebut ? (event.dateDebut.split('T')[1]?.substring(0, 5) || '00:00') : '00:00',
              location: event.lieu || 'Campus',
              image: event.image || '/placeholder.svg',
              organizer: 'Administration',
              attending: event.nbParticipants || 0,
              type: 'Event Universitaire',
              isUpcoming: event.dateDebut ? new Date(event.dateDebut) > new Date() : true,
              createurId: event.createurId || currentUserId,
              source: 'university'
            };
          }
        }).filter(Boolean);

        // Fetch club events
        let eventsFromClubs = await eventsClubsService.getAllEventsClubs();

        // Format club events for display using the utility functions with error handling
        const formattedClubEvents = eventsFromClubs.map(event => {
          if (!event) return null;
          try {
            return formatEventClubData(event as EventClubData);
          } catch (error) {
            console.error('Error formatting club event:', error, event);
            // Retourner un événement formaté manuellement en cas d'erreur
            return {
              id: event.id || 0,
              title: event.titre || 'Événement sans titre',
              description: event.description || 'Aucune description disponible',
              date: event.dateDebut ? event.dateDebut.split('T')[0] : new Date().toISOString().split('T')[0],
              time: event.dateDebut ? (event.dateDebut.split('T')[1]?.substring(0, 5) || '00:00') : '00:00',
              location: event.lieu || 'Campus',
              image: event.image || '/placeholder.svg',
              organizer: event.nomClub || 'Club',
              attending: event.nbParticipants || 0,
              type: 'Event Club',
              isUpcoming: event.dateDebut ? new Date(event.dateDebut) > new Date() : true,
              createurId: event.createurId || currentUserId,
              source: 'club'
            };
          }
        }).filter(Boolean);

        setEvents(formattedRegularEvents);
        setClubEvents(formattedClubEvents);
      } catch (fetchError) {
        console.error('Error fetching events after update:', fetchError);
        // Continue with the flow even if refresh fails
      }

      setIsEditEventOpen(false);

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'Event Club',
        id: null
      });

      toast({
        title: "Événement mis à jour",
        description: "Votre événement a été mis à jour avec succès !",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    if (!selectedEvent || !selectedEvent.id) return;

    if (!currentUserId) {
      toast({
        title: "Erreur d'authentification",
        description: "Impossible d'identifier l'utilisateur. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Deleting event with ID ${selectedEvent.id} as user ${currentUserId}`);

      try {
        // Delete the event using the appropriate service
        if (selectedEvent.source === 'club') {
          // Utiliser le service pour supprimer l'événement de club
          await eventsClubsService.deleteEvent(selectedEvent.id, currentUserId);
        } else {
          // Utiliser le service pour supprimer l'événement
          await EventsService.deleteEvent(selectedEvent.id, currentUserId);
        }

        console.log('Event deleted successfully');
      } catch (deleteError) {
        console.error('Error in delete API call:', deleteError);
        if (deleteError.response) {
          console.error('Response status:', deleteError.response.status);
          console.error('Response data:', deleteError.response.data);
        }
        throw deleteError;
      }

      // Update the events list
      if (selectedEvent.source === 'club') {
        setClubEvents(clubEvents.filter(event => event.id !== selectedEvent.id));
      } else {
        setEvents(events.filter(event => event.id !== selectedEvent.id));
      }

      // Retirer l'événement de la liste des événements auxquels l'utilisateur participe
      if (attendingEvents.includes(selectedEvent.id)) {
        setAttendingEvents(attendingEvents.filter(id => id !== selectedEvent.id));
      }

      setIsDeleteConfirmOpen(false);

      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer l\'événement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Événements</h1>
        <p className="page-subtitle">
          Découvrez et participez aux événements du campus
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          {/* Types */}
          <div className="flex overflow-x-auto pb-2 space-x-2 w-full md:w-auto">
            {eventTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeType === type
                    ? 'bg-primary text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Rechercher un événement..."
              className="pl-10 pr-4 py-2 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Additional filters */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleUpcoming}
              className={`flex items-center px-4 py-2 rounded-lg ${
                showUpcoming ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <CalendarCheck size={18} className="mr-2" />
              Événements à venir uniquement
            </button>
          </div>

          {/* <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Créer un événement
          </button> */}
        </div>
      </div>

      {/* Events Masonry Grid */}
      <div className="masonry-grid">
        {filteredEvents.map((event, index) => (
          <div
            key={event.id}
            className="mb-6 inline-block w-full animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-border card-hover">
              {/* Event Image */}
              <div
                className="h-40 bg-muted bg-cover bg-center relative"
                style={{ backgroundImage: `url(${event.image})` }}
              >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Event type badge - bottom left */}
                <div className="absolute bottom-3 left-3 z-10">
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {event.type}
                  </div>
                </div>

                {/* Edit and Delete buttons for moderators - top right */}
                {isModerator && currentUserId && event.createurId && event.createurId === currentUserId && (
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      title="Modifier l'événement"
                    >
                      <Edit size={14} className="text-primary" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event);
                      }}
                      title="Supprimer l'événement"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>

                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-2" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={14} className="mr-2" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users size={14} className="mr-2" />
                    <span>{event.attending} participants</span>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-4 line-clamp-3">{event.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Organisé par {event.organizer}
                  </span>

                  <div className="flex gap-2">
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <span className="text-xs text-muted-foreground mr-auto">
                        ID: {event.id}, Créateur: {event.createurId}
                      </span>
                    )}

                    {/* Participate button for all users */}
                    {event.isUpcoming && (
                      <Button
                        variant={attendingEvents.includes(event.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttendEvent(event);
                        }}
                      >
                        {attendingEvents.includes(event.id) ? "Je participe" : "Participer"}
                      </Button>
                    )}

                    {/* Info button for all users */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEventDetails(event);
                      }}
                      title="Voir les détails"
                    >
                      <Info size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Calendar size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-xl font-medium mb-2">Aucun événement trouvé</h3>
          <p className="text-muted-foreground mb-6">
            Essayez une autre recherche pour trouver des événements.
          </p>

        </div>
      )}



      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="event-title" className="block text-sm font-medium mb-1">
                Titre de l'événement *
              </label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Titre de votre événement"
                required
              />
            </div>

            <div>
              <label htmlFor="event-description" className="block text-sm font-medium mb-1">
                Description *
              </label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Décrivez votre événement"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-date" className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="event-time" className="block text-sm font-medium mb-1">
                  Heure *
                </label>
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="event-location" className="block text-sm font-medium mb-1">
                Lieu *
              </label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                placeholder="Lieu de l'événement"
                required
              />
            </div>

            <div>
              <label htmlFor="event-type" className="block text-sm font-medium mb-1">
                Type d'événement
              </label>
              <select
                id="event-type"
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="input-field"
              >
                <option value="Event Club">Event Club</option>
                <option value="Event Universitaire">Event Universitaire</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateEventOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={isLoading}
            >
              {isLoading ? 'Création en cours...' : 'Créer l\'événement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="edit-event-title" className="block text-sm font-medium mb-1">
                Titre de l'événement *
              </label>
              <Input
                id="edit-event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Titre de votre événement"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-event-description" className="block text-sm font-medium mb-1">
                Description *
              </label>
              <Textarea
                id="edit-event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Décrivez votre événement"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-event-date" className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-event-time" className="block text-sm font-medium mb-1">
                  Heure *
                </label>
                <Input
                  id="edit-event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-event-location" className="block text-sm font-medium mb-1">
                Lieu *
              </label>
              <Input
                id="edit-event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                placeholder="Lieu de l'événement"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-event-type" className="block text-sm font-medium mb-1">
                Type d'événement
              </label>
              <select
                id="edit-event-type"
                value={newEvent.type}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                className="input-field"
                disabled // Type cannot be changed when editing
              >
                <option value="Event Club">Event Club</option>
                <option value="Event Universitaire">Event Universitaire</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditEventOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={saveEditedEvent}
              disabled={isLoading}
            >
              {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedEvent && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Section - Left side on desktop */}
              <div className="w-full md:w-2/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10" />
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedEvent.type}
                  </span>
                </div>

                {/* Mobile only title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 md:hidden">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                  <div className="flex items-center text-white/80">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">{formatDate(selectedEvent.date)} • {selectedEvent.time}</span>
                  </div>
                </div>
              </div>

              {/* Content Section - Right side on desktop */}
              <div className="w-full md:w-3/5 p-6 overflow-y-auto">
                {/* Desktop only title */}
                <div className="hidden md:block mb-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                  </DialogHeader>
                </div>

                {/* Event details */}
                <div className="space-y-6">
                  {/* Info cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar size={18} className="mr-2 text-primary" />
                        <h3 className="font-medium">Date et heure</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedEvent.date)}</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.time}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MapPin size={18} className="mr-2 text-primary" />
                        <h3 className="font-medium">Lieu</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>

                  {/* Organizer and participants */}
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Organisé par</p>
                        <p className="font-medium">{selectedEvent.organizer}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Participants</p>
                        <p className="font-medium">{selectedEvent.attending} inscrits</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">À propos de cet événement</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">{selectedEvent.description}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1"
                        variant={attendingEvents.includes(selectedEvent.id) ? "destructive" : "default"}
                        onClick={() => handleAttendEvent(selectedEvent)}
                        size="lg"
                      >
                        {attendingEvents.includes(selectedEvent.id) ? (
                          <>
                            <Users size={18} className="mr-2" />
                            Annuler ma participation
                          </>
                        ) : (
                          <>
                            <Users size={18} className="mr-2" />
                            Participer à cet événement
                          </>
                        )}
                      </Button>

                      {/* Edit and Delete buttons for moderators who created the event */}
                      {isModerator && currentUserId && selectedEvent.createurId && selectedEvent.createurId === currentUserId && (
                        <>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setIsEventDetailsOpen(false);
                              handleEditEvent(selectedEvent);
                            }}
                          >
                            <Edit size={18} className="mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setIsEventDetailsOpen(false);
                              handleDeleteEvent(selectedEvent);
                            }}
                          >
                            <Trash2 size={18} className="mr-2" />
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="py-4">
              <h3 className="font-medium">{selectedEvent.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEvent}
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsPage;
