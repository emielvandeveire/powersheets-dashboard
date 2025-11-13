<script setup>
import { signOut } from 'firebase/auth'
import { ref, onMounted } from 'vue';
import { useAuth } from './useAuth.js'
import { auth } from './firebaseConfig'

const progressPercent = ref(0);


onMounted(() => {
    setTimeout(() => {
        progressPercent.value = 95;
    }, 100);
});

async function signOutUser() {
    try {
        await signOut(auth)
        // useAuth onAuthStateChanged will update `user` to null
    } catch (err) {
        console.error('Sign out failed', err)
        alert('Failed to sign out: ' + (err && err.message ? err.message : err))
    }
}

</script>


<template>
    <div class="app loading-screen">
        <img src="./icons/powersheets.png" alt="">
        <div class="loading-bar-container">
            <div class="loading-bar-progress" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <button class="btn ghost signout" @click="signOutUser">
            <span class="material-icons">logout</span>
            Sign out
        </button>
    </div>
</template>

<style>
@import './style.css';

.loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #121212;
    color: white;
}

.loading-screen img {
    width: 50%;
    max-width: 200px;
    height: auto;
}


/* The background of the loading bar */
.loading-bar-container {
    width: 80%;
    max-width: 300px;
    aspect-ratio: 65 / 1;
    background-color: #262626;
    border-radius: 10px;
    overflow: hidden;
    margin: 20px 0;
}

/* The animated progress bar */
.loading-bar-progress {
    height: 100%;
    width: 0;
    /* Starts at 0 width */
    background-color: #ffffff;
    border-radius: 10px;

    /* This is the animation!
    It matches your Flutter duration of 2 seconds.
  */
    transition: width 2s ease-out;
}
</style>
