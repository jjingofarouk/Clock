// stats-dashboard.js
import { db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import Chart from 'chart.js/auto';

class StatsDashboard {
    constructor(userId) {
        this.userId = userId;
        this.charts = {};
        this.initializeCharts();
    }

    async initializeCharts() {
        const userData = await this.fetchUserStats();
        this.createActivityChart(userData);
        this.createImpactChart(userData);
        this.updateStatistics(userData);
    }

    async fetchUserStats() {
        // Fetch user data and activity history
        const [userDoc, activities] = await Promise.all([
            getDoc(doc(db, 'users', this.userId)),
            getDocs(query(
                collection(db, 'activities'),
                where('userId', '==', this.userId),
                orderBy('timestamp', 'desc'),
                limit(30)
            ))
        ]);

        return {
            userData: userDoc.data(),
            activities: activities.docs.map(doc => doc.data())
        };
    }

    createActivityChart(data) {
        // Create activity chart using Chart.js
        // Implementation details...
    }

    createImpactChart(data) {
        // Create impact metrics chart
        // Implementation details...
    }

    updateStatistics(data) {
        // Update UI statistics
        document.getElementById('completedActs').textContent = data.userData.completedActs;
        document.getElementById('currentStreak').textContent = data.userData.streak;
        document.getElementById('totalPoints').textContent = data.userData.points;
        // Update other statistics...
    }
}

export const statsDashboard = new StatsDashboard();
