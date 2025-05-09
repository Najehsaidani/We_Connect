import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, MessageSquare, ChevronDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import NotificationCenter from "@/components/NotificationCenter";
import FriendSystem from "@/components/FriendSystem";
import useAuth from "@/hooks/useAuth"; 
import { authService } from '@/services/authService'; // Add this import

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, clearAuth } = useAuth(); // Use auth hook

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "La déconnexion a échoué, veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Forum', path: '/forum' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Événements', path: '/events' },
    { name: 'Chat', path: '/chat' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-forum-primary to-forum-secondary bg-clip-text text-transparent">
              We_Connect
            </span>
          </Link>

          {/* Desktop Navigation - Uncommented and fixed */}
         
          {/* Desktop User Actions - Uncommented and fixed */}
          {/* <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <FriendSystem />
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                    <ChevronDown size={16} />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 animate-fade-in z-20">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mon profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-muted transition-colors flex items-center"
                      >
                        <LogOut size={16} className="mr-2" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/auth" className="px-4 py-2 bg-primary text-white rounded-md">
                Connexion
              </Link>
            )}
          </div> */}

          {/* Mobile Menu Button */}
          {/* <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button> */}
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 px-4 shadow-inner animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* {isAuthenticated && (
                <>
                  <div className="flex justify-around py-2 border-t border-b border-muted my-2">
                    <NotificationCenter />
                    <FriendSystem />
                    <MessageSquare size={20} className="text-muted-foreground" />
                  </div>
                  <Link
                    to="/profile"
                    className="px-4 py-2 flex items-center rounded-md hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} className="mr-2" /> Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 flex items-center text-red-500 rounded-md hover:bg-muted"
                  >
                    <LogOut size={18} className="mr-2" /> Déconnexion
                  </button>
                </>
              )} */}
              
              {!isAuthenticated && (
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-primary text-white rounded-md text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-10">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2025 We_Connect- Votre forum universitaire
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;