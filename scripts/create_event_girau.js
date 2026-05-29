
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createIntegrarGirau() {
    console.log('Creating event: Integrar Girau...');
    
    const newEvent = {
        name: 'Integrar Girau',
        slug: 'integrar-girau',
        keyword: 'girau',
        active: false // Senior practice: create as inactive, let user activate via Dashboard
    };

    try {
        // First, check if it already exists
        const { data: existing } = await supabase
            .from('events')
            .select('*')
            .eq('slug', 'integrar-girau')
            .maybeSingle();

        if (existing) {
            console.log('Event "Integrar Girau" already exists with ID:', existing.id);
            return;
        }

        const { data, error } = await supabase
            .from('events')
            .insert([newEvent])
            .select()
            .single();

        if (error) throw error;

        console.log('Successfully created event:', data.name, '(ID:', data.id, ')');
    } catch (error) {
        console.error('Error creating event:', error.message);
        process.exit(1);
    }
}

createIntegrarGirau();
