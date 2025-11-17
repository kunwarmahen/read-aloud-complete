# Read Aloud Cloud - Complete Project Setup

## 📋 Project Overview

**Read Aloud Cloud** extends the Chrome extension into a full-stack application with:

- ✅ Cloud-based article storage
- ✅ User authentication
- ✅ Mobile app (React Native)
- ✅ Cross-device synchronization

## 🏗️ Architecture

```
┌──────────────────┐
│ Chrome Extension │ ──┐
└──────────────────┘   │
                       ├──→ ┌─────────────┐
┌──────────────────┐   │    │  Backend    │
│ React Native App │ ──┘    │ (FastAPI +  │
└──────────────────┘        │  MongoDB)   │
                            └─────────────┘
                                   ↓
                            ┌─────────────┐
                            │ TTS Server  │
                            │ (existing)  │
                            └─────────────┘
```

## 📦 What's Been Created

### Backend API (FastAPI + MongoDB)

✅ Complete REST API
✅ User authentication (JWT)
✅ Article CRUD operations
✅ Collections/playlists
✅ TTS integration
✅ Docker support

**Location:** `/backend/`

### Files Created:

- `main.py` - FastAPI application
- `config.py` - Configuration management
- `database.py` - MongoDB connection
- `auth.py` - JWT authentication
- `models.py` - Pydantic models
- `tts_service.py` - TTS integration
- `routers/auth.py` - Auth endpoints
- `routers/articles.py` - Article endpoints
- `routers/collections.py` - Collection endpoints
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration
- `.env.example` - Environment template
- `README.md` - Documentation

## 🚀 Setup Instructions

### Step 1: Install MongoDB

**Option A: Local Installation**

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

**Option B: Docker**

```bash
docker run -d -p 27017:27017 --name mongodb \
  -v mongodb_data:/data/db \
  mongo:latest
```

**Option C: MongoDB Atlas (Cloud)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use in `.env` file

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Generate secret key
openssl rand -hex 32
# Copy output to SECRET_KEY in .env

# Start the API
python main.py
```

Backend will run on `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### Step 3: Test the API

```bash
# Health check
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login and get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Save this token for authenticated requests
```

### Step 4: Start TTS Server

```bash
# In another terminal
git clone https://github.com/kunwarmahen/read-aloud.git
cd ../read-aloud
python3 combined_server.py
```

TTS server runs on `http://localhost:5000`

### Step 5: Test Article Creation

```bash
# Use the token from login
TOKEN="your-jwt-token-here"

# Create an article
curl -X POST http://localhost:8000/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article that will be converted to speech.",
    "source_url": "https://example.com"
  }'

# List articles
curl http://localhost:8000/articles \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Development Workflow

### Running in Development

**Terminal 1: MongoDB**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Terminal 2: Backend API**

```bash
cd backend
python main.py
```

**Terminal 3: TTS Server**

```bash
cd read-aloud
python3 combined_server.py
```

### Making Changes

1. Edit code in `backend/` directory
2. API auto-reloads (thanks to uvicorn `--reload`)
3. Test endpoints at `http://localhost:8000/docs`

## 🗄️ Database Management

### View Collections

```bash
# Using MongoDB shell
mongosh

use readaloud
db.users.find()
db.articles.find()
db.collections.find()
```

### Reset Database

```bash
mongosh
use readaloud
db.dropDatabase()
```

### Backup Database

```bash
mongodump --db readaloud --out backup/
```

## 📊 API Testing with Postman

1. Import this collection:

```json
{
  "info": {
    "name": "Read Aloud Cloud API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
        }
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: Could not connect to MongoDB
```

**Solution:**

- Check MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Try: `mongodb://localhost:27017` or `mongodb://127.0.0.1:27017`

### TTS Server Not Found

```
Error: Connection refused to localhost:5000
```

**Solution:**

- Start TTS server: `python3 combined_server.py`
- Check `TTS_SERVER_URL` in `.env`

### JWT Token Expired

```
Error: 401 Unauthorized
```

**Solution:**

- Login again to get new token
- Increase `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`

### Audio Generation Failed

```
Error: Failed to generate audio
```

**Solution:**

- Check TTS server is running
- Check audio storage path exists: `mkdir -p audio_storage`
- Check file permissions: `chmod 755 audio_storage`

## 📈 Performance Optimization

### MongoDB Indexes

```javascript
// In MongoDB shell
use readaloud

// Index on user_id for faster queries
db.articles.createIndex({ "user_id": 1, "created_at": -1 })
db.collections.createIndex({ "user_id": 1 })

// Index on email for faster auth
db.users.createIndex({ "email": 1 }, { unique: true })
```

### Caching

- Add Redis for token caching
- Cache frequently accessed articles
- Pre-generate audio for popular content

## 🚢 Deployment

### Option 1: Railway

1. Install Railway CLI:

```bash
npm install -g @railway/cli
```

2. Login and deploy:

```bash
railway login
railway init
railway up
```

3. Add MongoDB:

```bash
railway add mongodb
```

### Option 2: Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: readaloud-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

2. Connect GitHub repo
3. Add environment variables
4. Deploy!

### Option 3: Docker + VPS

```bash
# Build and push
docker build -t readaloud-api .
docker tag readaloud-api:latest your-registry/readaloud-api:latest
docker push your-registry/readaloud-api:latest

# On server
docker pull your-registry/readaloud-api:latest
docker run -d -p 8000:8000 \
  -e MONGODB_URL=mongodb://mongo:27017 \
  -e SECRET_KEY=your-secret-key \
  your-registry/readaloud-api:latest
```

## 📚 Resources

- FastAPI Docs: https://fastapi.tiangolo.com
- MongoDB Docs: https://docs.mongodb.com
- Motor (async MongoDB): https://motor.readthedocs.io
- JWT: https://jwt.io

## 💡 Tips

1. **Start Small**: Get basic save/retrieve working first
2. **Test Often**: Use Swagger UI at `/docs`
3. **Monitor Logs**: Watch console for errors
4. **Secure Secrets**: Never commit `.env` file
5. **Use Postman**: Test all endpoints before integration

## 🤝 Contributing

Want to add features? Here's the workflow:

1. Create feature branch
2. Add endpoint in `routers/`
3. Update models in `models.py`
4. Test with Swagger UI
5. Document in README
6. Submit PR

## 📝 License

MIT

---

**Ready to build?** Start with Step 1 above! 🚀

Questions? Check the troubleshooting section or open an issue.
