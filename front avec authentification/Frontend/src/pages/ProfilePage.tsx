import React, { useState, useEffect, ChangeEvent } from 'react';
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
import { userService } from '@/services/userService';
import useAuth  from '@/hooks/useAuth'; // Add this import

const ProfilePage = () => {
  const { toast } = useToast();
  const { email, refreshAuth } = useAuth(); // Get email from auth context
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // User profile data
  const [profile, setProfile] = useState({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    specialization: '',
    avatar: '/placeholder.svg'
  });

  // Load user data on mount or email change
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // if (!email) {
        //   toast({ 
        //     title: 'Erreur', 
        //     description: 'Utilisateur non authentifié' 
        //   });
        //   // return;
        // }

        const userData = await userService.getUserByEmail(email);
        console.log(userData); 
        setProfile({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phoneNumber || '',
          location: userData.address || '',
          bio: userData.biographie || '',
          specialization: userData.departement || '',
          avatar: userData.image 
            ? `data:image/jpeg;base64,${userData.image}`
            : '/placeholder.svg'
        });
      } catch (error) {
        toast({ 
          title: 'Erreur', 
          description: 'Impossible de charger le profil' 
        });
      }
    };

    loadUserData();
  }, [email, toast]); // Reload when email changes

  // Handle profile field update
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      await userService.uploadUserImage(profile.id, file);
      await refreshAuth(); // Refresh auth data after image update
      
      // Update avatar preview with uploaded image
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour'
      });
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Échec de la mise à jour de la photo' 
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Save profile (excluding image)
  const handleSaveProfile = async () => {
    try {
      const { firstName, lastName, email, phone, location, bio, specialization } = profile;
      
      await userService.updateUser(profile.id, {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        address: location,
        biographie: bio,
        departement: specialization
      });

      await refreshAuth(); // Refresh auth data after profile update
      setIsEditing(false);
      toast({
        title: 'Succès',
        description: 'Profil mis à jour'
      });
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de sauvegarder les modifications' 
      });
    }
  };

  // Rest of the component remains the same...
  // (Keep all the JSX rendering logic as it was)
  return (
    <div className="page-container">
      {/* Header with profile cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl mb-16 overflow-hidden">
        {/* Profile picture */}
        <div className="absolute -bottom-16 left-8 w-32 h-32 rounded-full border-4 border-white bg-white shadow-md">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
            <img 
              src={profile.avatar} 
              alt={`${profile.firstName} ${profile.lastName}`} 
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
                <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
                
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
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                      Prénom
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                      Nom
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
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
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium mb-1">
                      Spécialisation
                    </label>
                    <Input
                      id="specialization"
                      name="specialization"
                      value={profile.specialization}
                      onChange={handleInputChange}
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
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Department</p>
                  <p className="text-sm text-muted-foreground">{profile.specialization}</p>
                </div>
              </div>
             
             
            </CardContent>
          </Card>
        </div>
        {/* Right column - Content tabs */}
        <div className="w-full md:w-2/3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activité</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-4">
              {/* Add your activity content here */}
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