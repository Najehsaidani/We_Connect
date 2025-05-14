
import React, { useState, ChangeEvent } from 'react';
import { User, Mail, Phone, MapPin, Book, Briefcase, Calendar, Edit, Save, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // User profile data
  const [profile, setProfile] = useState({
    name: 'Alex Dubois',
    email: 'alex.dubois@universite.fr',
    phone: '06 12 34 56 78',
    location: 'Paris, France',
    bio: 'Étudiant en Master d\'Informatique. Passionné de développement web et d\'intelligence artificielle. Toujours à la recherche de nouveaux projets et défis.',
    pronouns: 'il/lui',
    faculty: 'Sciences et Technologies',
    year: '2e année de Master',
    specialization: 'Intelligence Artificielle',
    joinDate: 'Septembre 2023',
    interests: ['Programmation', 'IA', 'Jeux vidéo', 'Randonnée', 'Photographie'],
    avatar: '/placeholder.svg'
  });

  // Sample activities
  const activities = [
    { id: 1, type: 'post', title: 'A partagé une publication', content: 'Quelqu\'un aurait des notes du dernier cours de ML ?', date: 'Il y a 2 jours' },
    { id: 2, type: 'event', title: 'Va participer à un événement', content: 'Hackathon 48h', date: 'Dans 3 jours' },
    { id: 3, type: 'club', title: 'A rejoint un club', content: 'Club Tech', date: 'Il y a 1 semaine' }
  ];

  // Sample courses
  const courses = [
    { id: 1, code: 'INFO601', name: 'Machine Learning Avancé', professor: 'Prof. Martin', grade: 'A' },
    { id: 2, code: 'INFO602', name: 'Développement Web Full Stack', professor: 'Prof. Dubois', grade: 'A-' },
    { id: 3, code: 'INFO603', name: 'Théorie des Graphes', professor: 'Prof. Leclerc', grade: 'B+' },
    { id: 4, code: 'INFO604', name: 'Sécurité Informatique', professor: 'Prof. Roux', grade: 'A' }
  ];

  // Handle profile update
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été mises à jour avec succès.',
    });
  };

  // Handle profile field update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      
      // Simulate upload delay
      setTimeout(() => {
        // In a real app, you would upload to a server here
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            setProfile(prev => ({ ...prev, avatar: event.target.result as string }));
            toast({
              title: 'Photo de profil mise à jour',
              description: 'Votre photo de profil a été mise à jour avec succès.',
            });
          }
        };
        reader.readAsDataURL(e.target.files[0]);
        setUploadingImage(false);
      }, 1500);
    }
  };

  return (
    <div className="page-container">
      {/* Header with profile cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl mb-16 overflow-hidden">
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-md">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <label htmlFor="avatar-upload" className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                  <Camera size={20} className="text-white" />
                </label>
                <input 
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingImage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile info and tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column - Profile info */}
        <div className="w-full md:w-1/3">
          <Card className="mb-6 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.pronouns}</CardDescription>
              </div>
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm" 
                className="flex items-center"
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Save size={16} className="mr-1" /> Enregistrer
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-1" /> Modifier
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Nom complet
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      Localisation
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="pronouns" className="block text-sm font-medium mb-1">
                      Pronoms
                    </label>
                    <Input
                      id="pronouns"
                      name="pronouns"
                      value={profile.pronouns}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">
                      Biographie
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Regular profile info */}
                  <div className="flex items-start space-x-2">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">À propos</h4>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Academic Info Card */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Informations académiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Book className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{profile.faculty}</p>
                  <p className="text-sm text-muted-foreground">{profile.year}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Spécialisation</p>
                  <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Inscrit depuis</p>
                  <p className="text-sm text-muted-foreground">{profile.joinDate}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Centres d'intérêt</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="bg-muted px-2 py-1 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Content tabs */}
        <div className="w-full md:w-2/3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="courses">Cours</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-border"
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{activity.title}</h3>
                      <p className="text-foreground my-1">{activity.content}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Aucune activité récente</h3>
                  <p className="text-muted-foreground">
                    Vos activités récentes apparaîtront ici.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cours actuels</CardTitle>
                  <CardDescription>Les cours auxquels vous êtes inscrit ce semestre</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div 
                        key={course.id} 
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.code} • {course.professor}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full font-medium text-sm ${
                          course.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          course.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          course.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.grade}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">Voir tous les cours</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du compte</CardTitle>
                  <CardDescription>Gérez vos préférences et paramètres de confidentialité</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="email-notif">Notifications par email</label>
                        <input type="checkbox" id="email-notif" className="toggle" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="message-notif">Notifications de messages</label>
                        <input type="checkbox" id="message-notif" className="toggle" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="event-notif">Rappels d'événements</label>
                        <input type="checkbox" id="event-notif" className="toggle" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Confidentialité</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="profile-public">Profil public</label>
                        <input type="checkbox" id="profile-public" className="toggle" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="show-email">Afficher mon email</label>
                        <input type="checkbox" id="show-email" className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="show-phone">Afficher mon téléphone</label>
                        <input type="checkbox" id="show-phone" className="toggle" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Sécurité</h3>
                    <Button variant="outline">Changer de mot de passe</Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="text-destructive">
                    <X size={16} className="mr-1" /> Désactiver le compte
                  </Button>
                  <Button>Enregistrer les modifications</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
