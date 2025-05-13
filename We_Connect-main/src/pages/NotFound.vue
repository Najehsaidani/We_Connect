<template>
    <div class="not-found-page">
      <div class="not-found-card">
        <h1 class="text-4xl font-bold mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-4">Oops! Page non trouvée</p>
        <RouterLink to="/" class="link">Retour à l'accueil</RouterLink>
      </div>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>