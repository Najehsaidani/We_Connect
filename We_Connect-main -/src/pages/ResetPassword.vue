<template>
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Nouveau mot de passe</h1>
          <p class="auth-subtitle">Pour <span class="user-email">{{ email }}</span></p>
        </div>
  
        <form @submit.prevent="submitNewPassword" class="auth-form">
          <div class="form-group">
            <label for="newPassword" class="label">Nouveau mot de passe</label>
            <div class="input-wrapper">
              <LockIcon class="input-icon" />
              <input
                id="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="input-field"
                v-model="newPassword"
                required
                minlength="8"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :aria-label="showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'"
              >
                <EyeIcon v-if="showPassword" class="icon" />
                <EyeOffIcon v-else class="icon" />
              </button>
            </div>
            <div v-if="newPassword" class="password-feedback">
              <div class="strength-meter">
                <div class="strength-segment" :class="{'active': passwordStrength >= 1}"></div>
                <div class="strength-segment" :class="{'active': passwordStrength >= 2}"></div>
                <div class="strength-segment" :class="{'active': passwordStrength >= 3}"></div>
              </div>
              <p class="strength-text" :class="strengthTextClass">
                {{ passwordStrengthText }}
                <span v-if="passwordStrength < 3" class="hint-text">(minimum 8 caractères avec majuscule et chiffre)</span>
              </p>
            </div>
          </div>
  
          <div class="form-group">
            <label for="confirmPassword" class="label">Confirmer le mot de passe</label>
            <div class="input-wrapper">
              <LockIcon class="input-icon" />
              <input
                id="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="input-field"
                v-model="confirmPassword"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
                :aria-label="showConfirmPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'"
              >
                <EyeIcon v-if="showConfirmPassword" class="icon" />
                <EyeOffIcon v-else class="icon" />
              </button>
            </div>
            <p v-if="passwordMismatch" class="error-message">
              Les mots de passe ne correspondent pas
            </p>
          </div>
  
          <button
            type="submit"
            class="submit-btn"
            :disabled="isSubmitting || passwordMismatch || !isPasswordStrong"
            :class="{ 'disabled': isSubmitting || passwordMismatch || !isPasswordStrong }"
          >
            <span v-if="!isSubmitting">Réinitialiser le mot de passe</span>
            <span v-else class="loading-spinner">
              <svg class="spinner" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
              Enregistrement...
            </span>
          </button>
        </form>
        <div v-if="errorMessage" class="error-message">
  {{ errorMessage }}
</div>
  
        <div class="auth-footer">
          <RouterLink to="/auth/signin" class="footer-link">
            <ArrowLeftIcon class="icon-sm" />
            Retour à la connexion
          </RouterLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { LockIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from 'lucide-vue-next'
  import authService from '@/Services/authService' // <-- import your service
  
  const router = useRouter()
  const route = useRoute()
  const newPassword = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const email = route.query.email || ''
  const token = route.query.token || ''
  
  const passwordMismatch = computed(() => {
    return !(newPassword.value && confirmPassword.value && newPassword.value == confirmPassword.value);
  })
  
  const passwordStrength = computed(() => {
    if (!newPassword.value) return 0
    if (newPassword.value.length < 6) return 1
    if (!/[A-Z]/.test(newPassword.value) || !/[0-9]/.test(newPassword.value) || !/[^A-Za-z0-9]/.test(newPassword.value)) return 2
    return 3
  })
  
  const passwordStrengthText = computed(() => {
    return ['Très faible', 'Moyen', 'Fort', 'Très fort'][passwordStrength.value] || ''
  })
  
  const strengthTextClass = computed(() => {
    return {
      'weak-text': passwordStrength.value === 1,
      'medium-text': passwordStrength.value === 2,
      'strong-text': passwordStrength.value === 3
    }
  })
  
  const isPasswordStrong = computed(() => passwordStrength.value >= 2)
  
  const submitNewPassword = async () => {
    errorMessage.value = ''
    isSubmitting.value = true
    try {
      await authService.resetPassword({
        email,
        newPassword: newPassword.value,
        confirmationPassword: confirmPassword.value
      })
      router.push('/auth/signin?reset=success')
    } catch (error) {
      errorMessage.value = error.response?.data?.error || error.message || 'Erreur lors de la réinitialisation'
    } finally {
      isSubmitting.value = false
    }
  }
  
  onMounted(() => {
    if (!email || !token) {
      router.push('/auth/forgot-password')
    }
  })
  </script>
  
  <style scoped>
  /* Base styles */
  .auth-page {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: #f8fafc;
    padding: 1rem;
  }
  
  .auth-card {
    width: 100%;
    max-width: 28rem;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 2.5rem;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  .auth-subtitle {
    color: #64748b;
    font-size: 0.875rem;
  }
  
  .user-email {
    font-weight: 500;
    color: #3b82f6;
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
  }
  
  .input-wrapper {
    position: relative;
  }
  
  .input-field {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .password-toggle:hover {
    color: #64748b;
  }
  
  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .icon-sm {
    width: 1rem;
    height: 1rem;
    margin-right: 0.25rem;
  }
  
  /* Password strength indicator */
  .password-feedback {
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
  
  .strength-segment.active {
    background-color: currentColor;
  }
  
  .strength-segment:nth-child(1).active {
    color: #ef4444;
  }
  
  .strength-segment:nth-child(2).active {
    color: #f59e0b;
  }
  
  .strength-segment:nth-child(3).active {
    color: #10b981;
  }
  
  .strength-text {
    font-size: 0.75rem;
    font-weight: 500;
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
  
  .hint-text {
    color: #94a3b8;
    font-size: 0.6875rem;
  }
  
  /* Error message */
  .error-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }
  
  /* Submit button */
  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .submit-btn:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .submit-btn.disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .loading-spinner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  
  /* Footer link */
  .auth-footer {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .footer-link {
    display: inline-flex;
    align-items: center;
    color: #64748b;
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  .footer-link:hover {
    color: #3b82f6;
  }
  </style>