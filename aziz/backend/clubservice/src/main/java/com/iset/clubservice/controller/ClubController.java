package com.iset.clubservice.controller;

import com.iset.clubservice.model.dto.ClubDto;
import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin("*")
public class ClubController {

    @Autowired
    private ClubService clubService;

    @PostMapping
    public ResponseEntity<ClubDto> create(@RequestBody ClubDto dto) {
        return ResponseEntity.ok(clubService.createClub(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubDto> update(@PathVariable Long id, @RequestBody ClubDto dto) {
        return ResponseEntity.ok(clubService.updateClub(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ClubDto>> getAll() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    // ✅ Nouveau endpoint : inscription au club
    @PostMapping("/{clubId}/inscription/{userId}")
    public ResponseEntity<Void> inscrireEtudiant(@PathVariable Long clubId, @PathVariable Long userId) {
        clubService.inscrireEtudiantAuClub(clubId, userId);
        return ResponseEntity.ok().build();
    }

    // ✅ Nouveau endpoint : suppression d’un membre par l’admin
    @DeleteMapping("/{clubId}/membres/{membreId}")
    public ResponseEntity<Void> supprimerMembre(
            @PathVariable Long clubId,
            @PathVariable Long membreId,
            @RequestParam Long adminId) {

        clubService.supprimerMembreDuClub(clubId, membreId, adminId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{clubId}/inscription/{userId}")
public ResponseEntity<Void> quitterClub(@PathVariable Long clubId, @PathVariable Long userId) {
    clubService.quitterClub(clubId, userId);
    return ResponseEntity.ok().build();
}

        // 🔐 ADMIN ONLY - Accepter un club en attente
    @PostMapping("/{id}/accepter")
    public ResponseEntity<ClubDto> accepterClub(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.accepterClub(id));
    }

    // 🔐 ADMIN ONLY - Refuser un club en attente
    @PostMapping("/{id}/refuser")
    public ResponseEntity<ClubDto> refuserClub(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.refuserClub(id));
    }

    // 🔍 Pour récupérer uniquement les clubs en attente (réservé admin)
    @GetMapping("/en-attente")
    public ResponseEntity<List<ClubDto>> getClubsEnAttente() {
        return ResponseEntity.ok(clubService.getClubsEnAttente());
    }
    @GetMapping("/search")
public ResponseEntity<List<Club>> searchClubs(
    @RequestParam(required = false, defaultValue = "") String search,
    @RequestParam(required = false) String category
) {
    return ResponseEntity.ok(clubService.searchClubs(search, category));
}

}
