<script>
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default {
    methods: {
        async signInWithGoogle() {
            const provider = new GoogleAuthProvider();
            const auth = getAuth();
            try {
                const result = await signInWithPopup(auth, provider);
                // User signed in successfully
                const user = result.user;
                console.log('User signed in:', user);
                // Redirect or update UI
            } catch (error) {
                console.error('Google Sign-In error:', error.message);
            }
        },
        signOut() {
            signOut()
        }
    }
};
</script>


<template>
    <div class="app signin">
        <h2>Sign in</h2>
        <p class="subtitle">Sign in to access PowerSheets</p>
        <button v-on:click="signInWithGoogle" class="btn" id="google-button">
            <img src="../icons/google.svg" alt="">
            Continue with Google
        </button>
    </div>
</template>

<style lang="scss">
@import 'src/style.css';

.signin {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.subtitle {
    color: rgba(255, 255, 255, 0.75);
    margin-top: 4px;
    margin-bottom: 12px;
}

#google-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: white;
    color: black;
    font-weight: bold;
}

#google-button img {
    width: 18px;
    height: 18px;
}
</style>