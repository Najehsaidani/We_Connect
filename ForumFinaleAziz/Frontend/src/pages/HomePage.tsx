
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Calendar, ChevronRight } from 'lucide-react';

const HomePage = () => {
  // Features section data
  const features = [
    {
      icon: <MessageSquare className="w-10 h-10 text-forum-primary" />,
      title: "Forum de discussion",
      description: "Posez vos questions, partagez vos idées et discutez avec la communauté étudiante.",
      link: "/forum"
    },
    {
      icon: <Users className="w-10 h-10 text-forum-secondary" />,
      title: "Clubs & Associations",
      description: "Découvrez et rejoignez les différents clubs et associations du campus.",
      link: "/clubs"
    },
    {
      icon: <Calendar className="w-10 h-10 text-forum-accent" />,
      title: "Événements",
      description: "Restez informé des événements à venir et partagez vos propres événements.",
      link: "/events"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/30 to-secondary/30 py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Bienvenue sur <span className="text-primary">We_Connect</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-foreground/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Le forum collaboratif qui connecte les étudiants, les clubs et les événements de votre campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth" className="btn-primary">
              Rejoindre la communauté
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Découvrez nos fonctionnalités</h2>
          <p className="text-lg text-center mb-12 text-muted-foreground max-w-3xl mx-auto">
            WeConnect offre de nombreux outils pour améliorer votre vie étudiante et rester connecté avec votre communauté.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-sm border border-border card-hover"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                {/* <Link 
                  to={feature.link} 
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Découvrir <ChevronRight className="ml-1 w-4 h-4" />
                </Link> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Étudiants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">120+</div>
              <div className="text-muted-foreground">Clubs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">350+</div>
              <div className="text-muted-foreground">Publications par jour</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">45+</div>
              <div className="text-muted-foreground">Événements à venir</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à rejoindre notre communauté ?</h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Créez un compte pour accéder à toutes les fonctionnalités et commencer à interagir avec votre communauté étudiante dès maintenant.
          </p>
          <Link to="/auth" className="btn-primary">
            Créer un compte gratuitement
          </Link>
        </div>
      </section> */}
    </div>
  );
};

export default HomePage;
