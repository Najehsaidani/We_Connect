
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, BookOpen, GraduationCap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  role: z.enum(["student", "professor"], { 
    required_error: "Veuillez sélectionner un rôle" 
  }),
  terms: z.boolean({
    required_error: "Vous devez accepter les conditions d'utilisation",
  }).refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "student",
      terms: false,
    },
  });

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onLoginSubmit = (data: LoginFormValues) => {
    console.log('Login with:', data);
    toast({
      title: "Connexion réussie",
      description: "Bienvenue sur CozyCampus !",
    });
    navigate('/forum');
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    console.log('Register with:', data);
    toast({
      title: "Inscription réussie",
      description: "Votre compte a été créé avec succès !",
    });
    navigate('/forum');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted to-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin 
              ? "Entrez vos identifiants pour accéder à votre compte" 
              : "Rejoignez notre communauté en quelques secondes"}
          </p>
        </div>

        <div className="flip-card mt-8">
          <div className={`flip-card-inner ${!isLogin ? 'flipped' : ''}`}>
            {/* Login Form (Front) */}
            <div className="flip-card-front absolute w-full">
              <div className="bg-white p-8 rounded-xl shadow-md border border-border">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail size={18} className="text-gray-400" />
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="votre@email.com" 
                                className="pl-10" 
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock size={18} className="text-gray-400" />
                            </div>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                {...field}
                              />
                            </FormControl>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id="remember-me"
                              type="checkbox"
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                              Rester connecté
                            </label>
                          </div>

                          <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-primary/90">
                              Mot de passe oublié ?
                            </a>
                          </div>
                        </div>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full flex justify-center py-3 px-4"
                    >
                      <LogIn size={18} className="mr-2" />
                      Se connecter
                    </Button>
                  </form>
                </Form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Ou</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Pas encore de compte ?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
                      >
                        Créer un compte
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Register Form (Back) */}
            <div className="flip-card-back absolute w-full">
              <div className="bg-white p-8 rounded-xl shadow-md border border-border">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'utilisateur</FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User size={18} className="text-gray-400" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder="Votre pseudo"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail size={18} className="text-gray-400" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder="votre@email.com"
                                className="pl-10"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock size={18} className="text-gray-400" />
                            </div>
                            <FormControl>
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10"
                                {...field}
                              />
                            </FormControl>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rôle</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre rôle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">
                                <div className="flex items-center">
                                  <BookOpen size={16} className="mr-2" />
                                  Étudiant
                                </div>
                              </SelectItem>
                              <SelectItem value="professor">
                                <div className="flex items-center">
                                  <GraduationCap size={16} className="mr-2" />
                                  Professeur
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <div className="leading-none">
                            <FormLabel className="text-sm">
                              J'accepte les{' '}
                              <a href="#" className="text-primary hover:underline">
                                conditions d'utilisation
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full flex justify-center py-3 px-4"
                    >
                      <UserPlus size={18} className="mr-2" />
                      Créer un compte
                    </Button>
                  </form>
                </Form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Ou</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Déjà un compte ?{' '}
                      <button
                        onClick={toggleAuthMode}
                        className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
                      >
                        Se connecter
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
