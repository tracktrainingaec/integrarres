import { supabase } from '../lib/supabase';

export interface Event {
    id?: string;
    name: string;
    slug: string;
    keyword: string;
    active: boolean;
    created_at?: string;
}

// Types (Mirrors of the DB schema)
export interface Checkin {
    id?: string;
    event_id?: string;
    user_name: string;
    user_email?: string | null;
    matricula?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    created_at?: string;
}

export interface WordEntry {
    id?: string;
    event_id?: string;
    text: string;
    approved?: boolean;
    created_at?: string;
}

export interface Evaluation {
    id?: string;
    event_id?: string;
    rating_general: number;
    rating_lecture?: number;
    best_moment?: string;
    improvements?: string;
    team_energy?: string;
    phrase_completion?: string;
    user_name?: string;
    created_at?: string;
}

export interface DrawWinner {
    id?: string;
    event_id: string;
    winner_name: string;
    winner_identifier: string;
    draw_value: string;
    created_at?: string;
}

// Checkins
export const addCheckin = async (checkin: Checkin) => {
    // If event_id is not provided, get the active one
    let finalCheckin = { ...checkin };
    if (!finalCheckin.event_id) {
        const activeEvent = await getActiveEvent();
        if (activeEvent) finalCheckin.event_id = activeEvent.id;
    }

    const { data, error } = await supabase
        .from('checkins')
        .insert([finalCheckin])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getCheckins = async (eventId?: string) => {
    let query = supabase
        .from('checkins')
        .select('*')
        .order('created_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

// Word Cloud
export const addWord = async (text: string, eventId?: string) => {
    let finalEventId = eventId;
    if (!finalEventId) {
        const activeEvent = await getActiveEvent();
        finalEventId = activeEvent?.id;
    }

    const { data, error } = await supabase
        .from('word_cloud')
        .insert([{ text, approved: true, event_id: finalEventId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getWords = async (eventId?: string) => {
    let finalEventId = eventId;
    if (!finalEventId) {
        const activeEvent = await getActiveEvent();
        finalEventId = activeEvent?.id;
    }

    if (!finalEventId) return [];

    const { data, error } = await supabase
        .from('word_cloud')
        .select('*')
        .eq('approved', true)
        .eq('event_id', finalEventId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// Admin: Get all words (including unapproved)
export const getAllWords = async (eventId?: string) => {
    let query = supabase
        .from('word_cloud')
        .select('*')
        .order('created_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const approveWord = async (id: string, approved: boolean) => {
    const { error } = await supabase
        .from('word_cloud')
        .update({ approved })
        .eq('id', id);

    if (error) throw error;
};

export const deleteWord = async (id: string) => {
    const { error } = await supabase
        .from('word_cloud')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Evaluations
export const addEvaluation = async (evaluation: Evaluation) => {
    let finalEvaluation = { ...evaluation };
    if (!finalEvaluation.event_id) {
        const activeEvent = await getActiveEvent();
        finalEvaluation.event_id = activeEvent?.id;
    }

    const { data, error } = await supabase
        .from('evaluations')
        .insert([finalEvaluation])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getEvaluations = async (eventId?: string) => {
    let query = supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

// Current User (Session persistence)
export const setCurrentUser = (name: string, email: string | null, matricula: string | null) => {
    const session = { name, email, matricula };
    localStorage.setItem('user_session', JSON.stringify(session));
    // Keep legacy for backward compatibility if needed, or remove
    localStorage.setItem('userName', name);
};

export const getCurrentUser = () => {
    const sessionStr = localStorage.getItem('user_session');
    if (sessionStr) return JSON.parse(sessionStr);

    // Fallback for old sessions
    const legacyName = localStorage.getItem('userName');
    return legacyName ? { name: legacyName, email: '', matricula: '' } : null;
};

// --- Jewels Feature ---

export const saveJewelChoice = async (email: string, matricula: string, jewelName: string, eventId?: string) => {
    let finalEventId = eventId;
    if (!finalEventId) {
        const activeEvent = await getActiveEvent();
        finalEventId = activeEvent?.id;
    }

    const { data, error } = await supabase
        .from('jewel_choices')
        .insert([
            { user_email: email, matricula: matricula, jewel_name: jewelName, event_id: finalEventId }
        ]);

    if (error) {
        console.error('Error saving jewel:', error);
        throw error;
    }
    return data;
};

export const getUserJewel = async (email: string, eventId?: string) => {
    let query = supabase
        .from('jewel_choices')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(1);

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found', which is fine
        console.error('Error getting user jewel:', error);
    }
    return data;
};

export const getJewelStats = async (eventId?: string) => {
    let query = supabase
        .from('jewel_choices')
        .select('jewel_name');

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error getting stats:', error);
        return [];
    }

    // Count occurrences
    const stats: Record<string, number> = {};
    data.forEach((row: any) => {
        stats[row.jewel_name] = (stats[row.jewel_name] || 0) + 1;
    });

    return Object.entries(stats).map(([name, count]) => ({ name, count }));
};

// --- Events Management ---

export const getEvents = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const getActiveEvent = async () => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
};

export const createEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const setActiveEvent = async (id: string) => {
    // Step 1: Deactivate all events
    const { error: deactivateError } = await supabase
        .from('events')
        .update({ active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows

    if (deactivateError) throw deactivateError;

    // Step 2: Activate the target event
    const { data, error: activateError } = await supabase
        .from('events')
        .update({ active: true })
        .eq('id', id)
        .select()
        .single();

    if (activateError) throw activateError;
    return data;
};

// --- Raffle Winners ---

export const addWinner = async (winner: DrawWinner) => {
    const { data, error } = await supabase
        .from('raffle_winners')
        .insert([winner])
        .select()
        .single();

    if (error) {
        console.error('Error saving winner:', error);
        throw error;
    }
    return data;
};

export const getWinners = async (eventId: string) => {
    const { data, error } = await supabase
        .from('raffle_winners')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching winners:', error);
        return [];
    }
    return data || [];
};

export const clearWinners = async (eventId: string) => {
    const { error } = await supabase
        .from('raffle_winners')
        .delete()
        .eq('event_id', eventId);

    if (error) {
        console.error('Error clearing winners:', error);
        throw error;
    }
};
// --- Chat History ---

export const saveChatMessage = async (email: string, role: 'user' | 'assistant', content: string) => {
    const { data, error } = await supabase
        .from('chat_history')
        .insert([{ user_email: email, role, content }]);

    if (error) {
        console.error('Error saving chat:', error);
        throw error;
    }
    return data;
};

export const getChatHistory = async (email: string, limit = 10) => {
    const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
    // Return in chronological order
    return (data || []).reverse();
};
