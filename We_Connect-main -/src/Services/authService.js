import api from './api'
const Auth_Url="/api/auth";
export default {
  async login(email, password) {
    const response = await api.post(`${Auth_Url}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(registerData) {
    return await api.post(`${Auth_Url}/register`, registerData);
  },

  async sendOtp(email) {
    return await api.get(`${ Auth_Url}/send-otp/${email}`);
  },

  async resendOtp(email) {
    return await api.post(`${ Auth_Url}/resend-otp?email=${encodeURIComponent(email)}`);
  },

  async verifyOtp(otpData) {
    return await api.post(`${Auth_Url}/verify`, otpData);
  },

  async generateResetPasswordToken(email) {
    return await api.post(`${ Auth_Url}/generate-reset-password-token?email=${email}`);
  },

  async validateResetToken(resetTokenData) {
    return await api.post(`${ Auth_Url}/validate-reset-token`, resetTokenData);
  },

  async resetPassword(resetPasswordData) {
    return await api.post(`${ Auth_Url}/reset-password`, resetPasswordData);
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}
