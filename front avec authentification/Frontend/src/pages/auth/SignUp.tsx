import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    // For demo purposes, we'll just navigate to the verification page
    navigate('/auth/verify-code', { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Inscription
          </h1>
          <p className="text-gray-500 mt-2">Créez votre nouveau compte</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmitSignup}>
          <div className="space-y-2">
            <Label>Nom complet</Label>
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Votre nom"
                className="pl-10"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)} 
                required
              />
              <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Input 
                type="email" 
                placeholder="votre@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                required
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
          <div className="space-y-2">
            <Label>Confirmer le mot de passe</Label>
            <div className="relative">
              <Input 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="•••••••••"
                className="pl-10"
                required
              />
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            S'inscrire
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ? {" "}
            <Link 
              to="/auth" 
              className="text-purple-600 hover:underline"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
