
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useState } from 'react'

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Input 
                type="email" 
                placeholder="votre@email.com"
                className="pl-10"
              />
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mot de passe</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                placeholder="•••••••••"
                className="pl-10"
              />
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-purple-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Se connecter
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas de compte ? {" "}
            <Link 
              to="/auth/signup" 
              className="text-purple-600 hover:underline"
            >
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
