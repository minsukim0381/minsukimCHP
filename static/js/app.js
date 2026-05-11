const app = {
    root: null,
    currentRoute: 'home',

    init() {
        this.root = document.getElementById('app-root');
        window.addEventListener('popstate', () => this.handleRouting());
        this.handleRouting();
    },

    navigate(route) {
        window.history.pushState({}, '', `#${route}`);
        this.handleRouting();
    },

    handleRouting() {
        const hash = window.location.hash.replace('#', '') || 'home';
        this.currentRoute = hash;
        
        if (hash === 'home') this.renderHome();
        else if (hash === 'products') this.renderProducts();
        else if (hash === 'tech') this.renderTech();
        else if (hash === 'board') this.renderBoard();
        else if (hash.startsWith('post/')) this.renderPostDetail(hash.split('/')[1]);
        else if (hash === 'write') this.renderWrite();
        else this.renderHome();
    },

    // --- Views ---

    async renderHome() {
        // Fetch news for the bottom section
        const res = await fetch('/api/posts?category=notice');
        const news = await res.json();
        const latestNews = news.slice(0, 3);

        this.root.innerHTML = `
            <section class="hero-full" style="background-image: url('/static/img/hero_main.png');">
                <div class="hero-overlay">
                    <h1>Precision Beyond<br>Imagination</h1>
                    <p>인간과 로봇이 공존하는 정밀 제어 공정의 새로운 표준을 제시합니다.</p>
                    <button class="btn-cyber" onclick="app.navigate('products')">Explore Technology</button>
                </div>
            </section>

            <section class="product-section">
                <div class="container">
                    <h2 class="section-title">Innovative Product Lineup</h2>
                    <div class="product-grid">
                        <div class="product-card">
                            <img src="/static/img/products_main.png" alt="Product 1">
                        </div>
                        <div class="product-card">
                            <h3 style="font-size: 2rem; margin-bottom: 1rem;">Collaborative Robots</h3>
                            <p style="color: var(--gray-mid); margin-bottom: 2rem;">당사의 협동 로봇은 고도의 정밀도와 안전성을 결합하여 제조 공정의 효율을 극대화합니다. 0.01mm의 반복 정밀도를 보장하는 X-시리즈를 만나보세요.</p>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; color: var(--gray-mid);">
                                <li>• 고정밀 6축 다관절 제어</li>
                                <li>• 지능형 충돌 감지 및 안전 로직</li>
                                <li>• C# 및 Python 통합 API 지원</li>
                            </ul>
                            <button class="btn-cyber" style="margin-top: 2rem; background: transparent; border: 1px solid white;" onclick="app.navigate('products')">View Details</button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="news-section">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem;">
                        <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0;">Latest News</h2>
                        <a href="#board" onclick="app.navigate('board')" style="color: var(--accent-blue); font-weight: 600; text-decoration: none;">View All News →</a>
                    </div>
                    <div class="news-grid">
                        ${latestNews.length > 0 ? latestNews.map(item => `
                            <div class="news-item" onclick="app.navigate('post/${item.id}')">
                                <div class="news-date">${new Date(item.date_posted).toLocaleDateString()}</div>
                                <div class="news-title">${item.title}</div>
                            </div>
                        `).join('') : '<p>준비된 뉴스가 없습니다.</p>'}
                    </div>
                </div>
            </section>

            <section class="container" style="padding: 100px 0; border-top: 1px solid var(--border-color);">
                <div style="max-width: 800px;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 1.5rem;">About Precision Robotics</h3>
                    <p style="color: var(--gray-mid); font-size: 1.1rem; line-height: 1.8;">
                        Precision Control Robotics는 글로벌 최고 수준의 로봇 하드웨어 및 소프트웨어 기술을 보유한 전문 기업입니다. 
                        단순한 자동화를 넘어, 인공지능과 정밀 제어 기술의 융합을 통해 산업 현장의 혁신을 이끌어가고 있습니다.
                    </p>
                </div>
            </section>
        `;
    },

    renderProducts() {
        this.root.innerHTML = `
            <div class="container" style="padding: 60px 0;">
                <h2 style="font-size: 3rem; margin-bottom: 2rem;">Product Lineup</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div style="border: 1px solid var(--border-color); padding: 2rem;">
                        <h3 style="color: var(--accent-neon-pink);">X-1 Precision Arm</h3>
                        <p>0.01mm 반복 정밀도를 자랑하는 6축 다관절 로봇.</p>
                    </div>
                    <div style="border: 1px solid var(--border-color); padding: 2rem;">
                        <h3 style="color: var(--accent-neon-cyan);">Control Module v2</h3>
                        <p>고성능 PLC 및 C# 통합을 지원하는 범용 제어 모듈.</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderTech() {
        this.root.innerHTML = `
            <div class="container" style="padding: 60px 0;">
                <h2 style="font-size: 3rem; margin-bottom: 2rem;">Tech Support</h2>
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 4rem;">
                    <div>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
                            <li style="font-weight: 600; cursor: pointer;">Python API Manual</li>
                            <li style="font-weight: 600; cursor: pointer; color: var(--gray-mid);">C++ Core Guide</li>
                            <li style="font-weight: 600; cursor: pointer; color: var(--gray-mid);">PLC Ladder Diagram</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Python API Quick Start</h3>
                        <pre style="background: var(--gray-light); padding: 1rem; margin-top: 1rem;">import robot_api\n\nrb = robot_api.connect("192.168.0.10")\nrb.move_to(x=100, y=200, z=50)</pre>
                    </div>
                </div>
            </div>
        `;
    },

    async renderBoard(category = '') {
        const url = category ? `/api/posts?category=${category}` : '/api/posts';
        const res = await fetch(url);
        const posts = await res.json();
        
        this.root.innerHTML = `
            <div class="container board-container">
                <div class="board-header">
                    <h2 style="font-size: 2.5rem;">News & Community</h2>
                    <button class="btn-cyber" onclick="app.navigate('write')">Create Post</button>
                </div>
                
                <div class="category-tabs">
                    <div class="tab ${!category ? 'active' : ''}" onclick="app.renderBoard()">All</div>
                    <div class="tab ${category === 'notice' ? 'active' : ''}" onclick="app.renderBoard('notice')">Notice</div>
                    <div class="tab ${category === 'tech' ? 'active' : ''}" onclick="app.renderBoard('tech')">Tech Blog</div>
                    <div class="tab ${category === 'qna' ? 'active' : ''}" onclick="app.renderBoard('qna')">Q&A</div>
                </div>

                <table class="post-table">
                    <thead>
                        <tr style="text-align: left; color: var(--gray-mid); font-size: 0.8rem; text-transform: uppercase;">
                            <th style="padding: 1rem;">Title</th>
                            <th style="padding: 1rem;">Author</th>
                            <th style="padding: 1rem;">Date</th>
                            <th style="padding: 1rem;">Views</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${posts.map((post, index) => `
                            <tr class="post-row" onclick="app.navigate('post/${post.id}')">
                                <td data-label="Title">
                                    <div class="post-title">
                                        ${index < 2 ? '<span class="tag-new glitch">New</span>' : ''}
                                        ${post.title}
                                    </div>
                                    <div style="font-size: 0.7rem; color: var(--gray-mid); margin-top: 4px;">#${post.category.toUpperCase()}</div>
                                </td>
                                <td data-label="Author">${post.author}</td>
                                <td data-label="Date">${new Date(post.date_posted).toLocaleDateString()}</td>
                                <td data-label="Views">${post.views}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 4rem;">
                    <button class="btn-cyber" style="clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%); width: 120px;">Prev</button>
                    <button class="btn-cyber" style="clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%); width: 120px;">Next</button>
                </div>
            </div>
        `;
    },

    async renderPostDetail(id) {
        const res = await fetch(`/api/posts/${id}`);
        const post = await res.json();

        this.root.innerHTML = `
            <div class="container post-detail">
                <a href="#board" style="text-decoration: none; color: var(--accent-neon-cyan); font-weight: 600; margin-bottom: 2rem; display: inline-block;">← Back to List</a>
                <h1>${post.title}</h1>
                <div class="post-meta">
                    <span>${post.author}</span>
                    <span>|</span>
                    <span>${new Date(post.date_posted).toLocaleString()}</span>
                    <span>|</span>
                    <span>Views: ${post.views}</span>
                    <span style="color: var(--accent-neon-pink);">#${post.category}</span>
                </div>
                <div class="post-content">
                    ${marked.parse(post.content)}
                </div>

                ${post.category !== 'qna' ? `
                    <div class="ai-draft-box" style="background: #f0f9ff; border-left-color: var(--accent-neon-cyan);">
                        <div class="ai-draft-header" style="color: var(--accent-neon-cyan);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            Antigravity AI Content Summary
                        </div>
                        <div id="ai-summary-content" style="font-size: 0.95rem; color: #444;">
                            <button onclick="app.generateAISummary()" class="btn-cyber" style="font-size: 0.7rem; padding: 0.5rem 1rem; margin-top: 1rem; background: var(--accent-neon-cyan);">Summarize Post</button>
                        </div>
                    </div>
                ` : ''}

                ${post.category === 'qna' ? `
                    <div class="ai-draft-box">
                        <div class="ai-draft-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                            Antigravity AI Draft Response
                        </div>
                        <div id="ai-draft-content" style="font-size: 0.95rem; color: #444;">
                            <button onclick="app.generateAIDraft('${post.title}')" class="btn-cyber" style="font-size: 0.7rem; padding: 0.5rem 1rem; margin-top: 1rem;">Generate AI Draft</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    renderWrite() {
        this.root.innerHTML = `
            <div class="container" style="padding: 60px 0; max-width: 800px;">
                <h2 style="margin-bottom: 2rem;">Create New Post</h2>
                <div class="editor-container">
                    <input type="text" id="post-title" placeholder="Title">
                    <select id="post-category">
                        <option value="notice">Notice</option>
                        <option value="tech">Tech Blog</option>
                        <option value="qna">Q&A</option>
                    </select>
                    <textarea id="post-content" placeholder="Content (Markdown supported)"></textarea>
                    <button class="btn-cyber" onclick="app.submitPost()">Publish Post</button>
                </div>
            </div>
        `;
    },

    async submitPost() {
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('post-category').value;
        const content = document.getElementById('post-content').value;

        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, content })
        });

        if (res.ok) {
            this.navigate('board');
        }
    },

    async generateAIDraft(question) {
        const contentBox = document.getElementById('ai-draft-content');
        contentBox.innerHTML = 'Generating...';
        
        const res = await fetch('/api/ai/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });
        const data = await res.json();
        contentBox.innerHTML = data.draft.replace(/\n/g, '<br>');
    },

    async generateAISummary() {
        const contentBox = document.getElementById('ai-summary-content');
        const postContent = document.querySelector('.post-content').innerText;
        contentBox.innerHTML = 'Analyzing...';

        const res = await fetch('/api/ai/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: postContent })
        });
        const data = await res.json();
        contentBox.innerHTML = data.summary.replace(/\n/g, '<br>');
    }
};

app.init();
