import api from './api'

export default {
  async getAllUsers() {
    const response = await api.get('/api/users/all');
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/api/users/update/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/api/users/delete/${id}`);
    return response.data;
  }
}
