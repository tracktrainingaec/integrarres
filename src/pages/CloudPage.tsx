import React, { useState } from 'react';
import { Layout, GradientInput } from '../components/LayoutComponents';
import { isWordAllowed, normalizeWord } from '../utils/wordModeration';
import { addWord } from '../utils/api';
import { toast } from "sonner";
import { Send } from 'lucide-react';

const CloudPage = () => {
  const [newWord, setNewWord] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = newWord.trim();

    if (!trimmedWord) return;

    if (trimmedWord.includes(' ')) {
      toast.error("Envie apenas uma palavra por vez.");
      return;
    }

    if (!isWordAllowed(trimmedWord)) {
      toast.error("Palavra não permitida.");
      setNewWord("");
      return;
    }

    setLoading(true);

    try {
      await addWord(normalizeWord(trimmedWord));
      toast.success("Palavra enviada!");
      setNewWord("");
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("Erro ao enviar palavra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout variant="geometric">
      <div className="w-full max-w-md mx-auto flex flex-col justify-center items-center min-h-[60vh] space-y-8 px-4 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Nuvem de Palavras
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-semibold max-w-[320px] mx-auto leading-relaxed">
            Envie uma palavra que representa sua experiência!
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-grow">
              <GradientInput
                placeholder="Digite uma palavra..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newWord.trim()}
              className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl text-white font-black 
                bg-gradient-to-r from-primary to-secondary
                hover:brightness-110 hover:scale-[1.03] transition-all duration-300 
                shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CloudPage;
