
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center max-w-md px-4 animate-fade-in">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page introuvable</h1>
        <p className="text-lg text-muted-foreground mb-8">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/" className="flex items-center">
              <Home size={18} className="mr-2" /> Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="#" onClick={() => window.history.back()} className="flex items-center">
              <ArrowLeft size={18} className="mr-2" /> Page précédente
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
