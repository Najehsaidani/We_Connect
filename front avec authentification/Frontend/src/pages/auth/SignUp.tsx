import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength = 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength = 2;
    if (password.length >= 8 && /[!@#$%^&*]/.test(password)) strength = 3;
    setPasswordStrength(strength);
  };

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(re.test(email));
  };

  // Password mismatch check
  const passwordMismatch = useMemo(() => {
    return form.password && form.confirmPassword && form.password !== form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      form.firstName &&
      form.lastName &&
      form.email &&
      isEmailValid &&
      form.password &&
      passwordStrength >= 2 &&
      form.confirmPassword &&
      !passwordMismatch
    );
  }, [form, isEmailValid, passwordStrength, passwordMismatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength when password field changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!isFormValid) return;
  
    setLoading(true);
  
    try {
      const response = await authService.register(form); // Envoie une requête POST réelle
      console.log('Inscription réussie:', response);
  
      // Redirige vers la page de vérification avec l'email
      navigate('/auth/verify-code', {
        state: { email: form.email },
        replace: true,
      });
  
      // Réinitialise le formulaire
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setPasswordStrength(0);
      setIsEmailValid(true);
    } catch (error) {
      console.error('Inscription échouée:', error);
  
      // Récupère le message d'erreur du backend ou utilise un message par défaut
      const errorMessage =
        error?.response?.data?.message || 
        error?.message || 
        "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.";
  
      // Affiche l'erreur dans un toast
      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Créer votre compte
          </h1>
          <p className="text-gray-500 mt-2">Commencez votre expérience dès maintenant</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmitSignup}>
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <div className="relative">
                <Input 
                  id="firstName"
                  name="firstName"
                  type="text" 
                  placeholder="Votre prénom"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
                <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <div className="relative">
                <Input 
                  id="lastName"
                  name="lastName"
                  type="text" 
                  placeholder="Votre nom"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
                <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input 
                id="email"
                name="email"
                type="email" 
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, email: e.target.value }));
                  validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(form.email)}
                required
                className={`pl-10 ${!isEmailValid ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
              />
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
            {!isEmailValid && form.email && (
              <p className="text-sm text-red-500">Email invalide</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="•••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
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
            
            {/* Password Strength Meter */}
            <div className="mt-2">
              <div className="flex h-1 gap-1">
                <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <p className="text-xs mt-1 text-gray-500">
                Force : 
                <span className={`
                  ${passwordStrength === 1 ? 'text-red-500' : ''}
                  ${passwordStrength === 2 ? 'text-yellow-500' : ''}
                  ${passwordStrength === 3 ? 'text-green-500' : ''}
                `}>
                  {passwordStrength === 1 ? ' Faible' : 
                   passwordStrength === 2 ? ' Moyenne' : 
                   passwordStrength === 3 ? ' Forte' : ' '}
                </span>
              </p>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="•••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="pl-10"
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
            {passwordMismatch && (
              <p className="text-sm text-red-500">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </div>
            ) : "S'inscrire"}
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