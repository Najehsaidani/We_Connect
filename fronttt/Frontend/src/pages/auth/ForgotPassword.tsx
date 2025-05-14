
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom'
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Mail } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre email.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally call an API to send the verification code
    toast({
      title: "Code envoyé!",
      description: "Un code de vérification a été envoyé à votre email.",
    });
    
    setStep('verify');
  };

  const handleVerifyCode = (value: string) => {
    setCode(value);
    if (value.length === 6) {
      console.log("Code verified:", value);
    }
  };

  const handleVerifySubmit = () => {
    if (code.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code valide à 6 chiffres.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally verify the code against an API
    navigate('/auth/reset-password', { state: { email, code } });
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Vérification du code
            </h1>
            <p className="text-gray-500 mt-2">
              Entrez le code à 6 chiffres envoyé à {email}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex justify-center w-full">
              <InputOTP maxLength={6} onChange={handleVerifyCode}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              onClick={handleVerifySubmit}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Réinitialiser le mot de passe
            </Button>
            <Button 
              variant="link" 
              onClick={() => setStep('email')}
              className="text-purple-600 hover:text-purple-700"
            >
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mot de passe oublié
          </h1>
          <p className="text-gray-500 mt-2">Réinitialisez votre mot de passe</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmitEmail}>
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
          <Button 
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Réinitialiser le mot de passe
          </Button>
        </form>
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            <Link 
              to="/auth/signin" 
              className="text-purple-600 hover:underline"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword
