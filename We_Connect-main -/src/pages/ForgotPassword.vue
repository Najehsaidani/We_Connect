<template>
    <div class="auth-page">
      <div class="auth-card">
        <div class="text-center">
          <h1 class="auth-title">Mot de passe oublié</h1>
          <p class="auth-subtitle">Entrez votre email pour recevoir un code</p>
        </div>
  
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-group">
            <label class="label">Email</label>
            <div class="input-wrapper">
              <MailIcon class="input-icon" />
              <input
                type="email"
                placeholder="votre@email.com"
                class="input-field"
                v-model="email"
                :disabled="codeSent"
                required
              />
            </div>
          </div>
  
          <div v-if="codeSent" class="code-section">
            <div class="form-group">
              <label class="label">Code de vérification</label>
              <div class="code-inputs">
                <div 
                  v-for="i in 6" 
                  :key="i" 
                  class="code-input-wrapper"
                >
                  <input
                    v-model="code[i-1]"
                    @input="handleCodeInput(i, $event)"
                    @keydown.delete="handleBackspace(i, $event)"
                    @paste.prevent="handlePaste($event)"
                    @focus="handleFocus(i)"
                    type="text"
                    maxlength="1"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="code-input"
                    :ref="el => { if (el) codeInputRefs[i-1] = el }"
                  />
                </div>
              </div>
              <p class="code-hint">Code envoyé à {{ email }}</p>
            </div>
          </div>
  
          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="isProcessing"
          >
            <span v-if="!codeSent">Envoyer le code</span>
            <span v-else-if="!isCodeComplete">Code envoyé</span>
            <span v-else class="flex items-center justify-center gap-2">
              
              {{ isVerifying ? 'Validation...' : 'Valider le code' }}
            </span>
          </button>
        </form>
        <div v-if="errorMessage" class="alert-error">
           {{ errorMessage }}
         </div>
  
        <div class="auth-footer">
          <RouterLink to="/auth/signin" class="link">
            Retour à la connexion
          </RouterLink>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { MailIcon } from 'lucide-vue-next'
  import authService from '@/Services/authService'
  
  const router = useRouter()
  const email = ref('')
  const errorMessage = ref('')
  const code = ref(Array(6).fill(''))
  const codeInputRefs = ref([])
  const codeSent = ref(false)
  const isVerifying = ref(false)
  
  const isCodeComplete = computed(() => code.value.every(c => c !== ''))
  const isProcessing = computed(() => (codeSent.value && !isCodeComplete.value) || isVerifying.value)
  const handleSubmit = async () => {
  errorMessage.value = ''
  if (!codeSent.value) {
    try {
      await authService.generateResetPasswordToken(email.value)
      codeSent.value = true
      setTimeout(() => codeInputRefs.value[0]?.focus(), 0)
    } catch (error) {
      errorMessage.value = error.response?.data?.error || 'Erreur lors de l’envoi du code.'
    }
    return
  }

  isVerifying.value = true
  try {
    const response = await authService.validateResetToken({
  email: email.value,
  resetPasswordToken: code.value.join('').trim()
})
const token = response.data?.token || ''
console.log('Navigating to reset-password with:', email.value, token)
router.push({
  name: 'reset-password',
  query: { email: email.value, token } // <-- use token, not resetPasswordToken
})
  } catch (error) {
    errorMessage.value = error.response?.data?.error || error.message || 'Code incorrect'
    code.value = Array(6).fill('')
    codeInputRefs.value[0]?.focus()
  } finally {
    isVerifying.value = false
  }
}

  const handleCodeInput = (index, event) => {
    const value = event.target.value.replace(/\D/g, '')
    code.value[index - 1] = value
    if (value && index < 6) codeInputRefs.value[index]?.focus()
  }
  
  const handleBackspace = (index, event) => {
    if (event.key === 'Backspace' && !code.value[index - 1] && index > 1) {
      codeInputRefs.value[index - 2]?.focus()
    }
  }
  
  const handlePaste = (event) => {
    const pasteData = event.clipboardData.getData('text').replace(/\D/g, '')
    const pasteArray = pasteData.split('').slice(0, 6)
  if (pasteArray.length === 6) {
    code.value = [...pasteArray]
      codeInputRefs.value[5]?.focus()
    }
  }
  
  const handleFocus = (index) => {
    codeInputRefs.value[index - 1]?.select()
  }
  </script>
  
  <style scoped>
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #eff6ff 100%);
    padding: 1rem;
  }
  
  .auth-card {
    width: 100%;
    max-width: 28rem;
    padding: 2rem;
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  .auth-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #9333ea, #2563eb);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .auth-subtitle {
    color: #6b7280;
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .input-wrapper {
    position: relative;
  }
  
  .input-field {
    width: 100%;
    padding: 0.75rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }
  
  .input-field:disabled {
    background-color: #f3f4f6;
  }
  
  .input-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .btn-primary {
    background-color: #9333ea;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    width: 100%;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #7e22ce;
  }
  
  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .code-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    animation: fadeIn 0.3s ease-out;
  }
  
  .code-inputs {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .code-input-wrapper {
    width: 2.75rem;
  }
  
  .code-input {
    width: 100%;
    height: 3rem;
    text-align: center;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1.25rem;
  }
  
  .code-hint {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
  }
  
  .auth-footer {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .link {
    color: #9333ea;
    font-weight: 500;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  </style>