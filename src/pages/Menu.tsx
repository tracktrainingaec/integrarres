import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton } from '../components/LayoutComponents';
import { getCurrentUser, getUserJewel } from '../utils/api';
import { toast } from 'sonner';
import { Diamond, LogOut, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import menuBg from '@/assets/menu-bg-white.png';



const Menu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string, email: string, matricula: string } | null>(null);
  const [userJewel, setUserJewel] = useState<{ jewel_name: string } | null>(null);

  // Google Drive photos folder link
  const LINK_FOTOS = "https://drive.google.com/";

  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
      fetchJewel(userData.email);
    }
  }, []);

  const fetchJewel = async (email: string) => {
    try {
      const jewel = await getUserJewel(email);
      if (jewel) setUserJewel(jewel);
    } catch (error) {
      console.error("Error fetching jewel", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('checkins');
    navigate('/');
  };

  return (
      <Layout variant="geometric" className="relative z-10 flex-1">
        <div className="w-full max-w-lg mx-auto px-6 pt-0 pb-20 space-y-6 animate-fade-in">
          
          {/* Header / User Info */}
          {user && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-2"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] opacity-70">Bem-vindo</span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  {user.name.split(' ')[0]}
                </h2>
              </div>
              <button 
                onClick={handleLogout}
                className="p-3 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all border border-slate-200"
              >
                <LogOut size={20} />
              </button>
            </motion.div>
          )}

          {/* Main Integrated Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden"
          >
            <div className="relative space-y-10 flex flex-col items-center text-center">
              {/* Message Section */}
              <div className="space-y-6 flex flex-col items-center w-full">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  Que bom ter você <br/>
                  <span className="text-primary italic">aqui conosco!</span>
                </h1>
                
                <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-[320px]">
                  Hoje começa sua <span className="text-slate-900 font-bold">experiência Integrar</span>, onde conexão e propósito se encontram.
                </p>
              </div>

              {/* AI Consultant - Subtle Integration */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-4 w-full">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-sm font-bold text-slate-900">Consultor Integrar</h4>
                  <p className="text-xs text-slate-500 leading-snug max-w-[240px]">
                    Dúvidas sobre o evento ou a AeC? Clique no ícone abaixo para falar comigo!
                  </p>
                </div>
              </div>

              {/* Final Message */}
              <div className="pt-2 w-full">
                <div className="py-6 px-4 rounded-3xl bg-slate-900 text-white text-center shadow-2xl">
                  <p className="text-sm font-medium opacity-80 uppercase tracking-[0.1em] mb-1">Integrar</p>
                  <p className="text-2xl font-black italic text-secondary tracking-tight">CONEXÃO E PROPÓSITO</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Spacing Fix for Mobile */}
          <div className="h-20 md:hidden" />
        </div>
      </Layout>
  );
};

export default Menu;
