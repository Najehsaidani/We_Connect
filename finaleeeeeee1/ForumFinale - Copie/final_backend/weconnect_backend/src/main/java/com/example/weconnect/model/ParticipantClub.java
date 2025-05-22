package com.example.weconnect.model;

import com.example.weconnect.model.enums.ParticipantStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants_club")
public class ParticipantClub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_club_id", nullable = false)
    @JsonBackReference
    private EventClub eventClub;

    @Column(nullable = false)
    private LocalDateTime dateInscription;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status;

    // Constructeurs
    public ParticipantClub() {
        this.dateInscription = LocalDateTime.now();
        this.status = ParticipantStatus.CONFIRMED;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public EventClub getEventClub() {
        return eventClub;
    }

    public void setEventClub(EventClub eventClub) {
        this.eventClub = eventClub;
    }

    public LocalDateTime getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(LocalDateTime dateInscription) {
        this.dateInscription = dateInscription;
    }

    public ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(ParticipantStatus status) {
        this.status = status;
    }
}
