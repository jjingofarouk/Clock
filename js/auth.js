// auth.js
import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

class AuthHandler {
    constructor() {
        this.initializeAuthListeners();
    }

    initializeAuthListeners() {
        // Monitor auth state changes
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                await this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });
    }

    async handleUserLogin(user) {
        // Check if user exists in database
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user profile
            await setDoc(userRef, {
                email: user.email,
                username: user.displayName || 'User',
                avatar: user.photoURL || '/images/default-avatar.png',
                points: 0,
                level: 1,
                completedActs: 0,
                streak: 0,
                createdAt: new Date()
            });
        }

        // Update UI for logged in state
        this.updateUIForUser(user);
    }

    handleUserLogout() {
        // Update UI for logged out state
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('loginButton').style.display = 'block';
    }

    async signInWithEmail(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    }

    async signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Facebook:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }
}

export const authHandler = new AuthHandler();
