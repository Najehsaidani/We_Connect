
// Sample clubs data
export const initialClubs = [
  {
    id: 1,
    name: 'Club de Débat',
    description: 'Rejoignez-nous pour discuter et débattre de sujets d\'actualité et développer vos compétences en communication.',
    members: 42,
    banner: '/placeholder.svg',
    category: 'Académique',
    nextEvent: 'Débat sur l\'intelligence artificielle - Demain, 18h',
    location: 'Salle B-204',
    createdAt: '2024-03-15',
    membersList: [
      { id: 1, name: 'Emma Martin', role: 'Président', avatar: '/placeholder.svg' },
      { id: 2, name: 'Thomas Durand', role: 'Vice-président', avatar: '/placeholder.svg' },
      { id: 3, name: 'Camille Robert', role: 'Secrétaire', avatar: '/placeholder.svg' },
      { id: 4, name: 'Alex Petit', role: 'Trésorier', avatar: '/placeholder.svg' },
      { id: 5, name: 'Julie Moreau', role: 'Membre', avatar: '/placeholder.svg' }
    ]
  },
  {
    id: 2,
    name: 'Association Sportive',
    description: 'Sports d\'équipe, entraînements hebdomadaires et compétitions inter-universitaires.',
    members: 78,
    banner: '/placeholder.svg',
    category: 'Sport',
    nextEvent: 'Match de basket vs. Université Paris - Samedi, 14h',
    location: 'Gymnase universitaire',
    createdAt: '2023-09-10',
    membersList: [
      { id: 1, name: 'Lucas Bernard', role: 'Président', avatar: '/placeholder.svg' },
      { id: 2, name: 'Sarah Dubois', role: 'Vice-présidente', avatar: '/placeholder.svg' },
      { id: 3, name: 'Maxime Legrand', role: 'Secrétaire', avatar: '/placeholder.svg' }
    ]
  },
  {
    id: 3,
    name: 'Club Théâtre',
    description: 'Exprimez-vous à travers l\'art dramatique et participez à nos productions annuelles.',
    members: 35,
    banner: '/placeholder.svg',
    category: 'Arts',
    nextEvent: 'Auditions pièce de fin d\'année - Mercredi, 19h'
  },
  {
    id: 4,
    name: 'Association Humanitaire',
    description: 'Organisation d\'événements caritatifs et de missions humanitaires locales et internationales.',
    members: 53,
    banner: '/placeholder.svg',
    category: 'Solidarité',
    nextEvent: 'Collecte de fournitures scolaires - Lundi au vendredi'
  },
  {
    id: 5,
    name: 'Club Entrepreneuriat',
    description: 'Développez vos projets entrepreneuriaux avec le soutien de mentors et d\'autres étudiants passionnés.',
    members: 47,
    banner: '/placeholder.svg',
    category: 'Professionnel',
    nextEvent: 'Pitch de startups - Jeudi, 17h'
  },
  {
    id: 6,
    name: 'Club de Musique',
    description: 'Pour les passionnés de musique, tous instruments et tous niveaux bienvenus !',
    members: 38,
    banner: '/placeholder.svg',
    category: 'Arts',
    nextEvent: 'Jam session - Vendredi, 20h'
  },
];

// Categories for filtering
export const categories = [
  'Tous',
  'Académique',
  'Sport',
  'Arts',
  'Solidarité',
  'Professionnel',
  'Loisirs'
];
