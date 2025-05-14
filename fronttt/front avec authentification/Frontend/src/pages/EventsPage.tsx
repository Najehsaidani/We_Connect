
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Clock, Plus, Users, Filter, CalendarCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Sample events data
const initialEvents = [
  {
    id: 1,
    title: 'Soirée d\'intégration',
    description: 'Rejoignez-nous pour la soirée d\'intégration annuelle et faites connaissance avec les nouveaux étudiants !',
    date: '2025-05-15',
    time: '21:00',
    location: 'Grande Salle du Campus',
    image: '/placeholder.svg',
    organizer: 'BDE',
    attending: 120,
    type: 'Social',
    isUpcoming: true
  },
  {
    id: 2,
    title: 'Conférence Tech Innovation',
    description: 'Venez assister à notre conférence sur les dernières innovations technologiques avec des intervenants de grandes entreprises.',
    date: '2025-05-10',
    time: '14:00',
    location: 'Amphithéâtre A',
    image: '/placeholder.svg',
    organizer: 'Club Tech',
    attending: 85,
    type: 'Académique',
    isUpcoming: true
  },
  {
    id: 3,
    title: 'Tournoi de football interfacultés',
    description: 'Compétition amicale entre les différentes facultés de l\'université.',
    date: '2025-05-20',
    time: '10:00',
    location: 'Terrain de sport',
    image: '/placeholder.svg',
    organizer: 'Association Sportive',
    attending: 65,
    type: 'Sport',
    isUpcoming: true
  },
  {
    id: 4,
    title: 'Atelier CV et recherche de stage',
    description: 'Conseils pratiques pour optimiser votre CV et réussir votre recherche de stage.',
    date: '2025-05-08',
    time: '16:00',
    location: 'Salle 302',
    image: '/placeholder.svg',
    organizer: 'Service Carrières',
    attending: 40,
    type: 'Carrière',
    isUpcoming: true
  },
  {
    id: 5,
    title: 'Projection film débat',
    description: 'Projection suivie d\'un débat autour du film documentaire "La Vie étudiante".',
    date: '2025-04-15',
    time: '18:30',
    location: 'Salle de projection',
    image: '/placeholder.svg',
    organizer: 'Club Cinéma',
    attending: 55,
    type: 'Culture',
    isUpcoming: false
  },
  {
    id: 6,
    title: 'Concert de fin d\'année',
    description: 'Les talents musicaux de l\'université se produisent pour le concert annuel.',
    date: '2025-06-20',
    time: '20:00',
    location: 'Auditorium',
    image: '/placeholder.svg',
    organizer: 'Club Musique',
    attending: 200,
    type: 'Culture',
    isUpcoming: true
  },
  {
    id: 7,
    title: 'Hackathon 48h',
    description: 'Un week-end de code intensif pour résoudre des problèmes réels et remporter des prix.',
    date: '2025-05-25',
    time: '09:00',
    location: 'Bâtiment des Sciences',
    image: '/placeholder.svg',
    organizer: 'Département Informatique',
    attending: 80,
    type: 'Académique',
    isUpcoming: true
  }
];

// Event types for filtering
const eventTypes = [
  'Tous',
  'Social',
  'Académique',
  'Sport',
  'Culture',
  'Carrière'
];

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const EventsPage = () => {
  const [events, setEvents] = useState(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Tous');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState<number[]>([]);
  
  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'Social'
  });
  
  const { toast } = useToast();

  // Filter events based on search query, type and upcoming status
  const filteredEvents = events.filter(event => {
    const matchesQuery = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeType === 'Tous' || event.type === activeType;
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

  // Handle event creation
  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const createdEvent = {
        id: events.length + 1,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        image: '/placeholder.svg',
        organizer: 'Utilisateur',
        attending: 1,
        type: newEvent.type,
        isUpcoming: true
      };
      
      setEvents([createdEvent, ...events]);
      setAttendingEvents([...attendingEvents, createdEvent.id]);
      setIsLoading(false);
      setIsCreateEventOpen(false);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'Social'
      });
      
      toast({
        title: "Événement créé",
        description: "Votre événement a été créé avec succès !",
      });
    }, 1000);
  };

  // Handle event attendance
  const handleAttendEvent = (eventId: number) => {
    if (attendingEvents.includes(eventId)) {
      setAttendingEvents(attendingEvents.filter(id => id !== eventId));
      toast({
        title: "Participation annulée",
        description: "Vous ne participez plus à cet événement.",
      });
    } else {
      setAttendingEvents([...attendingEvents, eventId]);
      toast({
        title: "Participation confirmée",
        description: "Votre participation à l'événement a été enregistrée !",
      });
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
          <div className="flex items-center">
            <button
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
                className="h-40 bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${event.image})` }}
              >
                <div className="w-full h-full flex items-end p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {event.type}
                  </div>
                </div>
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
                  
                  {event.isUpcoming && (
                    <Button
                      variant={attendingEvents.includes(event.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleAttendEvent(event.id)}
                    >
                      {attendingEvents.includes(event.id) ? "Je participe" : "Participer"}
                    </Button>
                  )}
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
            Essayez une autre recherche ou créez votre propre événement !
          </p>
          <Button onClick={() => setIsCreateEventOpen(true)}>
            <Plus size={16} className="mr-1" /> Créer un événement
          </Button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreateEventOpen(true)}
        className="floating-action-button"
        aria-label="Créer un événement"
      >
        <Plus size={24} />
      </button>

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
                <option value="Social">Social</option>
                <option value="Académique">Académique</option>
                <option value="Sport">Sport</option>
                <option value="Culture">Culture</option>
                <option value="Carrière">Carrière</option>
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
    </div>
  );
};

export default EventsPage;
