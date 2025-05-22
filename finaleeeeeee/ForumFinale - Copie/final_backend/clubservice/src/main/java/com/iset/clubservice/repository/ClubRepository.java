package com.iset.clubservice.repository;

import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.model.enums.EtatClub;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {
    List<Club> findByEtat(EtatClub etat);
        // Recherche avec nom contenant + filtrage par nom catégorie
    List<Club> findByEtatAndNomContainingIgnoreCaseAndCategory_NomIgnoreCase(
        EtatClub etat, String nom, String categoryNom
    );

    // Variante sans catégorie (si le filtre catégorie est vide côté front)
    List<Club> findByEtatAndNomContainingIgnoreCase(
        EtatClub etat, String nom
    );
}
