import axios from 'axios';

const API_URL = 'http://localhost:8083/api/clubs';

const ClubService = {
  getAllClubs() {
    return axios.get(API_URL);
  },

  getClubById(id) {
    return axios.get(`${API_URL}/${id}`);
  },

  createClub(club) {
    return axios.post(API_URL, club);
  },

  updateClub(id, club) {
    return axios.put(`${API_URL}/${id}`, club);
  },

  deleteClub(id) {
    return axios.delete(`${API_URL}/${id}`);
  },

  // Nouvelle méthode : inscrire un utilisateur au club
  joinClub(clubId, userId) {
    return axios.post(`${API_URL}/${clubId}/inscription/${userId}`);
  },

  // Nouvelle méthode : quitter un club
  leaveClub(clubId, userId) {
    return axios.delete(`${API_URL}/${clubId}/inscription/${userId}`);
  }
};

export default ClubService;
