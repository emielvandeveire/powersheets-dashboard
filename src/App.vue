<script setup>
import { ref } from 'vue'
import SignIn from './components/SignIn.vue'
import { useAuth } from './useAuth.js'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'
import Loading from './Loading.vue'

const { user } = useAuth();

const loading = ref(true);


async function signOutUser() {
    try {
        await signOut(auth)
        // useAuth onAuthStateChanged will update `user` to null
    } catch (err) {
        console.error('Sign out failed', err)
        alert('Failed to sign out: ' + (err && err.message ? err.message : err))
    }
}

async function findSheets() {
    // avoid running when no user (prevents "cannot read properties of null" crashes)
    if (!user.value || !user.value.email) {
        console.warn('findSheets: no user, clearing sheets')
        sheets.value = []
        templateSheet.value = null
        return { sheets: [] }
    }

    const url = "https://script.google.com/macros/s/AKfycbwF9QZCKDXY0VFW2Y9N-C0EcBJKIsHN6_27l0PG9zifKJ1ms1_A6FMRh51qphUfFhYIvA/exec";
    const urlWithParam = `${url}?coachEmail=${encodeURIComponent(user.value.email)}`;

    const response = await fetch(urlWithParam);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Request failed: ${response.status} ${text}`);
    }

    const result = await response.json().catch(() => null);
    console.log('Sheets found: ' + JSON.stringify(result));

    // add them to the sheets list
    sheets.value = result.sheets || [];
    sheets.value = sheets.value.filter(s => !s.name.toLowerCase().includes('template'));
    templateSheet.value = result.sheets ? result.sheets.find(s => s.name.toLowerCase().includes('template')) : null;
    return result;
}

// existing helper (kept for other debug/requests)
// returns parsed JSON result or throws on error
async function newSheet(athleteEmail, athleteName) {
    const url = "https://script.google.com/macros/s/AKfycbwF9QZCKDXY0VFW2Y9N-C0EcBJKIsHN6_27l0PG9zifKJ1ms1_A6FMRh51qphUfFhYIvA/exec";
    const data = {
        coachEmail: user.value.email, //"evdv3d@gmail.com",
        athleteEmail: athleteEmail,
        athleteName: athleteName,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.log('Error response text: ' + text);
        throw new Error(`Request failed: ${response.status} ${text}`);
    } else {
        const text = await response.text().catch(() => '');
        console.log('No error response text: ' + text);
    }

    const result = await response.json().catch(() => null);
    return result;
}

const templateSheet = ref(null);

const sheets = ref([
    // { id: 1, name: 'John Smith', url: 'https://example.com/sheet/1' },
    // { id: 2, name: 'Steve Johnson', url: 'https://example.com/sheet/2' },
    // { id: 3, name: 'Tim Lee', url: 'https://example.com/sheet/3' },
])

// Modal state and form fields for creating a new sheet
const showModal = ref(false)
const athleteEmail = ref('')
const athleteName = ref('')

function openModal() {
    athleteEmail.value = ''
    athleteName.value = ''
    showModal.value = true
}

function closeModal() {
    showModal.value = false
}

const isSaving = ref(false)

async function saveNewSheet() {
    // simple validation
    if (!athleteName.value.trim() || !athleteEmail.value.trim()) {
        alert('Please fill both fields')
        return
    }

    if (isSaving.value) return

    isSaving.value = true
    try {
        // call remote helper (may throw)
        await newSheet(athleteEmail.value, athleteName.value)

        // append to local list (demo behavior)
        // const nextId = sheets.value.length ? Math.max(...sheets.value.map(s => s.id)) + 1 : 1
        // sheets.value.push({ id: nextId, name: athleteName.value.trim(), link: '#new' })
        findSheets();
        closeModal()
    } catch (err) {
        // show error and keep modal open
        alert('Failed to create sheet: ' + (err && err.message ? err.message : err))
    } finally {
        isSaving.value = false
    }
}

// make a listener for user state chang
onAuthStateChanged(auth, (u) => {
    loading.value = false;
    console.log("state change in auth", u);
    if (u) {
        findSheets().catch(err => {
            console.error('findSheets failed', err);
            // keep UI stable on errors
            sheets.value = [];
            templateSheet.value = null;
        });
    } else {
        sheets.value = [];
        templateSheet.value = null;
    }
});
</script>


<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <Loading v-if="loading" />
    <SignIn v-else-if="!user" />
    <div v-else>
        <div class="app">
            <header class="navbar">
                <!-- <div class="logo">PowerSheets</div> -->
                <img src="./icons/powersheets.png" alt="" class="logo">
                <div class="nav-actions">
                    <!-- <div class="user-email" v-if="user">{{ user.email }}</div> -->
                    <button class="btn ghost signout" v-if="user" @click="signOutUser">
                        <span class="material-icons">logout</span>
                        Sign out
                    </button>
                </div>
            </header>
            <main class="main">
                <div class="main-header">
                    <div>
                        <h1>Welcome to the PowerSheets Dashboard</h1>
                        <p class="demo">Here you can access all your coaching sheets.</p>
                    </div>

                    <div class="toolbar">
                        <button class="btn new" @click="openModal">
                            <span class="material-icons">add</span>
                            New sheet
                        </button>
                    </div>
                </div>

                <h2>Template Sheet</h2>
                <div class="sheets-wrap">
                    <table class="sheets" aria-label="Demo sheets">
                        <tbody>
                            <tr v-if="templateSheet">
                                <td class="name">{{ templateSheet.name }}</td>
                                <td class="link">
                                    <a :href="templateSheet.url || '#'" target="_blank" rel="noopener">Open</a>
                                </td>
                                <td class="actions">
                                    <button class="icon" title="Edit sharing" @click.prevent>
                                        <span class="material-icons">share</span>
                                    </button>
                                    <button class="icon" title="Delete sheet" @click.prevent>
                                        <span class="material-icons">delete</span>
                                    </button>
                                </td>
                            </tr>
                            <tr v-else>
                                <td colspan="3" class="demo">No template sheet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2>Athlete Sheets</h2>
                <section class="sheets-wrap">
                    <table class="sheets" aria-label="Demo sheets">
                        <thead>
                            <tr>
                                <th>Sheet name</th>
                                <th>Sheet link</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="sheets.length === 0">
                                <td colspan="3" class="demo">No sheets found</td>
                            </tr>

                            <template v-else>
                                <tr v-for="sheet in sheets" :key="sheet.id">
                                    <td class="name">{{ sheet.name }}</td>
                                    <td class="link"><a :href="sheet.url" target="_blank" rel="noopener">Open</a></td>
                                    <td class="actions">
                                        <button class="icon" title="Edit sharing" @click.prevent>
                                            <span class="material-icons">share</span>
                                        </button>
                                        <button class="icon" title="Delete sheet" @click.prevent>
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </section>
                <!-- New sheet modal -->
                <div v-if="showModal" class="modal-overlay" role="dialog" aria-modal="true">
                    <div class="modal">
                        <h2>New Sheet</h2>
                        <p class="modal-sub">Create a new sheet for an athlete</p>

                        <label class="field">
                            <div class="field-label">Athlete email</div>
                            <input type="email" v-model="athleteEmail" placeholder="athlete@example.com"
                                :disabled="isSaving" />
                        </label>

                        <label class="field">
                            <div class="field-label">Athlete name</div>
                            <input type="text" v-model="athleteName" placeholder="Full name" :disabled="isSaving" />
                        </label>

                        <div class="modal-actions">
                            <button class="btn ghost" @click="closeModal" :disabled="isSaving">Cancel</button>
                            <button class="btn primary" :disabled="isSaving" @click="saveNewSheet">
                                <span v-if="isSaving" class="spinner" aria-hidden="true"></span>
                                <span v-if="isSaving">Creating...</span>
                                <span v-else>Create</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>


<style lang="scss">
@import 'src/style.css';

/* Modal styles */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 60;
}

.modal {
    background: #060606;
    color: #fff;
    padding: 20px;
    border-radius: 10px;
    width: 420px;
    max-width: calc(100% - 32px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.modal h2 {
    margin: 0 0 6px 0;
    font-size: 1.125rem;
}

.modal-sub {
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

.field {
    display: block;
    margin-bottom: 12px;
}

.field-label {
    font-size: 0.8rem;
    margin-bottom: 6px;
    color: rgba(255, 255, 255, 0.8);
}

.field input {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    color: #fff;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}

.btn.ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
}

.btn.primary {
    background: #B91F27;
    border: none;
    padding: 8px 12px;
    color: #fff;
    border-radius: 8px;
}

/* spinner */
.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>