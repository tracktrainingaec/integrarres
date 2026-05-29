import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { ScrollVideoHero } from '../components/ScrollVideoHero';
import { ScrollGallery } from '../components/ScrollGallery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [showAnniversary, setShowAnniversary] = useState(false);

  useEffect(() => {
    // Enable scrolling for this specific page
    document.documentElement.classList.add('is-scrollytelling');
    document.body.classList.add('is-scrollytelling');

    // Show popup once per session
    const hasShown = sessionStorage.getItem('anniversary_popup_shown');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setShowAnniversary(true);
        sessionStorage.setItem('anniversary_popup_shown', 'true');
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      document.documentElement.classList.remove('is-scrollytelling');
      document.body.classList.remove('is-scrollytelling');
    };
  }, []);


  // Helper to render CTA buttons
  const renderCTA = () => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      return (
        <div className="space-y-4 animate-scale-in w-full">
          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <p className="text-lg font-bold text-white">Olá, {userName}! 👋</p>
            <p className="text-sm text-white/70">Que bom te ver por aqui.</p>
          </div>
          <GradientButton
            text="Acessar Evento"
            onClick={() => navigate('/menu')}
            className="shadow-2xl hover:scale-105"
          />
          <button
            onClick={() => {
              localStorage.removeItem('userName');
              localStorage.removeItem('checkins');
              window.location.reload();
            }}
            className="w-full text-sm text-white/60 hover:text-white underline mt-4"
          >
            Sair / Novo check-in
          </button>
        </div>
      );
    }
    return (
      <GradientButton
        text="Realizar Check-in"
        onClick={() => setIsLocationDialogOpen(true)}
        className="shadow-2xl hover:scale-105 py-5"
      />
    );
  };

  return (
    <Layout showLogo={false} fullBleed={true}>
      {/* 
        Full-bleed scrollytelling container.
        We rely on the global overflow-x: hidden from index.css.
      */}
      <div className="w-full bg-[#f0ede8] selection:bg-primary/20">
        {/* Hero */}
        <ScrollVideoHero 
          videoSrc="/hero-video.mp4" 
          scrollDistance="250vh" 
          ctaContent={renderCTA()}
        />

        {/* Photo Gallery — now the second section */}
        <ScrollGallery />
      </div>
      
      {/* Re-mounting the CTA inside the Hero via portal if needed, 
          but I'll update ScrollVideoHero to accept the CTA as a child/prop for better React best practices */}

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        {/* ... existing Location Dialog content ... */}
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Localização Necessária</DialogTitle>
            <DialogDescription>
              Para realizar o check-in, é necessário ativar a localização do seu dispositivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsLocationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => {
              setIsLocationDialogOpen(false);
              navigate('/checkin');
            }}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anniversary Popup */}
      <Dialog open={showAnniversary} onOpenChange={setShowAnniversary}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] p-0 overflow-hidden bg-transparent border-none shadow-none focus:outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Comunicado Especial</DialogTitle>
            <DialogDescription>
              Banner comemorativo dos 11 anos da AeC em Arapiraca.
            </DialogDescription>
          </DialogHeader>
          <div className="relative animate-in fade-in zoom-in duration-500">
            <button 
              onClick={() => setShowAnniversary(false)}
              className="absolute top-4 right-4 z-50 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/20"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <video 
              src="/11 anos.mp4" 
              autoPlay 
              controls
              loop 
              muted 
              playsInline
              className="w-full h-auto rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
