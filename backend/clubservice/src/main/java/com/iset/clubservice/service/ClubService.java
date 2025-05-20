package com.iset.clubservice.service;

import com.iset.clubservice.model.dto.ClubDto;
import com.iset.clubservice.model.dto.MembreClubDto;
import com.iset.clubservice.model.entity.Club;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ClubService {
    ClubDto createClub(ClubDto clubDto);
    ClubDto updateClub(Long id, ClubDto clubDto);
    void deleteClub(Long id);
    List<ClubDto> getAllClubs();
    ClubDto getClubById(Long id);
    MembreClubDto  inscrireEtudiantAuClub(Long clubId, Long userId);
    MembreClubDto  supprimerMembreDuClub(Long clubId, Long membreASupprimerId, Long adminId);
    ClubDto accepterClub(Long id);
    ClubDto refuserClub(Long id);
    List<ClubDto> getClubsEnAttente();
    ClubDto quitterClub(Long clubId, Long userId);
    List<Club> searchClubs(String search, String category);
    String uploadImage(Long clubId, MultipartFile file) throws IOException;
    boolean removeImage(Long clubId) throws IOException;

}

