// Emergency fix - disable profile loading temporarily
console.log('🚨 EMERGENCY: Disabling profile loading to get unstuck');

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear any Supabase storage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ Storage cleared - page will reload');
window.location.href = '/login';
