import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GradientButton, GlassCard } from '../components/LayoutComponents';
import { addEvaluation, getCurrentUser } from '../utils/api';
import { toast } from "sonner";
import { Star, CheckCircle2, Circle, PartyPopper } from 'lucide-react';

const EvaluationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rating: 0,
    lectureRating: 0,
    bestMoment: "",
    improvements: "",
    energy: "",
    phrase: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const starLabels: Record<number, string> = {
    1: "Não gostei",
    2: "Abaixo do esperado",
    3: "Bom, pode melhorar",
    4: "Gostei bastante",
    5: "Incrível!"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.rating === 0) {
      toast.error("Por favor, selecione uma nota para o evento.");
      return;
    }

    if (form.lectureRating === 0) {
      toast.error("Por favor, selecione uma nota para a palestra.");
      return;
    }

    if (!form.energy) {
      toast.error("Por favor, avalie a energia da equipe.");
      return;
    }

    setLoading(true);

    try {
      await addEvaluation({
        rating_general: form.rating,
        rating_lecture: form.lectureRating,
        best_moment: form.bestMoment,
        improvements: form.improvements,
        team_energy: form.energy,
        phrase_completion: form.phrase,
        user_name: getCurrentUser()?.name || 'Anônimo'
      });

      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting evaluation:", error);
      toast.error(`Erro: ${error.message || 'Erro desconhecido ao enviar avaliação.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout variant="geometric">
        <GlassCard className="max-w-md text-center animate-fade-in">
          <PartyPopper className="w-16 h-16 mx-auto mb-4 text-secondary" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Obrigado!</h2>
          <p className="text-muted-foreground mb-6">
            Sua avaliação foi enviada com sucesso.
          </p>
          <GradientButton
            text="Voltar ao Início"
            onClick={() => navigate('/menu')}
          />
        </GlassCard>
      </Layout>
    );
  }

  return (
    <Layout variant="geometric">
      <div className="w-full max-w-2xl mx-auto animate-fade-in pb-10 px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Pesquisa de Reação
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Sua opinião é fundamental para nós!</p>
        </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Stars Rating Event */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                  1. O Evento
                </label>
                <div className="flex justify-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, rating: s })}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        fill={s <= form.rating ? "hsl(46, 100%, 47%)" : "transparent"}
                        color={s <= form.rating ? "hsl(46, 100%, 47%)" : "#CBD5E1"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] text-primary font-bold h-4">
                  {starLabels[form.rating] || "Toque para avaliar"}
                </p>
              </div>

              {/* 2. Stars Rating Lecture */}
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                  2. A Palestra
                </label>
                <div className="flex justify-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, lectureRating: s })}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className="w-7 h-7 sm:w-8 sm:h-8"
                        fill={s <= form.lectureRating ? "hsl(46, 100%, 47%)" : "transparent"}
                        color={s <= form.lectureRating ? "hsl(46, 100%, 47%)" : "#CBD5E1"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] text-primary font-bold h-4">
                  {starLabels[form.lectureRating] || "Toque para avaliar"}
                </p>
              </div>
            </div>

            {/* 3. Best Moment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                  3. O que mais marcou?
                </label>
                <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-primary to-secondary transition-all duration-300">
                  <textarea
                    className="w-full p-3 rounded-[10px] bg-white text-foreground outline-none 
                      placeholder:text-muted-foreground/60 transition-all resize-none block text-sm"
                    rows={2}
                    value={form.bestMoment}
                    onChange={e => setForm({ ...form, bestMoment: e.target.value })}
                    placeholder="Conte-nos..."
                  />
                </div>
              </div>

              {/* 4. Improvements */}
              <div>
                <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                  4. Sugestões?
                </label>
                <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-primary to-secondary transition-all duration-300">
                  <textarea
                    className="w-full p-3 rounded-[10px] bg-white text-foreground outline-none 
                      placeholder:text-muted-foreground/60 transition-all resize-none block text-sm"
                    rows={2}
                    value={form.improvements}
                    onChange={e => setForm({ ...form, improvements: e.target.value })}
                    placeholder="Como melhorar?"
                  />
                </div>
              </div>
            </div>

            {/* 5. Team Energy */}
            <div>
              <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                5. Como avalia a energia da equipe?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Excelente", "Boa", "Regular"].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setForm({ ...form, energy: opt })}
                    className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 border-2 ${form.energy === opt
                      ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-md scale-[1.02]"
                      : "bg-white/60 border-slate-100 text-slate-500 hover:border-primary/20"
                      }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Phrase Completion */}
            <div>
              <label className="block text-[12px] font-bold uppercase text-slate-600 mb-2">
                6. O evento foi uma oportunidade de...
              </label>
              <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-primary to-secondary transition-all duration-300">
                <input
                  type="text"
                  className="w-full p-3 rounded-[10px] bg-white text-foreground outline-none 
                    placeholder:text-muted-foreground/60 transition-all block text-sm"
                  value={form.phrase}
                  onChange={e => setForm({ ...form, phrase: e.target.value })}
                  placeholder="Complete a frase..."
                />
              </div>
            </div>

            <div className="pt-2">
              <GradientButton
                type="submit"
                text={loading ? "Enviando..." : "Enviar Avaliação"}
                disabled={loading}
                className="shadow-2xl"
              />
            </div>
          </form>
      </div>
    </Layout>
  );
};

export default EvaluationPage;
