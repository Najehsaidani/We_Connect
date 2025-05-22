package com.example.weconnect.client;

import com.example.weconnect.dto.ClubDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "club-service") // le nom doit correspondre à celui enregistré dans le registre (Eureka/Naming)
public interface ClubClient {

    @GetMapping("/api/clubs/{id}")
    ClubDTO getClubById(@PathVariable("id") Long id);
}
