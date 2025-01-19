
        let acts = [];
        let currentAct = null;
        let completedActs = new Set();
        let streak = 0;
        const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/jjingofarouk/actsofkindness/main/kindness-acts.json';

        // Load saved data from localStorage
        function loadSavedData() {
            const saved = localStorage.getItem('kindnessData');
            if (saved) {
                const data = JSON.parse(saved);
                completedActs = new Set(data.completed);
                streak = data.streak;
                updateStats();
            }
        }

        // Save data to localStorage
        function saveData() {
            const data = {
                completed: Array.from(completedActs),
                streak: streak
            };
            localStorage.setItem('kindnessData', JSON.stringify(data));
        }

        // Fetch acts from GitHub
        async function fetchActs() {
            try {
                const response = await fetch(GITHUB_RAW_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                acts = data.acts;
                updateStats();
                setupCategoryFilters();
                return true;
            } catch (error) {
                console.error('Error fetching acts:', error);
                document.getElementById('error').style.display = 'block';
                return false;
            }
        }

        // Setup category filters
        function setupCategoryFilters() {
            const categories = [...new Set(acts.map(act => act.category))];
            const filtersContainer = document.getElementById('categoryFilters');
            filtersContainer.innerHTML = `
                <button class="filter-button active" data-category="all">All</button>
                ${categories.map(category => 
                    `<button class="filter-button" data-category="${category}">${category}</button>`
                ).join('')}
            `;

            filtersContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-button')) {
                    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                    generateAct(e.target.dataset.category);
                }
            });
        }

        // Generate confetti effect
        function createConfetti() {
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDelay = Math.random() * 3 + 's';
                confetti.style.background = `hsl(${Math.random() * 360}, 50%, 50%)`;
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }
        }

        // Generate a random act
        async function generateAct(category = 'all') {
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const actElement = document.getElementById('kindnessAct');
            const generateButton = document.getElementById('generateButton');

            loading.style.display = 'block';
            error.style.display = 'none';
            actElement.style.opacity = '0';
            generateButton.disabled = true;

            if (acts.length === 0) {
                const success = await fetchActs();
                if (!success) {
                    loading.style.display = 'none';
                    error.style.display = 'block';
                    generateButton.disabled = false;
                    return;
                }
            }

            const filteredActs = category === 'all' 
                ? acts 
                : acts.filter(act => act.category === category);

            currentAct = filteredActs[Math.floor(Math.random() * filteredActs.length)];
            
            loading.style.display = 'none';
actElement.textContent = currentAct.act;
            document.getElementById('category').textContent = currentAct.category;
            document.getElementById('difficulty').textContent = currentAct.difficulty;
            
            animateText();
            generateButton.disabled = false;
        }

        // Mark act as completed
        function markCompleted() {
            if (!currentAct) return;
            
            completedActs.add(currentAct.id);
            updateStats();
            createConfetti();
            saveData();
            
            // Update progress bar
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const dailyGoal = 3; // Set daily goal
            const completedToday = getCompletedToday();
            
            const progress = (completedToday / dailyGoal) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (completedToday >= dailyGoal) {
                progressText.textContent = "Daily goal achieved! You're amazing! 🎉";
                progressBar.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
            } else {
                progressText.textContent = `${completedToday} of ${dailyGoal} acts completed today`;
            }
        }

        // Get completed acts for today
        function getCompletedToday() {
            const today = new Date().toDateString();
            const savedDate = localStorage.getItem('lastCompletedDate');
            
            if (savedDate !== today) {
                localStorage.setItem('lastCompletedDate', today);
                localStorage.setItem('completedToday', '0');
                return 0;
            }
            
            return parseInt(localStorage.getItem('completedToday')) || 0;
        }

        // Update statistics
        function updateStats() {
            document.getElementById('totalActs').textContent = acts.length;
            document.getElementById('completedActs').textContent = completedActs.size;
            document.getElementById('currentStreak').textContent = streak;
            
            // Update streak
            const today = new Date().toDateString();
            const lastActive = localStorage.getItem('lastActiveDate');
            
            if (lastActive !== today) {
                localStorage.setItem('lastActiveDate', today);
                if (isConsecutiveDay(lastActive)) {
                    streak++;
                } else {
                    streak = 1;
                }
                saveData();
            }
        }

        // Check if dates are consecutive
        function isConsecutiveDay(lastDate) {
            if (!lastDate) return false;
            
            const last = new Date(lastDate);
            const today = new Date();
            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays === 1;
        }

        // Share functionality
        function shareAct(platform) {
            if (!currentAct) return;
            
            const text = encodeURIComponent(
                `🌟 Today's Random Act of Kindness: ${currentAct.act}\n#RandomActsOfKindness #Kindness`
            );
            
            if (platform === 'twitter') {
                window.open(`https://twitter.com/intent/tweet?text=${text}`);
            }
        }

        // Copy to clipboard
        function copyAct() {
            if (!currentAct) return;
            
            navigator.clipboard.writeText(currentAct.act).then(() => {
                const button = document.querySelector('.share-button:last-child');
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            });
        }

        // Text animation
        function animateText() {
            const textElement = document.getElementById('kindnessAct');
            textElement.style.transform = 'translateY(20px)';
            textElement.style.opacity = '0';
            
            setTimeout(() => {
                textElement.style.transition = 'all 0.5s ease';
                textElement.style.transform = 'translateY(0)';
                textElement.style.opacity = '1';
            }, 100);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadSavedData();
            fetchActs().then(() => {
                document.getElementById('loading').style.display = 'none';
                updateStats();
            });

            // Check for daily reset
            const today = new Date().toDateString();
            const lastReset = localStorage.getItem('lastResetDate');
            
            if (lastReset !== today) {
                localStorage.setItem('completedToday', '0');
                localStorage.setItem('lastResetDate', today);
            }

            // Update progress bar initially
            const completedToday = getCompletedToday();
            const dailyGoal = 3;
            const progress = (completedToday / dailyGoal) * 100;
            document.getElementById('progressBar').style.width = `${Math.min(progress, 100)}%`;
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                generateAct();
            } else if (e.code === 'Enter') {
                e.preventDefault();
                markCompleted();
            }
        });
    
function donate() {
    window.open('https://www.buymeacoffee.com/jjingofarouk', '_blank');
}

document.getElementById('modeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});
