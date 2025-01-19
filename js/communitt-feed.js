class CommunityFeed {
    constructor() {
        this.lastDoc = null;
        this.loading = false;
        this.initializeListeners();
    }

    async initializeListeners() {
        // Infinite scroll
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                this.loadMorePosts();
            }
        });
    }

    async loadMorePosts() {
        if (this.loading) return;
        this.loading = true;

        try {
            let query = collection(db, 'posts')
                .orderBy('timestamp', 'desc')
                .limit(10);

            if (this.lastDoc) {
                query = query.startAfter(this.lastDoc);
            }

            const snapshot = await getDocs(query);
            this.lastDoc = snapshot.docs[snapshot.docs.length - 1];

            snapshot.forEach(doc => {
                this.renderPost(doc.data());
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            this.loading = false;
        }
    }

    renderPost(post) {
        const template = `
            <div class="community-post">
                <div class="post-header">
                    <img src="${post.userAvatar}" alt="${post.username}" class="user-avatar">
                    <div class="post-meta">
                        <h4>${post.username}</h4>
                        <span>${this.formatTimestamp(post.timestamp)}</span>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                <div class="post-stats">
                    <button onclick="likePost('${post.id}')">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </button>
                    <button onclick="showComments('${post.id}')">
                        <i class="fas fa-comment"></i> ${post.comments}
                    </button>
                </div>
            </div>
        `;

        document.querySelector('.community-feed').insertAdjacentHTML('beforeend', template);
    }

    formatTimestamp(timestamp) {
        // Format timestamp to relative time
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        
        // Return formatted time difference
        // Implementation details...
    }
}
