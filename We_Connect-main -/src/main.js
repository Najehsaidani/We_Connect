import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'; // Import global styles for all pages

// Import des icônes
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-vue-next'

const app = createApp(App)

app.use(router)

// Enregistrement global des icônes
app.component('MailIcon', Mail)
app.component('LockIcon', Lock)
app.component('UserIcon', User)
app.component('EyeIcon', Eye)
app.component('EyeOffIcon', EyeOff)

app.mount('#app')