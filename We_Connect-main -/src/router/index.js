// import { createRouter, createWebHistory } from 'vue-router'
// import Index from '@/pages/Index.vue'
// import SignIn from '@/pages/auth/SignIn.vue'
// import SignUp from '@/pages/auth/SignUp.vue'
// import ForgotPassword from '@/pages/ForgotPassword.vue'
// import NotFound from '@/pages/NotFound.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     { path: '/', component: Index },
//     { path: '/auth/signin', component: SignIn },
//     { path: '/auth/signup', component: SignUp },
//     { path: '/auth/forgot-password', component: ForgotPassword },
//     { path: '/:pathMatch(.*)*', component: NotFound }
//   ]
// })

// export default router
// import { createRouter, createWebHistory } from 'vue-router'
// import Index from '@/pages/Index.vue'
// import SignIn from '@/pages/auth/SignIn.vue'
// import SignUp from '@/pages/auth/SignUp.vue'
// import ForgotPassword from '@/pages/ForgotPassword.vue'
// import ResetPassword from '@/pages/ResetPassword.vue'
// import NotFound from '@/pages/NotFound.vue'

// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: [
//     { path: '/', component: Index },
//     { path: '/auth/signin', component: SignIn },
//     { path: '/auth/signup', component: SignUp },
//     { 
//       path: '/auth/forgot-password', 
//       component: ForgotPassword,
//       name: 'forgot-password'
//     },
//     { 
//       path: '/auth/reset-password', 
//       component: ResetPassword,
//       name: 'reset-password',
//       props: route => ({
//         email: route.query.email,
//         token: route.query.token
//       })
//     },
//     { path: '/:pathMatch(.*)*', component: NotFound }
//   ]
// })

// export default router
import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/Index.vue'
import SignIn from '@/pages/auth/SignIn.vue'
import SignUp from '@/pages/auth/SignUp.vue'
import VerifyCode from '@/pages/auth/VerifyCode.vue'
import ForgotPassword from '@/pages/ForgotPassword.vue'
import ResetPassword from '@/pages/ResetPassword.vue'
import NotFound from '@/pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Index },
    { path: '/auth/signin', component: SignIn, name: 'signin' },
    { 
      path: '/auth/signup', 
      component: SignUp,
      name: 'signup'
    },
    {
      path: '/auth/verify-code',
      component: VerifyCode,
      name: 'verify-code',
      props: route => ({ email: route.query.email })
    },
    { 
      path: '/auth/forgot-password', 
      component: ForgotPassword,
      name: 'forgot-password'
    },
    { 
      path: '/auth/reset-password', 
      component: ResetPassword,
      name: 'reset-password',
      props: route => ({
        email: route.query.email,
        token: route.query.token
      })
    },
    { path: '/:pathMatch(.*)*', component: NotFound, name: 'not-found' }
  ]
})

export default router