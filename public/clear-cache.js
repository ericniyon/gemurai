// Clear browser cache and localStorage for testing
console.log('🧹 Clearing browser cache and localStorage...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  console.log('✅ localStorage cleared');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
}

// Clear specific auth items
const authKeys = ['Gemurai_user', 'Gemurai_token', 'auth_token', 'user_data'];
authKeys.forEach(key => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(key);
  }
});

console.log('✅ All authentication data cleared');
console.log('🔄 Please refresh the page to start with clean state'); 