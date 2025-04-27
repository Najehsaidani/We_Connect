<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Créez votre compte</h1>
        <p>Commencez votre expérience dès maintenant</p>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label>Prénom</label>
            <input 
              type="text" 
              v-model="form.firstName" 
              placeholder="Votre prénom"
              required
            />
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input 
              type="text" 
              v-model="form.lastName" 
              placeholder="Votre nom"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="votre@email.com"
            @blur="validateEmail"
            :class="{ 'input-error': !isEmailValid }"
            required
          />
          <span v-if="!isEmailValid" class="error-msg">Email invalide</span>
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password" 
              placeholder="••••••••"
              @input="checkPasswordStrength"
              required
              minlength="8"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="toggle-password"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-meter">
              <div class="strength-segment" :class="{ 'weak': passwordStrength === 1 }"></div>
              <div class="strength-segment" :class="{ 'medium': passwordStrength >= 2 }"></div>
              <div class="strength-segment" :class="{ 'strong': passwordStrength >= 3 }"></div>
            </div>
            <p class="strength-text">
              Force: <span :class="{
                'weak-text': passwordStrength === 1,
                'medium-text': passwordStrength === 2,
                'strong-text': passwordStrength === 3
              }">
                {{ passwordStrength === 1 ? 'Faible' : passwordStrength === 2 ? 'Moyenne' : 'Forte' }}
              </span>
            </p>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <div class="password-input">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="form.confirmPassword" 
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              @click="showConfirmPassword = !showConfirmPassword"
              class="toggle-password"
            >
              <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <span v-if="passwordMismatch" class="error-msg">Les mots de passe ne correspondent pas</span>
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="!isFormValid || loading"
        >
          <span v-if="!loading">S'inscrire</span>
          <span v-else class="loading-spinner">
            <svg class="spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
          </span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Déjà un compte ? <router-link to="/auth/signin">Connectez-vous</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/Services/authService'

const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const isEmailValid = ref(true)
const passwordStrength = ref(0)

const passwordMismatch = computed(() => {
  return form.value.password && form.value.confirmPassword && 
         form.value.password !== form.value.confirmPassword
})

const isFormValid = computed(() => {
  return form.value.firstName && form.value.lastName && 
         form.value.email && isEmailValid.value && 
         form.value.password && passwordStrength.value >= 2 && 
         form.value.confirmPassword && !passwordMismatch.value
})

const validateEmail = () => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  isEmailValid.value = re.test(form.value.email)
}

const checkPasswordStrength = () => {
    if (form.value.password.length < 6) {
      passwordStrength.value = 1
    } else if (!/[A-Z]/.test(form.value.password) || !/[0-9]/.test(form.value.password)) {
      passwordStrength.value = 2
    } else {
      passwordStrength.value = 3
    }
  }
  

  const handleSignup = async () => {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const { data } = await authService.register(form.value)
    console.log('Signup success', data)
    // Pass email to verify-code page
    router.push({ path: '/auth/verify-code', query: { email: form.value.email } })
  } catch (error) {
    console.error('Signup failed', error.response?.data || error.message)
    alert('Erreur d’inscription.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #64748b;
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.error-msg {
  color: #ef4444;
  font-size: 0.75rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-meter {
  display: flex;
  gap: 0.25rem;
  height: 0.25rem;
  margin-bottom: 0.25rem;
}

.strength-segment {
  flex: 1;
  border-radius: 0.125rem;
  background-color: #e2e8f0;
  transition: all 0.3s ease;
}

.strength-segment.weak {
  background-color: #ef4444;
}

.strength-segment.medium {
  background-color: #f59e0b;
}

.strength-segment.strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  color: #64748b;
}

.weak-text {
  color: #ef4444;
}

.medium-text {
  color: #f59e0b;
}

.strong-text {
  color: #10b981;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: rotate 1.5s linear infinite;
  width: 1.25rem;
  height: 1.25rem;
}

.spinner .path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.auth-footer a {
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
