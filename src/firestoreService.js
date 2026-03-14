import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Existing function to get users
export async function getUsers() {
    console.log("Attempting to fetch users...");
    try {
        const usersCol = collection(db, 'users');
        const querySnapshot = await getDocs(usersCol);
        
        if (querySnapshot.empty) {
            console.log('No documents found in "users" collection.');
            return;
        }

        querySnapshot.forEach((doc) => {
            console.log(`User ID: ${doc.id}`, doc.data());
        });
        
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// New function to link an athlete to a coach and sheet
export async function addAthlete(coachEmail, spreadsheetId, athleteEmail) {
    console.log(`Attempting to link athlete ${athleteEmail} to coach ${coachEmail}...`);
    
    try {
        // We use the athlete's email as the Document ID for easy lookup later
        const userRef = doc(db, "users", athleteEmail);

        await setDoc(userRef, {
            role: "athlete",
            coachEmail: coachEmail,   // Link to the coach
            spreadsheetId: spreadsheetId, // Link to their specific sheet
            email: athleteEmail
        }, { merge: true }); // merge:true prevents overwriting existing fields (like 'name' or 'photo')

        console.log(`Success: Athlete ${athleteEmail} linked.`);
        
    } catch (error) {
        console.error("Error linking athlete:", error);
        throw error; // Re-throw so your UI knows it failed
    }
}
