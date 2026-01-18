import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const getProfile = async (userId) => {
        if (!userId) {
            console.log('AuthContext: getProfile called without userId');
            return;
        }
        console.log('AuthContext: getProfile starting for userId:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.log('AuthContext: getProfile database error:', error.code, error.message);
                if (error.code !== 'PGRST116') {
                    console.error('Error fetching profile:', error.message);
                }
                setProfile(null);
                return;
            }
            console.log('AuthContext: getProfile success:', data);
            setProfile(data);
        } catch (err) {
            console.error('AuthContext: Unexpected error in getProfile:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        let mounted = true;
        console.log('AuthContext: Mount initialized');

        // Safety timeout: If stuff hangs for > 25s, just stop loading
        const safetyTimer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('AuthContext: Safety timeout reached (25s)! Forcing loading to false. This likely means Supabase is unreachable from your network.');
                setLoading(false);
            }
        }, 25000);

        const initialize = async () => {
            console.log('AuthContext: Starting initialization sequence...');
            try {
                console.log('AuthContext: Calling supabase.auth.getSession()...');
                const { data: { session }, error } = await supabase.auth.getSession();
                console.log('AuthContext: supabase.auth.getSession() returned.');

                if (error) {
                    console.error('AuthContext: getSession error:', error);
                }

                if (!mounted) {
                    console.log('AuthContext: Component unmounted during init.');
                    return;
                }

                const currentUser = session?.user ?? null;
                console.log('AuthContext: Session retrieved. User:', currentUser?.email || 'None');
                setUser(currentUser);

                if (currentUser) {
                    console.log('AuthContext: User detected, launching profile fetch for ID:', currentUser.id);
                    // Launch profile fetch but don't AWAIT it here to prevent blocking initialization
                    getProfile(currentUser.id).then(() => {
                        console.log('AuthContext: Profile fetch async complete.');
                    });
                } else {
                    console.log('AuthContext: No user session found.');
                }
            } catch (err) {
                console.error('AuthContext: Initialization exception:', err);
            } finally {
                if (mounted) {
                    console.log('AuthContext: Sequence complete. Setting loading(false)');
                    setLoading(false);
                    clearTimeout(safetyTimer);
                    console.log('AuthContext: Safety timer cleared and loading set to false');
                }
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Auth state changed! Event:', event);
            if (!mounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // DON'T await here. Let profile load in background so app becomes interactive immediately.
                getProfile(currentUser.id).catch(err => console.error('Background profile fetch failed:', err));
            } else {
                setProfile(null);
            }

            setLoading(false);
            console.log('AuthContext: Loading forced to false (Profile loading in background)');
            clearTimeout(safetyTimer);
        });

        return () => {
            console.log('AuthContext: Unmounting');
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    const signIn = async (username, password) => {
        console.log('AuthContext: signIn attempt for:', username);
        const email = `${username}@internal.com`.toLowerCase();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Login timeout: Connection taking too long (25s). Please check your internet or VPN.')), 25000)
        );

        try {
            console.log('AuthContext: Sending signIn request to Supabase...');
            const startTime = Date.now();
            const { data, error } = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                timeoutPromise
            ]);
            console.log(`AuthContext: signIn responded in ${Date.now() - startTime}ms`);

            if (error) throw error;
            console.log('AuthContext: signIn success');
            return data;
        } catch (error) {
            console.error('AuthContext: signIn error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            throw error;
        }
    };

    const signUp = async (username, password) => {
        console.log('AuthContext: signUp attempt for:', username);
        const email = `${username}@internal.com`.toLowerCase();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sign up timeout: Connection taking too long (25s)')), 25000)
        );

        try {
            console.log('AuthContext: Sending signUp request to Supabase...');
            const startTime = Date.now();
            const { data, error } = await Promise.race([
                supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { display_name: username }
                    }
                }),
                timeoutPromise
            ]);
            console.log(`AuthContext: signUp responded in ${Date.now() - startTime}ms`);

            if (error) throw error;
            console.log('AuthContext: signUp success');
            return data;
        } catch (error) {
            console.error('AuthContext: signUp error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            throw error;
        }
    };

    const signOut = async () => {
        console.log('AuthContext: signOut starting...');
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SignOut timeout')), 3000)
        );

        try {
            // Force clear local state FIRST so UI responds immediately
            setUser(null);
            setProfile(null);
            console.log('AuthContext: Local state cleared (force)');

            console.log('AuthContext: Sending signOut request to Supabase...');
            await Promise.race([supabase.auth.signOut(), timeoutPromise]);
            console.log('AuthContext: Supabase signOut responded (or timed out)');
        } catch (error) {
            console.warn('AuthContext: signOut API call failed:', error.message);
        } finally {
            // Ensure state is cleared no matter what happened in the try block
            setUser(null);
            setProfile(null);
            console.log('AuthContext: signOut complete (State ensured null)');
        }
    };

    const resetPassword = async (email) => {
        console.log('AuthContext: resetPassword called for:', email);
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        return data;
    };

    const updatePassword = async (newPassword) => {
        console.log('AuthContext: updatePassword called');
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return data;
    };

    const value = {
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        user,
        profile,
        loading,
        refreshProfile: () => user && getProfile(user.id)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
