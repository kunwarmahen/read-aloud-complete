# Read Aloud Cloud - Backend API

FastAPI backend for Read Aloud Chrome Extension and Mobile App.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- MongoDB (local or cloud)
- TTS Server running (from the extension project)

### Installation

1. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

Generate secret key:
```bash
openssl rand -hex 32
```

3. **Start MongoDB** (if running locally)
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Start TTS Server** (in another terminal)
```bash
cd ../read-aloud-extension
python3 combined_server.py
```

5. **Run the API**
```bash
python main.py
```

API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Articles
- `POST /articles` - Save new article
- `GET /articles` - List user's articles
- `GET /articles/{id}` - Get specific article
- `PATCH /articles/{id}` - Update article (play position, etc.)
- `DELETE /articles/{id}` - Delete article

### Collections
- `POST /collections` - Create collection
- `GET /collections` - List collections
- `GET /collections/{id}` - Get collection details
- `PATCH /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection

## 🔧 Configuration

### Environment Variables

```bash
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=readaloud

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# TTS Server
TTS_SERVER_URL=http://localhost:5000

# Storage
STORAGE_TYPE=local
LOCAL_STORAGE_PATH=./audio_storage

# Server
HOST=0.0.0.0
PORT=8000
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  name: String (optional),
  created_at: DateTime
}
```

### Articles Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  title: String,
  content: String,
  source_url: String (optional),
  audio_url: String (optional),
  duration_seconds: Int (optional),
  play_position_seconds: Int (default: 0),
  created_at: DateTime,
  last_played_at: DateTime (optional),
  collection_id: ObjectId (ref: collections, optional)
}
```

### Collections Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users),
  name: String,
  description: String (optional),
  created_at: DateTime
}
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 📦 Deployment

### Using Docker

```bash
# Build image
docker build -t readaloud-api .

# Run container
docker run -d -p 8000:8000 \
  -e MONGODB_URL=mongodb://your-mongo-url \
  -e SECRET_KEY=your-secret-key \
  readaloud-api
```

### Using Railway/Render

1. Create new service
2. Connect GitHub repo
3. Set environment variables
4. Deploy!

## 🔒 Security Notes

- Always use HTTPS in production
- Keep SECRET_KEY secure
- Use environment variables for sensitive data
- Enable rate limiting (add middleware)
- Validate and sanitize all inputs

## 📝 Development

### Adding New Endpoints

1. Create router in `routers/` directory
2. Define models in `models.py`
3. Add router to `main.py`
4. Update this README

### Code Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Configuration settings
├── database.py          # MongoDB connection
├── auth.py              # Authentication utilities
├── models.py            # Pydantic models
├── tts_service.py       # TTS integration
├── routers/
│   ├── auth.py          # Auth endpoints
│   ├── articles.py      # Article endpoints
│   └── collections.py   # Collection endpoints
└── requirements.txt     # Python dependencies
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
MONGODB_URL=mongodb://localhost:27017
```

### TTS Server Not Responding
```bash
# Make sure TTS server is running
curl http://localhost:5000/health

# Start if not running
cd ../read-aloud-extension
python3 combined_server.py
```

### Audio Files Not Accessible
```bash
# Check audio storage path exists
mkdir -p ./audio_storage

# Check file permissions
chmod 755 ./audio_storage
```

## 📄 License

MIT
