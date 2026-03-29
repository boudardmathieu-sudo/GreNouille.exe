import React, { createContext, useContext, useState } from "react";

type Lang = "FR" | "EN";

const translations = {
  FR: {
    login: {
      title: "Bienvenue",
      subtitle: "Entrez vos identifiants pour accéder au panel",
      email: "Email",
      password: "Mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      submit: "Se connecter",
      submitting: "Connexion...",
      noAccount: "Pas encore de compte ?",
      signUp: "S'inscrire",
    },
    signup: {
      title: "Créer un compte",
      subtitle: "Rejoindre le Nexus Dashboard",
      username: "Nom d'utilisateur",
      email: "Email",
      password: "Mot de passe",
      submit: "S'inscrire",
      submitting: "Création...",
      hasAccount: "Déjà un compte ?",
      signIn: "Se connecter",
      successTitle: "Vérifiez votre email",
      successText: "Nous avons envoyé un lien de confirmation à",
      successSub: "Cliquez dessus pour activer votre compte.",
      backToLogin: "Retour à la connexion",
    },
    forgot: {
      title: "Réinitialisation",
      subtitle: "Entrez votre email pour recevoir un lien de réinitialisation",
      email: "Email",
      submit: "Envoyer le lien",
      submitting: "Envoi...",
      successMsg: "Un lien de réinitialisation a été envoyé à votre adresse email.",
      successSub: "Vérifiez votre boîte de réception (et les spams).",
      returnToLogin: "Retour à la connexion",
      rememberPassword: "Vous vous en souvenez ?",
      signIn: "Se connecter",
    },
  },
  EN: {
    login: {
      title: "Welcome Back",
      subtitle: "Enter your credentials to access the panel",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot password?",
      submit: "Sign In",
      submitting: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },
    signup: {
      title: "Create Account",
      subtitle: "Join Nexus Dashboard today",
      username: "Username",
      email: "Email",
      password: "Password",
      submit: "Sign Up",
      submitting: "Creating account...",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
      successTitle: "Check your email",
      successText: "We've sent a confirmation link to",
      successSub: "Please click it to activate your account.",
      backToLogin: "Back to login",
    },
    forgot: {
      title: "Reset Password",
      subtitle: "Enter your email to receive a reset link",
      email: "Email",
      submit: "Send Reset Link",
      submitting: "Sending...",
      successMsg: "A reset link has been sent to your email address.",
      successSub: "Check your inbox (and spam folder) for the link.",
      returnToLogin: "Return to Login",
      rememberPassword: "Remember your password?",
      signIn: "Sign in",
    },
  },
};

type Translations = typeof translations.FR;

interface LanguageContextType {
  lang: Lang;
  t: Translations;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("nexus-lang") as Lang) || "FR";
  });

  const toggle = () => {
    setLang((prev) => {
      const next = prev === "FR" ? "EN" : "FR";
      localStorage.setItem("nexus-lang", next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
