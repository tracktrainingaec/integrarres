import { supabase } from "../lib/supabase";
import { AEC_KNOWLEDGE } from "./knowledge";

export const getAIResponse = async (message: string, userName?: string, history: any[] = [], context?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: { 
        message, 
        userName,
        history,
        context: context || AEC_KNOWLEDGE 
      },
    });

    if (error) {
      console.error("Erro na Supabase Function:", error);
      throw error;
    }

    return data.content || "Desculpe, não consegui processar sua pergunta.";
  } catch (error) {
    console.error("Erro ao chamar consultor:", error);
    return "Ocorreu um erro ao falar com o consultor. Tente novamente em instantes.";
  }
};
