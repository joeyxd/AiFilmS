// Quick script to mark existing user as onboarding complete
// Run this in browser console to fix your user profile

const markOnboardingComplete = async () => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('No user found');
    return;
  }
  
  console.log('Updating onboarding status for user:', user.id);
  
  // Update the profile to mark onboarding as complete
  const { data, error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select();
  
  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Profile updated successfully:', data);
    window.location.reload(); // Reload page to get fresh data
  }
};

// Run the function
markOnboardingComplete();
