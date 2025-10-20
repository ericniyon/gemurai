// Function to check application in storage
function checkApplication(applicationId) {
  console.log('Checking application:', applicationId);
  
  // Check localStorage
  const localStorageKey = `Gemurai_application_${applicationId}`;
  const localData = localStorage.getItem(localStorageKey);
  console.log('\nLocalStorage:');
  if (localData) {
    console.log('Found in localStorage:', JSON.parse(localData));
  } else {
    console.log('Not found in localStorage');
  }
  
  // Check sessionStorage
  const sessionData = sessionStorage.getItem('Gemurai_application_session');
  console.log('\nSessionStorage:');
  if (sessionData) {
    const session = JSON.parse(sessionData);
    if (session.applicationId === applicationId) {
      console.log('Found in sessionStorage:', session);
    } else {
      console.log('Different application in session:', session);
    }
  } else {
    console.log('No active session found');
  }
  
  // List all items in localStorage that start with Gemurai_application_
  console.log('\nAll application items in localStorage:');
  Object.keys(localStorage)
    .filter(key => key.startsWith('Gemurai_application_'))
    .forEach(key => {
      console.log(`- ${key}:`, JSON.parse(localStorage.getItem(key)));
    });
} 