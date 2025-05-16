import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {authService} from '@/services/authService';
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmationPassword, setconfirmationPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmationPassword, setShowconfirmationPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract email and token from URL query params
  const { email } = location.state || {};

  // Validate presence of required route state
  useEffect(() => {
    if (!email) {
      navigate('/auth/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmationPassword) return;

    setIsSubmitting(true);

    try {
      await authService.resetPassword({
        email,
        newPassword,
        confirmationPassword,
      });

      toast({ title: "Mot de passe mis à jour" });
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setErrorMessage(errorMsg);
      toast({ title: "Erreur", description: errorMsg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Password strength logic
  const passwordStrength = () => {
    if (!newPassword) return 0;
    if (newPassword.length < 6) return 1;
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) return 2;
    return 3;
  };

  const passwordStrengthText = () => {
    const strength = passwordStrength();
    return ['Très faible', 'Moyen', 'Fort', 'Très fort'][strength] || 'Invalide';
  };

  const strengthTextClass = () => {
    const strength = passwordStrength();
    return {
      'text-red-500': strength === 1,
      'text-yellow-500': strength === 2,
      'text-green-500': strength >= 3,
    };
  };

  const isPasswordStrong = passwordStrength() >= 2;
  const passwordMismatch = newPassword && confirmationPassword && newPassword !== confirmationPassword;

  // Handle form submission

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Nouveau mot de passe
          </h1>
          <p className="text-gray-500 mt-2">
            Pour <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
                className="pl-10 pr-10"
              />
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Feedback */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex space-x-1 h-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded transition-all duration-300 ${
                        passwordStrength() >= level ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-sm mt-1 ${strengthTextClass()}`}>
                  {passwordStrengthText()}
                  {passwordStrength() < 3 && (
                    <span className="block text-gray-500 text-xs mt-1">
                      (minimum 8 caractères avec majuscule et chiffre)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmationPassword">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirmationPassword"
                type={showconfirmationPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmationPassword}
                onChange={(e) => setconfirmationPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="pl-10 pr-10"
              />
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowconfirmationPassword(!showconfirmationPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                aria-label={showconfirmationPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
              >
                {showconfirmationPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-sm text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || passwordMismatch || !isPasswordStrong}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to="/auth/signin"
            className="text-purple-600 hover:underline flex items-center justify-center gap-1"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;