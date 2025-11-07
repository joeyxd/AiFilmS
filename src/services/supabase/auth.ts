import { supabase } from './client';
import { AuthError, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  website_url?: string;
  social_links?: any;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  is_verified: boolean;
  creator_score: number;
  job_role?: 'director' | 'producer' | 'content-creator' | 'marketing-manager' | 'student' | 'freelancer' | 'business-owner' | 'other';
  company_type?: 'Production Company' | 'Marketing Agency' | 'Startup' | 'Enterprise' | 'Freelance' | 'Student/Educational' | 'Non-profit' | 'Other';
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  jobRole: string;
  companyType: string;
  companySize: string;
}

export class AuthService {
  // Sign up new user
  static async signUp(data: RegistrationData) {
    try {
      console.log('Starting sign up process with:', data);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.email.split('@')[0], // Default username from email
          }
        }
      });

      console.log('Supabase auth signUp result:', { authData, authError });

      if (authError) throw authError;

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at && authData.session === null) {
        console.log('Email confirmation required. User will need to check email.');
        return { 
          data: authData, 
          error: null,
          needsEmailConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete registration.'
        };
      }

      // If user is immediately confirmed or email confirmation is disabled
      if (authData.user && authData.session) {
        console.log('User is confirmed, updating profile...');
        
        // Wait a moment for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile with registration data
        console.log('Updating user profile with:', {
          job_role: data.jobRole,
          company_type: data.companyType,
          company_size: data.companySize,
        });

        const updateResult = await this.updateProfile(authData.user.id, {
          job_role: data.jobRole as any,
          company_type: data.companyType as any,
          company_size: data.companySize as any,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

        if (updateResult.error) {
          console.error('Profile update failed:', updateResult.error);
          // Don't fail the entire registration, just log the error
          // The user can complete onboarding later
        } else {
          console.log('Profile updated successfully:', updateResult.data);
        }
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in result:', { data, error });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: error as AuthError };
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as AuthError };
    }
  }

  // Get current session
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error: error as AuthError };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error: error as AuthError };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      console.log('=== getUserProfile START ===', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 10000); // 10 second timeout
      });
      
      // Check current session
      const sessionCheck = supabase.auth.getSession();
      const sessionResult = await Promise.race([sessionCheck, timeoutPromise]);
      const { data: sessionData } = sessionResult as any;
      
      console.log('=== CURRENT SESSION ===', {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        tokenPresent: !!sessionData.session?.access_token
      });
      
      if (!sessionData.session) {
        console.error('❌ No session found - cannot query profile');
        return { profile: null, error: new Error('No authenticated session') };
      }
      
      // Query with timeout
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const queryResult = await Promise.race([queryPromise, timeoutPromise]);
      const { data, error } = queryResult as any;

      console.log('=== getUserProfile RAW RESPONSE ===', { data, error });

      if (error) {
        console.log('=== getUserProfile ERROR ===', error);
        
        // If profile doesn't exist (PGRST116 = no rows found), this is a data integrity issue
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.error('=== CRITICAL: USER HAS NO PROFILE ===');
          console.error('This indicates a data integrity issue. User should be signed out.');
          console.error('Profiles should only be created during registration, not here.');
          
          // Return null to trigger sign out in AuthContext
          return { profile: null, error: new Error('User profile not found - data integrity issue') };
        }
        
        // For other errors, return the error
        return { profile: null, error };
      }

      if (!data) {
        console.log('=== getUserProfile NO DATA (should not happen after single()) ===');
        return { profile: null, error: new Error('No profile data returned') };
      }

      // Type the response as any to handle potential missing fields
      const rawData = data as any;
      console.log('=== getUserProfile RAW DATA ===', rawData);

      // Ensure all required fields have default values if missing
      const profile: UserProfile = {
        id: rawData.id,
        username: rawData.username || 'User',
        avatar_url: rawData.avatar_url || undefined,
        bio: rawData.bio || undefined,
        website_url: rawData.website_url || undefined,
        social_links: rawData.social_links || undefined,
        subscription_tier: (rawData.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
        is_verified: rawData.is_verified || false,
        creator_score: rawData.creator_score || 0,
        job_role: rawData.job_role || undefined,
        company_type: rawData.company_type || undefined,
        company_size: rawData.company_size || undefined,
        onboarding_completed: rawData.onboarding_completed || false,
        onboarding_completed_at: rawData.onboarding_completed_at || undefined,
        created_at: rawData.created_at || new Date().toISOString(),
        updated_at: rawData.updated_at || new Date().toISOString()
      };

      console.log('=== getUserProfile FINAL PROFILE ===', profile);
      return { profile, error: null };
    } catch (error) {
      console.error('=== getUserProfile CATCH ERROR ===', error);
      return { profile: null, error };
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Type the response as any to handle potential missing fields
      const rawData = data as any;

      // Ensure all required fields have default values if missing
      const profile: UserProfile = {
        id: rawData.id,
        username: rawData.username,
        avatar_url: rawData.avatar_url || undefined,
        bio: rawData.bio || undefined,
        website_url: rawData.website_url || undefined,
        social_links: rawData.social_links || undefined,
        subscription_tier: (rawData.subscription_tier as 'free' | 'pro' | 'enterprise') || 'free',
        is_verified: rawData.is_verified || false,
        creator_score: rawData.creator_score || 0,
        job_role: rawData.job_role || undefined,
        company_type: rawData.company_type || undefined,
        company_size: rawData.company_size || undefined,
        onboarding_completed: rawData.onboarding_completed || false,
        onboarding_completed_at: rawData.onboarding_completed_at || undefined,
        created_at: rawData.created_at,
        updated_at: rawData.updated_at
      };

      return { data: profile, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  }

  // Check if user has required subscription tier
  static hasSubscriptionAccess(userTier: string, requiredTier: string): boolean {
    const tierLevels = {
      'free': 0,
      'pro': 1,
      'enterprise': 2
    };

    return tierLevels[userTier as keyof typeof tierLevels] >= tierLevels[requiredTier as keyof typeof tierLevels];
  }

  // Get user role-based dashboard type
  static getDashboardType(profile: UserProfile): 'admin' | 'enterprise' | 'pro' | 'free' {
    // Check if admin (you can add admin logic here based on email domains, specific IDs, etc.)
    if (profile.is_verified && profile.creator_score > 1000) {
      return 'admin';
    }

    // Check subscription tier
    switch (profile.subscription_tier) {
      case 'enterprise':
        return 'enterprise';
      case 'pro':
        return 'pro';
      default:
        return 'free';
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  }
}
