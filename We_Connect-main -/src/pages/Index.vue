<!-- <template>
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div class="container mx-auto px-4">
        <nav class="py-6 flex justify-between items-center">
          <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MonApp
          </h1>
          <div class="space-x-4">
            <RouterLink to="/auth/signin">
              <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Connexion
              </button>
            </RouterLink>
            <RouterLink to="/auth/signup">
              <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                S'inscrire
              </button>
            </RouterLink>
          </div>
        </nav>
  
        <main class="py-20">
          <div class="max-w-3xl mx-auto text-center space-y-8">
            <h2 class="text-5xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Bienvenue sur MonApp
            </h2>
            <p class="text-xl text-gray-600">
              Une plateforme moderne pour tous vos besoins.
            </p>
            <div class="flex justify-center gap-4">
              <RouterLink to="/auth/signup">
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 hover:bg-purple-700 text-primary-foreground h-11 px-8 rounded-md">
                  Commencer
                </button>
              </RouterLink>
              <RouterLink to="/auth/signin">
                <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8 rounded-md">
                  En savoir plus
                </button>
              </RouterLink>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script> -->
  <template>
    <div class="min-h-screen bg-gradient-page">
      <div class="container px-4">
        <nav class="py-6 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gradient">MonApp</h1>
          <div class="flex gap-4">
            <RouterLink to="/auth/signin">
              <button class="btn btn-ghost">Connexion</button>
            </RouterLink>
            <RouterLink to="/auth/signup">
              <button class="btn btn-primary">S'inscrire</button>
            </RouterLink>
          </div>
        </nav>
  
        <main class="py-20">
          <div class="max-w-3xl mx-auto text-center space-y-8">
            <h2 class="text-5xl font-bold leading-tight text-gradient">
              Bienvenue sur MonApp
            </h2>
            <p class="text-xl text-gray-600">
              Une plateforme moderne pour tous vos besoins.
            </p>
            <div class="flex justify-center gap-4">
              <RouterLink to="/auth/signup">
                <button class="btn btn-primary btn-lg">Commencer</button>
              </RouterLink>
              <RouterLink to="/auth/signin">
                <button class="btn btn-outline btn-lg">En savoir plus</button>
              </RouterLink>
            </div>
          </div>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>