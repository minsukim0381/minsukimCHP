from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///robot_site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Serve Frontend
@app.route('/')
def index():
    # Fetch news for the home page
    news = Post.query.filter_by(category='notice').order_by(Post.date_posted.desc()).limit(3).all()
    return render_template('index.html', latest_news=news)

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/tech')
def tech():
    return render_template('tech.html')

@app.route('/business')
def business():
    return render_template('business.html')

@app.route('/affiliates')
def affiliates():
    return render_template('affiliates.html')

@app.route('/board')
def board():
    category = request.args.get('category')
    if category:
        posts = Post.query.filter_by(category=category).order_by(Post.date_posted.desc()).all()
    else:
        posts = Post.query.order_by(Post.date_posted.desc()).all()
    return render_template('board.html', posts=posts, current_category=category)

@app.route('/post/<id>')
def post_detail(id):
    return render_template('post_detail.html', post_id=id)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/write')
def write():
    return render_template('write.html')

# Models
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), default='Admin')
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50), nullable=False)  # notice, tech, qna
    views = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'date_posted': self.date_posted.isoformat(),
            'category': self.category,
            'views': self.views
        }

# Initialize Database
with app.app_context():
    db.create_all()
    if not Post.query.first():
        seed_posts = [
            Post(title='[공지] 신규 정밀 제어 모듈 X-1 출시 안내', content='안녕하세요. 정밀 제어 공정 로봇 전문 기업입니다. 이번에 새롭게 출시된 X-1 모듈은 0.01mm의 정밀도를 자랑합니다.', category='notice'),
            Post(title='[기술] PLC와 C# 시스템 통합 가이드', content='C#을 이용한 PLC 제어 시스템 통합 방법에 대한 상세 가이드입니다. TCP/IP 통신 프로토콜을 기반으로 합니다.', category='tech'),
            Post(title='[질문] Python API에서 가감속도 설정 방법', content='Python API를 사용하여 로봇의 가감속도를 설정하고 싶은데, 어떤 함수를 사용해야 하나요?', category='qna', author='User123')
        ]
        db.session.bulk_save_objects(seed_posts)
        db.session.commit()

# Routes
import uuid

# File Upload Configuration
UPLOAD_FOLDER = os.path.join(app.static_folder, 'img', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    import base64
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        
        # Determine MIME type for base64 fallback
        mime_types = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        }
        mime = mime_types.get(ext, 'application/octet-stream')

        try:
            # 1. Attempt local file system write (standard for local dev)
            filename = f"{uuid.uuid4().hex}{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            url = f"/static/img/uploads/{filename}"
            return jsonify({'url': url})
        except Exception as e:
            # 2. Fallback to Base64 (ideal for read-only Vercel serverless containers)
            try:
                file.seek(0)
                file_data = file.read()
                base64_encoded = base64.b64encode(file_data).decode('utf-8')
                base64_url = f"data:{mime};base64,{base64_encoded}"
                return jsonify({'url': base64_url})
            except Exception as err:
                return jsonify({'error': f"Upload failed: {str(err)}"}), 500

@app.route('/api/posts', methods=['GET'])
def get_posts():
    category = request.args.get('category')
    search_type = request.args.get('search_type', 'all')
    search_query = request.args.get('search_query')
    
    query = Post.query
    
    if category:
        query = query.filter_by(category=category)
    
    if search_query:
        if search_type == 'title':
            query = query.filter(Post.title.ilike(f'%{search_query}%'))
        elif search_type == 'content':
            query = query.filter(Post.content.ilike(f'%{search_query}%'))
        elif search_type == 'author':
            query = query.filter(Post.author.ilike(f'%{search_query}%'))
        else: # all (title + content)
            query = query.filter((Post.title.ilike(f'%{search_query}%')) | (Post.content.ilike(f'%{search_query}%')))
            
    posts = query.order_by(Post.date_posted.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@app.route('/api/posts/<int:id>', methods=['GET'])
def get_post(id):
    post = Post.query.get_or_404(id)
    post.views += 1
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    new_post = Post(
        title=data['title'],
        content=data['content'],
        category=data['category'],
        author=data.get('author', 'Admin')
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

@app.route('/api/posts/<int:id>', methods=['PUT'])
def update_post(id):
    post = Post.query.get_or_404(id)
    data = request.json
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.category = data.get('category', post.category)
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/api/posts/<int:id>', methods=['DELETE'])
def delete_post(id):
    post = Post.query.get_or_404(id)
    db.session.delete(post)
    db.session.commit()
    return '', 204



@app.route('/api/ai/summarize', methods=['POST'])
def summarize_post():
    data = request.json
    content = data.get('content', '')
    
    # Mocking AI summarization
    summary = f"본 게시글의 핵심 요약입니다:\n\n1. 정밀 제어 시스템의 핵심 모듈 v2.0에 대한 설명입니다.\n2. 주요 변경점으로는 C# 통합 성능이 30% 향상되었습니다.\n3. PLC 래더 다이어그램의 가독성을 높이는 팁이 포함되어 있습니다."
    
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
