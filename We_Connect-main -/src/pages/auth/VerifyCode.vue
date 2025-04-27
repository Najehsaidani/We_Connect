<template>
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Vérification requise</h1>
          <p>
            Nous avons envoyé un code à 6 chiffres à<br>
            <strong>{{ email }}</strong>
          </p>
        </div>
  
        <div class="verify-form">
          <div class="code-inputs" @paste.prevent="handlePaste">
            <input
              v-for="i in 6"
              :key="i"
              v-model="code[i-1]"
              @input="handleInput(i, $event)"
              @keydown.delete="handleBackspace(i, $event)"
              @keydown="handleKeyDown(i, $event)"
              @focus="activeInput = i-1"
              @blur="activeInput = null"
              type="text"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]*"
              :class="{ 'input-error': error && !code[i-1] }"
              ref="codeInputs"
            />
          </div>
  
          <div class="code-actions">
            <p v-if="countdown > 0" class="countdown">
              Nouveau code disponible dans {{ countdown }}s
            </p>
            <button
              v-else
              @click="resendCode"
              class="resend-btn"
              :disabled="resending"
            >
              <span v-if="!resending">Renvoyer le code</span>
              <span v-else class="loading-spinner">
                <svg class="spinner small" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
              </span>
            </button>
  
            <p v-if="error" class="error-msg">{{ error }}</p>
          </div>
  
          <div class="action-buttons">
            <button @click="goBack" class="back-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Retour
            </button>
  
            <button
              @click="verifyCode"
              class="verify-btn"
              :disabled="!isCodeComplete || verifying"
            >
              <span v-if="!verifying">Vérifier</span>
              <span v-else class="loading-spinner">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import authService from '@/Services/authService'
  
  const router = useRouter()
  const route = useRoute()
  
  const email = route.query.email || ''
  const code = ref(Array(6).fill(''))
  const codeInputs = ref([])
  const activeInput = ref(null)
  const countdown = ref(60)
  const resending = ref(false)
  const verifying = ref(false)
  const error = ref('')
  let countdownInterval = null
  
  const isCodeComplete = computed(() => {
    return code.value.every(c => c !== '')
  })
  
  const startCountdown = () => {
    countdown.value = 10
    countdownInterval = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--
      } else {
        clearInterval(countdownInterval)
      }
    }, 1000)
  }
  
  const handleInput = (index, event) => {
    const value = event.target.value.replace(/\D/g, '')
    code.value[index - 1] = value
  
    if (value && index < 6) {
      codeInputs.value[index]?.focus()
    }
  }
  
  const handleBackspace = (index, event) => {
    if (event.key === 'Backspace' && !code.value[index - 1] && index > 1) {
      codeInputs.value[index - 2]?.focus()
    }
  }
  
  const handleKeyDown = (index, event) => {
    if (event.key === 'ArrowRight' && index < 6) {
      codeInputs.value[index]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 1) {
      codeInputs.value[index - 2]?.focus()
    }
  }
  
  const handlePaste = (event) => {
    const paste = event.clipboardData.getData('text').replace(/\D/g, '')
    if (paste.length === 6) {
      code.value = paste.split('').slice(0, 6)
      codeInputs.value[5]?.focus()
    }
  }
  
  const resendCode = async () => {
    resending.value = true
    error.value = ''
    try {
      const response = await authService.resendOtp(email)
      if (response.data?.error) {
        error.value = response.data.error
      } else {
        startCountdown()
        code.value = Array(6).fill('')
        codeInputs.value[0]?.focus()
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Erreur lors de l’envoi du code.'
    } finally {
      resending.value = false
    }
  }
  const verifyCode = async () => {
  if (!isCodeComplete.value) return

  verifying.value = true
  error.value = ''
  code.value = code.value.map(c => c.trim())

  try {
    // Use verifyOtp and send { email, verificationCode }
    await authService.verifyOtp({
      email,
      verificationCode: code.value.join('')
    })
    router.push({ path: '/auth/signin', query: { verified: 'true' } })
  } catch (err) {
    error.value = err.response?.data?.error || 'Code incorrect. Veuillez réessayer.'
    code.value = Array(6).fill('')
    codeInputs.value[0]?.focus()
  } finally {
    verifying.value = false
  }
}
  
  const goBack = () => {
    router.go(-1)
  }
  
  onMounted(() => {
    startCountdown()
    codeInputs.value[0]?.focus()
  })
  
  onUnmounted(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
  })
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
    line-height: 1.5;
  }
  
  .auth-header strong {
    color: #3b82f6;
    font-weight: 500;
  }
  
  .verify-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .code-inputs {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }
  
  .code-inputs input {
    width: 3rem;
    height: 3.5rem;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    transition: all 0.2s;
  }
  
  .code-inputs input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    animation: pulse 1.5s infinite;
  }
  
  .input-error {
    border-color: #ef4444 !important;
    background-color: #fef2f2;
  }
  
  .code-actions {
    text-align: center;
  }
  
  .countdown {
    color: #64748b;
    font-size: 0.875rem;
  }
  
  .resend-btn {
    color: #3b82f6;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: color 0.2s;
  }
  
  .resend-btn:hover:not(:disabled) {
    color: #2563eb;
    text-decoration: underline;
  }
  
  .resend-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error-msg {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #3b82f6;
    background: none;
    border: none;
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }
  
  .back-btn:hover {
    background-color: #f8fafc;
  }
  
  .verify-btn {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    min-width: 8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .verify-btn:hover:not(:disabled) {
    background-color: #2563eb;
  }
  
  .verify-btn:disabled {
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
  }
  
  .spinner.small {
    width: 1rem;
    height: 1rem;
  }
  
  .spinner .path {
    stroke: currentColor;
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
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }
  </style>