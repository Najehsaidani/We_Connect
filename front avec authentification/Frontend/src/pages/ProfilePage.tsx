import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
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
import useAuth  from '@/hooks/useAuth';

// Interface aligning with backend UserDTO
interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  biographie: string;
  departement: string;
  image?: string;
}

const ProfilePage = () => {
  const { toast } = useToast();
  const { email, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // State aligned with UserDTO structure
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(),
    phoneNumber: '',
    address: '',
    biographie: '',
    departement: '',
    image: '',

  });

  const loadUserData = useCallback(async () => {
    try {

      const userData = await userService.getUserByEmail(email);
      setProfile({
        ...userData,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        biographie: userData.biographie || '',
        departement: userData.departement || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
        image: userData.image || '', 


      });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger le profil' });
    }
  }, [email, toast]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      await userService.uploadUserImage(profile.id, file);
      await refreshAuth();
      await loadUserData(); // Refresh profile data after upload
      
      toast({ title: 'Succès', description: 'Photo de profil mise à jour' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Échec de la mise à jour de la photo' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateUser(profile.id, profile);
      await refreshAuth();
      await loadUserData(); // Refresh data after update
      setIsEditing(false);
      toast({ title: 'Succès', description: 'Profil mis à jour' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder les modifications' });
    }
  };

  // Avatar URL handling
  const avatarUrl = profile.image 
    ? `data:image/jpeg;base64,${profile.image}`
    : '/placeholder.svg';
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
              src={profile.image ? avatarUrl : '/placeholder.svg'} 
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
    {/* First Name */}
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

    {/* Last Name */}
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

    {/* Email (Disabled) */}
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
        disabled
      />
    </div>

    <div>
  <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
    Date de naissance
  </label>
  <Input
    id="dateOfBirth"
    name="dateOfBirth"
    type="date"
    value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
    onChange={handleInputChange}
    max={new Date().toISOString().split('T')[0]} // Prevent future dates
  />
</div>

    {/* Phone Number */}
    <div>
      <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
        Téléphone
      </label>
      <Input
        id="phoneNumber"
        name="phoneNumber" // Corrected name
        value={profile.phoneNumber}
        onChange={handleInputChange}
      />
    </div>

    {/* Address */}
    <div>
      <label htmlFor="address" className="block text-sm font-medium mb-1">
        Localisation
      </label>
      <Input
        id="address"
        name="address" // Corrected name
        value={profile.address}
        onChange={handleInputChange}
      />
    </div>

    {/* Biography */}
    <div>
      <label htmlFor="biographie" className="block text-sm font-medium mb-1">
        Biographie
      </label>
      <Textarea
        id="biographie"
        name="biographie" // Corrected name
        value={profile.biographie}
        onChange={handleInputChange}
        rows={4}
      />
    </div>

    {/* Department */}
    <div>
      <label htmlFor="departement" className="block text-sm font-medium mb-1">
        Département
      </label>
      <Input
        id="departement"
        name="departement"
        value={profile.departement}
        onChange={handleInputChange}
      />
    </div>
  </div>
) : (
  <>
    {/* Display Mode */}
    <div className="flex items-start space-x-2">
      <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
      <span>{profile.email}</span>
    </div>
    <div className="flex items-start space-x-2">
      <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
      <span>{profile.phoneNumber || 'Non spécifié'}</span>
    </div>
    <div className="flex items-start space-x-2">
      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
      <span>{profile.address || 'Non spécifié'}</span>
    </div>
    <div className="flex items-start space-x-2">
  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
  <span>
    {profile.dateOfBirth 
      ? new Date(profile.dateOfBirth).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Non spécifié'}
  </span>
</div>
    <div className="pt-2 border-t">
      <h4 className="font-medium mb-2">À propos</h4>
      <p className="text-muted-foreground">
        {profile.biographie || 'Aucune biographie fournie'}
      </p>
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
                  <p className="text-sm text-muted-foreground">{profile.departement}</p>
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
const ProfileInfoItem = ({ icon, label, value }: { icon: React.ReactNode, label?: string, value?: string }) => (
  <div className="flex items-start space-x-2">
    <span className="w-5 h-5 text-muted-foreground mt-0.5">{icon}</span>
    <div>
      {label && <p className="font-medium">{label}</p>}
      <p className="text-sm text-muted-foreground">{value || 'Non spécifié'}</p>
    </div>
  </div>
);

export default ProfilePage;