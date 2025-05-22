import React, { useState, useEffect } from 'react';
import { EventClubDto, EventStatus } from '@/types/club';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon, UsersIcon, PlusIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/hooks/useAuth';
import { EventForm } from './EventForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { clubService } from '@/services/clubService';

interface ClubEventsProps {
  clubId: number;
  isAdmin: boolean;
}

export function ClubEvents({ clubId, isAdmin }: ClubEventsProps) {
  const [events, setEvents] = useState<EventClubDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  // Fonction pour récupérer les événements du club
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await clubService.getClubEvents(clubId);
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des événements:', err);
      setError('Impossible de charger les événements du club.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les événements au chargement du composant
  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPP à HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString;
    }
  };

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusBadgeVariant = (status: EventStatus) => {
    switch (status) {
      case EventStatus.AVENIR:
        return 'default';
      case EventStatus.EN_COURS:
        return 'success';
      case EventStatus.PASSE:
        return 'secondary';
      case EventStatus.ANNULE:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Fonction pour traduire le statut
  const translateStatus = (status: EventStatus) => {
    switch (status) {
      case EventStatus.AVENIR:
        return 'À venir';
      case EventStatus.EN_COURS:
        return 'En cours';
      case EventStatus.PASSE:
        return 'Passé';
      case EventStatus.ANNULE:
        return 'Annulé';
      default:
        return status;
    }
  };

  // Fonction pour supprimer un événement
  const handleDeleteEvent = async (eventId: number) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer un événement",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      await clubService.deleteEvent(eventId, Number(user.id));
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
      fetchEvents(); // Rafraîchir la liste des événements
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'événement",
        variant: "destructive",
      });
    }
  };

  // Filtrer les événements par statut
  const upcomingEvents = events.filter(event => event.status === EventStatus.AVENIR);
  const ongoingEvents = events.filter(event => event.status === EventStatus.EN_COURS);
  const pastEvents = events.filter(event => event.status === EventStatus.PASSE);

  // Fonction pour afficher un événement
  const renderEvent = (event: EventClubDto) => (
    <Card key={event.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{event.titre}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Du {formatDate(event.dateDebut)} au {formatDate(event.dateFin)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{event.lieu}</span>
              </div>
              {event.nbParticipants !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{event.nbParticipants} participant{event.nbParticipants !== 1 ? 's' : ''}</span>
                </div>
              )}
            </CardDescription>
          </div>
          {event.status && (
            <Badge variant={getStatusBadgeVariant(event.status as EventStatus)}>
              {translateStatus(event.status as EventStatus)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
        {event.image && (
          <div className="mt-4">
            <img
              src={event.image}
              alt={event.titre}
              className="rounded-md w-full h-48 object-cover"
            />
          </div>
        )}
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteEvent(event.id!)}
          >
            Supprimer
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Événements du club</h2>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer un nouvel événement</DialogTitle>
                <DialogDescription>
                  Remplissez le formulaire pour créer un nouvel événement pour votre club.
                </DialogDescription>
              </DialogHeader>
              <EventForm
                clubId={clubId}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchEvents();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <p>Chargement des événements...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun événement n'a été créé pour ce club.</p>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">À venir ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="ongoing">En cours ({ongoingEvents.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({pastEvents.length})</TabsTrigger>
            <TabsTrigger value="all">Tous ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(renderEvent)
            ) : (
              <p>Aucun événement à venir.</p>
            )}
          </TabsContent>

          <TabsContent value="ongoing">
            {ongoingEvents.length > 0 ? (
              ongoingEvents.map(renderEvent)
            ) : (
              <p>Aucun événement en cours.</p>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastEvents.length > 0 ? (
              pastEvents.map(renderEvent)
            ) : (
              <p>Aucun événement passé.</p>
            )}
          </TabsContent>

          <TabsContent value="all">
            {events.map(renderEvent)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
