<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gradient">Connexion</h1>
        <p class="text-gray-500">Connectez-vous à votre compte</p>
      </div>

     

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label">Email</label>
          <div class="input-wrapper">
            <MailIcon class="input-icon" />
            <input 
              type="email" 
              placeholder="votre@email.com" 
              class="input" 
              v-model="email"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="label">Mot de passe</label>
          <div class="input-wrapper">
            <LockIcon class="input-icon" />
            <input 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="•••••••••" 
              class="input" 
              v-model="password"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
              tabindex="-1"
            >
              <EyeOffIcon v-if="showPassword" class="w-5 h-5" />
              <EyeIcon v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="text-right">
          <RouterLink to="/auth/forgot-password" class="link text-sm">
            Mot de passe oublié ?
          </RouterLink>
        </div>

        <button type="submit" class="btn btn-primary w-full">
          Se connecter
        </button>
      </form>
      <div v-if="errorMessage" class="alert alert-error mb-4">
        {{ errorMessage }}
      </div>

      <div class="text-center text-sm text-gray-600 mt-4">
        <p>Pas de compte ? <RouterLink to="/auth/signup" class="link">Inscrivez-vous</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import authService from '@/Services/authService'
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    const { data } = await authService.login(email.value, password.value)
    console.log('Login success', data)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed', error.response?.data || error.message)
    // Handle both 'message' and 'error' keys from backend
    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Erreur de connexion.'
  }
}
</script>

<style scoped>
 .alert {
   background-color: #f8d7da;
   color: #721c24;
   padding: 10px;
   border-radius: 5px;
   margin-top: 10px;
 }
</style>