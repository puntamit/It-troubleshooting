import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bgxcskftzqlohortnhlu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneGNza2Z0enFsb2hvcnRuaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTQzNzIsImV4cCI6MjA4MzkzMDM3Mn0.X-woBI_hBOpcrYST7v0sMOcjMZofcYZg78q1-jjXKlU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

async function testConnection() {
    console.log("Testing Supabase Connection...");
    const start = Date.now();
    try {
        // Try a login with obviously fake credentials to test connectivity
        // We expect a 400 error (Invalid login credentials). 
        // If we get a timeout or network error, that's the bug.
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'test_connectivity@internal.com',
            password: 'wrong_password'
        });

        const duration = Date.now() - start;
        console.log(`Request took ${duration}ms`);

        if (error) {
            console.log("Response Received (Error):");
            console.log(`Status: ${error.status}`);
            console.log(`Message: ${error.message}`);
            console.log(`Name: ${error.name}`);
        } else {
            console.log("Response Received (Success???):");
            console.log(data);
        }
    } catch (err) {
        console.error("UNEXPECTED EXCEPTION:");
        console.error(err);
    }
}

testConnection();
