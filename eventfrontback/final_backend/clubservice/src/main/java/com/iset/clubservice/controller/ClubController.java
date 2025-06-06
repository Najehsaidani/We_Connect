package com.iset.clubservice.controller;

import com.iset.clubservice.model.dto.ClubDto;
import com.iset.clubservice.model.dto.MembreClubDto;
import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.service.ClubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")

public class ClubController {

    @Autowired
    private ClubService clubService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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

    // 📷 Upload d'image pour un club
    @PostMapping("/{id}/upload")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileUrl = clubService.uploadImage(id, file);
        return ResponseEntity.ok(fileUrl);
    }

    // 🗑️ Supprimer l'image d'un club
    @DeleteMapping("/{id}/image")
    public ResponseEntity<Boolean> removeImage(@PathVariable Long id) throws IOException {
        boolean removed = clubService.removeImage(id);
        return ResponseEntity.ok(removed);
    }


    @GetMapping("/search")
public ResponseEntity<List<Club>> searchClubs(
    @RequestParam(required = false, defaultValue = "") String search,
    @RequestParam(required = false) String category
) {
    return ResponseEntity.ok(clubService.searchClubs(search, category));
}

// Endpoint pour récupérer tous les membres d'un club
@GetMapping(value = "/{clubId}/membres", produces = "application/json")
public ResponseEntity<List<MembreClubDto>> getMembresClub(@PathVariable Long clubId) {
    try {
        List<MembreClubDto> membres = clubService.getMembresClub(clubId);
        return ResponseEntity.ok(membres);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.notFound().build();
    }
}

// Simple test endpoint
@GetMapping("/test")
public ResponseEntity<String> testEndpoint() {
    return ResponseEntity.ok("Club controller is working!");
}

}
