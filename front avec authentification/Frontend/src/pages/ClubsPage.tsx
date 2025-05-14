import { useState, useEffect } from "react";
import { clubService } from "@/services/clubService";
import { categoryService } from "@/services/categoryService";
import { toast } from "@/components/ui/use-toast";  // Adaptation de votre gestion des notifications

interface ClubDto {
  id?: number;
  nom: string;
  description: string;
  categoryId: number;
  coverPhoto: string;
  profilePhoto: string;
  dateCreation: string;
}

const ClubsPage = () => {
  const [clubs, setClubs] = useState<ClubDto[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<number[]>([]); // Liste des ID des clubs où l'utilisateur est membre
  const [categories, setCategories] = useState<string[]>(['Tous']); // Liste des catégories avec "Tous"
  const [newClub, setNewClub] = useState<ClubDto>({
    nom: '',
    description: '',
    categoryId: 0,
    coverPhoto: '',
    profilePhoto: '',
    dateCreation: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState<boolean>(false);

  // Charger les clubs existants
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const allClubs = await clubService.getAllClubs();
        setClubs(allClubs);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les clubs.",
          variant: "destructive"
        });
      }
    };

    fetchClubs();
  }, []);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryService.getAllCategories();
        const names = allCategories.map((cat: any) => cat.name); // Assurez-vous que le modèle de catégorie contient un champ `name`
        setCategories(['Tous', ...names]);
        if (names.length > 0) {
          setNewClub((prev) => ({ ...prev, categoryId: names[0] ? names[0] : 0 }));
        }
      } catch (err) {
        toast({
          title: "Erreur catégories",
          description: "Impossible de charger les catégories.",
          variant: "destructive"
        });
      }
    };

    fetchCategories();
  }, []);

  // Créer un club
  const handleCreateClub = async () => {
    if (!newClub.nom || !newClub.description || !newClub.categoryId) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await clubService.createClub(newClub);
      setClubs([res, ...clubs]);
      setJoinedClubs([...joinedClubs, res.id!]);
      setIsCreateClubOpen(false);
      toast({
        title: "Club créé",
        description: "Votre club a été créé avec succès !"
      });

      // Réinitialiser le formulaire de création
      setNewClub({
        nom: '',
        description: '',
        categoryId: categories.find(c => c !== 'Tous') ? 0 : 0,  // Réinitialiser avec une catégorie valide
        coverPhoto: '',
        profilePhoto: '',
        dateCreation: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la création du club.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Liste des clubs</h1>

      {/* Affichage des clubs */}
      <div>
        {clubs.length > 0 ? (
          clubs.map((club) => (
            <div key={club.id}>
              <h2>{club.nom}</h2>
              <p>{club.description}</p>
              <p>Catégorie: {categories[club.categoryId]}</p>
              {/* Affichage des actions possibles pour rejoindre/voir le club */}
            </div>
          ))
        ) : (
          <p>Aucun club disponible.</p>
        )}
      </div>

      {/* Formulaire pour créer un club */}
      {isCreateClubOpen && (
        <div>
          <h2>Créer un club</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateClub(); }}>
            <label>
              Nom du club:
              <input
                type="text"
                value={newClub.nom}
                onChange={(e) => setNewClub({ ...newClub, nom: e.target.value })}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                required
              />
            </label>
            <label>
              Catégorie:
              <select
                value={newClub.categoryId}
                onChange={(e) => setNewClub({ ...newClub, categoryId: Number(e.target.value) })}
              >
                {categories.map((category, index) => (
                  <option key={index} value={index}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            {/* Ajouter les champs coverPhoto et profilePhoto */}
            <button type="submit" disabled={isLoading}>Créer</button>
          </form>
        </div>
      )}

      <button onClick={() => setIsCreateClubOpen(!isCreateClubOpen)}>
        {isCreateClubOpen ? 'Annuler' : 'Créer un nouveau club'}
      </button>
    </div>
  );
};

export default ClubsPage;
