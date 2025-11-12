import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig' // adapt path if different

const user = ref(null)          // Firebase user object (or null)
const initialized = ref(false) // becomes true once initial state known

// subscribe once on import
onAuthStateChanged(auth, (u) => {
  user.value = u // u is null when signed out or a firebase.User when signed in
  initialized.value = true
  console.log('Auth state changed, user is now:', u)
})

export function useAuth() {
  return { user, initialized }
}