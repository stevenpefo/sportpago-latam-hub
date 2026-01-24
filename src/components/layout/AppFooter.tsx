import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function AppFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container px-4 py-6">
        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <a
            href="https://instagram.com/sportpago"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://facebook.com/sportpago"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com/sportpago"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
        </div>

        {/* Legal Links */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
          <Link 
            to="/privacy" 
            className="hover:text-primary transition-colors"
          >
            {t("legal.privacyPolicy")}
          </Link>
          <span>•</span>
          <Link 
            to="/terms" 
            className="hover:text-primary transition-colors"
          >
            {t("legal.termsOfService")}
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground">
          © {currentYear} SportPago. {t("legal.allRightsReserved")}
        </p>
      </div>
    </footer>
  );
}
