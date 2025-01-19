// script.js
import { authHandler } from './auth.js';
import { statsDashboard } from './stats-dashboard.js';
import { communityFeed } from './community-feed.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, increment } from 'firebase/firestore';

// Initialize push notifications
async function initializePushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
            });
            
            // Send subscription to server
            // Implementation details...
        }
    } catch (error) {
        console.error('Error initializing push notifications:', error);
    }
}

// Handle act generation
async function generateAct() {
    const button = document.getElementById('generateButton');
    button.disabled = true;
    
    try {
        // Show loading state
        document.getElementById('loading').style.display = 'block';
        
        // Fetch random act
        const act = await fetchRandomAct();
        
        // Update UI
        document.getElementById('kindnessAct').textContent = act.description;
        document.getElementById('category').textContent = act.category;
        document.getElementById('difficulty').textContent = act.difficulty;
        
    } catch (error) {
        document.getElementById('error').style.display = 'block';
    } finally {
        document.getElementById('loading').style.display = 'none';
        button.disabled = false;
    }
}

// Handle act completion
async function markCompleted() {
    const user = auth.currentUser;
    if (!user) {
        showAuthModal();
        return;
    }

    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            completedActs: increment(1),
            points: increment(10)
        });

        // Update UI
        statsDashboard.refresh();
        showCompletionMessage();
    } catch (error) {
        console.error('Error marking act as completed:', error);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize features
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }
    
    initializePushNotifications();
    
    // Add event listeners
    document.getElementById('generateButton').addEventListener('click', generateAct);
    document.getElementById('modeToggle').addEventListener('click', toggleDarkMode);
    
    // Initialize dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// Export functions for use in HTML
window.generateAct = generateAct;
window.markCompleted = markCompleted;
window.shareAct = shareAct;
window.copyAct = copyAct;
