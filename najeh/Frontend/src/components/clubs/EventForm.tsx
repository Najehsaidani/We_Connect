import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { clubService } from '@/services/clubService';

// Définir le schéma de validation
const eventSchema = z.object({
  titre: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères' }),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères' }),
  lieu: z.string().min(3, { message: 'Le lieu doit contenir au moins 3 caractères' }),
  dateDebut: z.date({ required_error: 'La date de début est requise' }),
  dateFin: z.date({ required_error: 'La date de fin est requise' }),
}).refine(data => data.dateFin > data.dateDebut, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["dateFin"],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  clubId: number;
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function EventForm({ clubId, onSuccess, initialData, isEditing = false }: EventFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Préparer les valeurs par défaut du formulaire
  console.log("Données initiales pour le formulaire:", initialData);

  // Fonction pour convertir une chaîne ISO en objet Date
  const parseDate = (dateString: string | undefined): Date => {
    if (!dateString) return new Date(new Date().setHours(new Date().getHours() + 1));
    try {
      return new Date(dateString);
    } catch (error) {
      console.error("Erreur lors de la conversion de la date:", error);
      return new Date(new Date().setHours(new Date().getHours() + 1));
    }
  };

  const defaultValues = initialData ? {
    titre: initialData.titre || '',
    description: initialData.description || '',
    lieu: initialData.lieu || '',
    dateDebut: parseDate(initialData.dateDebut),
    dateFin: parseDate(initialData.dateFin),
  } : {
    titre: '',
    description: '',
    lieu: '',
    dateDebut: new Date(new Date().setHours(new Date().getHours() + 1)),
    dateFin: new Date(new Date().setHours(new Date().getHours() + 3)),
  };

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  async function onSubmit(data: EventFormValues) {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour gérer un événement",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convertir les dates en format ISO pour l'API
      const eventData: any = {
        ...data,
        dateDebut: data.dateDebut.toISOString(),
        dateFin: data.dateFin.toISOString(),
      };

      if (isEditing && initialData?.id) {
        // Mettre à jour un événement existant
        console.log(`Mise à jour de l'événement ${initialData.id}`, eventData);
        console.log("Données complètes pour la mise à jour:", {
          id: initialData.id,
          createurId: Number(user.id),
          eventData,
          clubId: initialData.clubId || clubId
        });

        // S'assurer que clubId est présent dans les données
        if (!eventData.clubId) {
          eventData.clubId = initialData.clubId || clubId;
        }

        // S'assurer que createurId est présent dans les données
        eventData.createurId = Number(user.id);

        await clubService.updateEvent(initialData.id, Number(user.id), eventData);

        toast({
          title: "Événement mis à jour",
          description: "Votre événement a été mis à jour avec succès",
        });
      } else {
        // Créer un nouvel événement
        console.log(`Création d'un nouvel événement pour le club ${clubId}`, eventData);
        await clubService.createEvent(clubId, Number(user.id), eventData);

        toast({
          title: "Événement créé",
          description: "Votre événement a été créé avec succès",
        });
      }

      // Réinitialiser le formulaire
      form.reset();

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`Erreur lors de ${isEditing ? 'la mise à jour' : 'la création'} de l'événement:`, error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de ${isEditing ? 'la mise à jour' : 'la création'} de l'événement`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Modifier l'événement" : "Créer un événement"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifiez les informations de l'événement"
            : "Organisez un événement pour votre club"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'événement</FormLabel>
                  <FormControl>
                    <Input placeholder="Soirée d'intégration, Conférence, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre événement en détail..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lieu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse ou lieu de l'événement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateDebut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date et heure de début</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP 'à' HH:mm", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={fr}
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date et heure de fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP 'à' HH:mm", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={fr}
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? (isEditing ? "Mise à jour en cours..." : "Création en cours...")
                  : (isEditing ? "Mettre à jour l'événement" : "Créer l'événement")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
