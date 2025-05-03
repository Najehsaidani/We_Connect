import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

const VerifyCode = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  
  useEffect(() => {
    if (!email) {
      navigate('/auth/signup');
      toast({
        title: "Erreur",
        description: "Veuillez d'abord remplir le formulaire d'inscription.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Code envoyé!",
        description: "Un code de vérification a été envoyé à votre email.",
      });
    }
  }, [email, navigate, toast]);

  const handleVerifyCode = (value: string) => {
    setCode(value);
  };

  const handleConfirm = () => {
    if (code.length === 6) {
      toast({
        title: "Compte créé!",
        description: "Votre compte a été créé avec succès.",
      });
      // Redirect to sign in page
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } else {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code valide à 6 chiffres.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Vérification
          </h1>
          <p className="text-gray-500 mt-2">Entrez le code à 6 chiffres envoyé à {email}</p>
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
            onClick={handleConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Confirmer le code
          </Button>
          <Button 
            variant="link" 
            onClick={() => navigate('/auth/signup')}
            className="text-purple-600 hover:text-purple-700"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VerifyCode
