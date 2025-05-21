import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Services & Utils
import { authService } from "@/services/authService";
import { decodeToken } from "@/utils/jwt";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");



    try {
      const response = await authService.login({ email, password });

      if (!response.token) {
        throw new Error("No token received from server");
      }

      // Store the token in localStorage
      localStorage.setItem('token', response.token);

      // Store userId directly from response if available, or from decoded token as fallback
      if (response.userId) {
        localStorage.setItem('userId', response.userId.toString());
        console.log("User ID stored from response:", response.userId);
      } else {
        // Fallback to decoded token
        const decoded = decodeToken(response.token);
        console.log("Decoded token:", decoded);
        const { roles = [], userId } = decoded;

        // Store userId in localStorage if available
        if (userId) {
          localStorage.setItem('userId', userId.toString());
          console.log("User ID stored from decoded token:", userId);
        }
      }

      // Decode token to get roles
      const decoded = decodeToken(response.token);
      const { roles = [] } = decoded;

      // Use React Router navigation based on roles
      if (roles.includes("ROLE_ADMIN")) {
        navigate("/acces/admin");
      } else if (
        roles.includes("ROLE_ETUDIANT") ||
        roles.includes("ROLE_PROFESSEUR") ||
        roles.includes("ROLE_MODERATEUR")
      ) {
        navigate("/app/forum");
      } else {
        navigate("/unauthorized");
      }

    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage(
        (error).response?.data?.message ||
        (error as Error).message ||
        "Erreur de connexion."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre compte</p>
        </div>

        {errorMessage && (
          <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
            {errorMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
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
                disabled={isLoading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
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
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas de compte ?{" "}
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
  );
};

export default SignIn;

// function refreshAuth() {
//   throw new Error("Function not implemented.");
// }