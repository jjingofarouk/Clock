// auth.js
import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

// Styles for auth-related UI elements
const styles = {
    userProfile: {
        container: 'bg-white rounded-lg shadow-md p-4 flex items-center space-x-4',
        avatar: 'w-12 h-12 rounded-full object-cover',
        info: 'flex flex-col',
        name: 'font-semibold text-gray-800',
        level: 'text-sm text-emerald-600',
        streak: 'text-xs text-amber-600'
    },
    authButtons: {
        base: 'flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200',
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        social: 'border border-gray-300 hover:bg-gray-50',
        icon: 'w-5 h-5 mr-2'
    },
    toast: {
        success: 'bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-4',
        error: 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4'
    }
};

class AuthHandler {
    constructor() {
        this.initializeAuthListeners();
        this.loginStreak = 0;
        this.lastLoginDate = null;
    }

    initializeAuthListeners() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                await this.handleUserLogin(user);
                this.showToast('Welcome back! Ready to spread some kindness?', 'success');
            } else {
                this.handleUserLogout();
            }
        });
    }

    async handleUserLogin(user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user profile with kindness-focused metrics
            await setDoc(userRef, {
                email: user.email,
                username: user.displayName || 'Kind Soul',
                avatar: user.photoURL || '/images/default-avatar.png',
                points: 0,
                level: 1,
                completedActs: 0,
                streak: 0,
                impactedPeople: 0,
                favoriteCategories: [],
                badges: ['newcomer'],
                createdAt: new Date(),
                lastLogin: new Date(),
                personalGoal: ''
            });
        } else {
            // Update streak and last login
            await this.updateLoginStreak(userRef, userDoc.data());
        }

        this.updateUIForUser(user);
        await this.checkAndAwardMilestones(userRef, userDoc.data());
    }

    async updateLoginStreak(userRef, userData) {
        const today = new Date();
        const lastLogin = userData.lastLogin?.toDate() || today;
        const daysSinceLastLogin = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));

        let newStreak = userData.streak || 0;
        if (daysSinceLastLogin === 1) {
            // Consecutive day login
            newStreak += 1;
            if (newStreak % 7 === 0) {
                this.showToast('🌟 Amazing! You've maintained a ' + newStreak + ' day streak of kindness!', 'success');
            }
        } else if (daysSinceLastLogin > 1) {
            newStreak = 1;
        }

        await updateDoc(userRef, {
            streak: newStreak,
            lastLogin: today
        });
    }

    async checkAndAwardMilestones(userRef, userData) {
        const milestones = {
            completedActs: [10, 50, 100, 500],
            impactedPeople: [50, 200, 1000],
            streak: [7, 30, 100]
        };

        for (const [category, thresholds] of Object.entries(milestones)) {
            const currentValue = userData[category];
            const achievedMilestone = thresholds.find(t => currentValue >= t && !userData.badges.includes(`${category}_${t}`));
            
            if (achievedMilestone) {
                const newBadge = `${category}_${achievedMilestone}`;
                await updateDoc(userRef, {
                    badges: [...userData.badges, newBadge],
                    points: increment(100)
                });
                this.showToast(`🎉 Congratulations! You've earned the ${this.formatBadgeName(newBadge)} badge!`, 'success');
            }
        }
    }

    formatBadgeName(badge) {
        const [category, value] = badge.split('_');
        const categories = {
            completedActs: 'Kind Soul',
            impactedPeople: 'Impact Maker',
            streak: 'Consistency'
        };
        return `${categories[category]} Level ${value}`;
    }

    handleUserLogout() {
        const elements = {
            userProfile: document.getElementById('userProfile'),
            loginButton: document.getElementById('loginButton')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                element.style.display = key === 'loginButton' ? 'block' : 'none';
            }
        });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = styles.toast[type];
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user);
                this.showToast('Please verify your email to access all features!', 'info');
            }
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        provider.addScope('public_profile');
        provider.addScope('email');
        
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            this.showToast('Password reset email sent! Please check your inbox.', 'success');
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    handleAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/email-already-in-use': 'An account already exists with this email.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/popup-closed-by-user': 'Sign-in was cancelled.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };

        const message = errorMessages[error.code] || 'An error occurred during authentication.';
        this.showToast(message, 'error');
    }

    async signOut() {
        try {
            await auth.signOut();
            this.showToast('Come back soon to spread more kindness!', 'success');
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }
}

export const authHandler = new AuthHandler();
