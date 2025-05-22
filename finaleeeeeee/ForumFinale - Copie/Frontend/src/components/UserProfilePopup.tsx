import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Calendar, Briefcase, ExternalLink } from 'lucide-react';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface UserProfilePopupProps {
  userId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserProfilePopup = ({ userId, isOpen, onOpenChange }: UserProfilePopupProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isOpen || !userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Impossible de charger les informations de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil de l'utilisateur</DialogTitle>
          <DialogDescription>
            Informations rapides sur l'utilisateur
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="mt-4 text-sm text-muted-foreground">Chargement du profil...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* User header */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.image || ''} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-muted-foreground">{user.departement || 'Département non spécifié'}</p>
              </div>
            </div>
            
            {/* User info */}
            <div className="space-y-2 pt-2 border-t">
              {user.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
              
              {user.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.phoneNumber}</span>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
              
              {user.dateOfBirth && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(user.dateOfBirth.toString())}
                  </span>
                </div>
              )}
              
              {user.departement && (
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.departement}</span>
                </div>
              )}
            </div>
            
            {/* Bio */}
            {user.biographie && (
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-1">À propos</h4>
                <p className="text-sm text-muted-foreground">{user.biographie}</p>
              </div>
            )}
            
            {/* View full profile button */}
            <div className="pt-4 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link to={`/profile/${user.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le profil complet
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune information disponible</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePopup;

