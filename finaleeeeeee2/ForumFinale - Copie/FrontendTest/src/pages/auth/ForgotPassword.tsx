import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Initialize email from location state if available
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setStep('verify');
    }
  }, [location.state]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first input when entering verify step
  useEffect(() => {
    if (step === 'verify' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Handle email submission
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      const errorMessage = 'Veuillez entrer votre email.';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call API to send verification code
      await authService.generateResetToken(email);
      
      toast({
        title: "Code envoyé!",
        description: "Un code de vérification a été envoyé à votre email.",
      });
      
      setStep('verify');
      setCountdown(60);
    } catch (err) {
      // Extract error message from different possible error structures
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message ||
        err.message || 
        'Erreur lors de l’envoi du code.';
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle code input changes
  const handleCodeChange = (index, e) => {
    const value = e.target.value.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle arrow keys
  const handleKeyDown = (index, e) => {
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (paste.length === 6) {
      const newCode = paste.split('').slice(0, 6);
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  // Resend code
  const resendCode = async () => {
    setError('');
    setIsProcessing(true);
    
    try {
      const response = await authService.generateResetToken(email);
      
      if (response.data?.error) {
        const errorMessage = response.data.error;
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        setCountdown(60);
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        toast({
          title: "Code renvoyé!",
          description: "Un nouveau code de vérification a été envoyé."
        });
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de l’envoi du code.';
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify code
  const verifyCode = async () => {
    if (!code.every(digit => digit !== '')) return;
    setError('');
    setIsVerifying(true);
  
    try {
      const response = await authService.validateResetToken({
        email,
        resetPasswordToken: code.join('')
      });
  
      console.log('API Response:', response); // Debug
  
      toast({
        title: "Code vérifié!",
        description: "Vous pouvez maintenant réinitialiser votre mot de passe."
      });
  
      // Navigate immediately
      navigate('/auth/reset-password', { 
        state: { email }
      });
  
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.message || 
        'Code incorrect. Veuillez réessayer.';
      
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
  
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };
  // Go back
  const goBack = () => {
    if (step === 'verify') {
      setStep('email');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {step === 'email' ? 'Mot de passe oublié' : 'Vérification requise'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 'email' ? 'Réinitialisez votre mot de passe' : 
             `Nous avons envoyé un code à 6 chiffres à\n${email}`}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {step === 'email' ? (
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
              disabled={isProcessing}
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              Envoyer le code
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div 
              className="code-inputs flex justify-center gap-3"
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  onKeyUp={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-16 text-center text-2xl font-semibold border-2 rounded-lg transition-all
                    ${error ? 'border-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}
                  `}
                />
              ))}
            </div>

            <div className="w-full text-center">
              {countdown > 0 ? (
                <p className="text-gray-500 text-sm">
                  Nouveau code disponible dans {countdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isProcessing}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isProcessing && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Renvoyer le code
                </button>
              )}
            </div>

            <div className="flex justify-between w-full mt-6">
              <Button
                variant="outline"
                onClick={goBack}
                className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
                Retour
              </Button>
              
              <Button
                onClick={verifyCode}
                disabled={!code.every(d => d !== '') || isVerifying}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                Vérifier le code
              </Button>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            <Link 
              to="/auth" 
              className="text-purple-600 hover:underline"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;