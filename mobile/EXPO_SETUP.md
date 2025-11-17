# Read Aloud Mobile - Expo Version 🚀

## Why Expo?

✅ **Much easier** than bare React Native
✅ **No native code** compilation needed
✅ **Instant updates** - just scan QR code
✅ **Works on real devices** immediately
✅ **Faster development** - no Android Studio/Xcode needed

## 📱 Quick Setup (3 Commands!)

```bash
# 1. Create Expo project
npx create-expo-app ReadAloudMobile
cd ReadAloudMobile

# 2. Copy all files from this package
# Copy src/ folder, App.js, app.json, package.json

# 3. Install dependencies
npm install

# 4. Start!
npx expo start
```

## 🎯 Step-by-Step Setup

### Step 1: Install Expo Go App

**On Your Phone:**

- iOS: Download "Expo Go" from App Store
- Android: Download "Expo Go" from Play Store

### Step 2: Create Project

```bash
npx create-expo-app@latest ReadAloudMobile
cd ReadAloudMobile
```

### Step 3: Copy Source Files

From the downloaded package, copy these files:

```
Copy these → Your project:
├── src/             → src/
├── App.js           → App.js
├── app.json         → app.json
└── package.json     → package.json (merge dependencies)
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Configure API URL

**IMPORTANT:** Edit `src/api/client.js`

```javascript
// Change this to YOUR computer's IP address
const API_URL = "http://192.168.1.100:8000";
```

**To find your IP:**

```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4

# Example output: 192.168.1.100
```

### Step 6: Start Backend API

```bash
cd backend
python main.py
# API running on http://localhost:8000
```

### Step 7: Start Expo

```bash
npx expo start
```

You'll see a QR code! 📱

### Step 8: Open on Your Phone

1. Open Expo Go app on your phone
2. Scan the QR code
3. App loads instantly! ✨

## 🎨 Project Structure

```
ReadAloudMobile/
├── App.js                      # Entry point
├── app.json                    # Expo config
├── package.json                # Dependencies
├── src/
│   ├── api/
│   │   └── client.js          # API client (UPDATE IP HERE!)
│   ├── auth/
│   │   ├── AuthContext.js     # Auth management
│   │   ├── LoginScreen.js     # Login screen
│   │   └── SignupScreen.js    # Signup screen
│   ├── components/
│   │   ├── ArticleCard.js     # Article list item
│   │   └── AudioPlayer.js     # Player controls
│   ├── navigation/
│   │   └── AppNavigator.js    # Navigation
│   ├── screens/
│   │   ├── LibraryScreen.js   # Article library
│   │   ├── PlayerScreen.js    # Audio player
│   │   └── SettingsScreen.js  # Settings
│   └── services/
│       └── audioService.js    # Audio playback (expo-av)
```

## 🔧 Key Differences from React Native CLI

| Feature    | Expo         | React Native CLI          |
| ---------- | ------------ | ------------------------- |
| Setup      | 3 commands   | 30+ commands              |
| Dev Device | Any phone    | Emulator needed           |
| Audio      | expo-av      | react-native-track-player |
| Testing    | Scan QR code | USB + compile             |
| Updates    | Instant      | Rebuild required          |

## 📱 Testing on Real Device

### Same WiFi Network

1. Make sure phone and computer are on **same WiFi**
2. Start Expo: `npx expo start`
3. Scan QR code with Expo Go
4. App loads in seconds! ⚡

### Different Network (Tunnel Mode)

```bash
npx expo start --tunnel
```

Uses ngrok to create tunnel (slower but works anywhere)

## 🐛 Common Issues

### Issue: "Network response timed out"

```
Problem: Phone can't reach backend API
Solution:
1. Check both devices on same WiFi
2. Update API_URL in src/api/client.js with YOUR IP
3. Make sure backend is running
4. Test: ping YOUR_IP from phone
```

### Issue: "Unable to resolve module"

```bash
# Clear cache
npx expo start -c

# Reinstall
rm -rf node_modules
npm install
```

### Issue: "Expo Go won't scan QR"

```
Solution:
- iOS: Use Camera app to scan
- Android: Use Expo Go's built-in scanner
- Or: Type the URL manually in Expo Go
```

### Issue: Audio won't play

```javascript
// Check API_URL in src/api/client.js
// Must be accessible from phone
// Test by opening http://YOUR_IP:8000/health in phone browser
```

## ✅ Test Checklist

- [ ] Backend API running (`python main.py`)
- [ ] Expo running (`npx expo start`)
- [ ] Phone on same WiFi
- [ ] API_URL updated with YOUR IP
- [ ] QR code scanned
- [ ] App opens
- [ ] Can login
- [ ] Articles load
- [ ] Audio plays

## 🎯 Development Workflow

**Daily Development:**

```bash
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Expo
cd ReadAloudMobile && npx expo start

# Phone - Expo Go
Scan QR code → Done!
```

**Making Changes:**

1. Edit code in VSCode
2. Save file
3. App auto-reloads on phone! ⚡
4. No rebuild needed!

## 🚢 Building for Production

### Android APK

```bash
# Build APK
eas build -p android --profile preview

# Download and install APK on phone
```

### iOS

```bash
# Build for iOS
eas build -p ios --profile preview
```

### App Stores

```bash
# Setup EAS
npm install -g eas-cli
eas login
eas build:configure

# Build for stores
eas build --platform android
eas build --platform ios

# Submit
eas submit -p android
eas submit -p ios
```

## 💡 Pro Tips

1. **Use Tunnel Mode** if on different networks

   ```bash
   npx expo start --tunnel
   ```

2. **Enable Fast Refresh** (already on by default)

   - Changes appear instantly
   - No manual reload

3. **Debug with Expo DevTools**

   ```bash
   npx expo start
   # Press 'd' to open devtools
   ```

4. **Test on Multiple Devices**

   - Scan same QR on multiple phones
   - All get live updates!

5. **Use Expo Go Features**
   - Shake phone for dev menu
   - Debug remotely
   - Performance monitor

## 🎨 Customization

### Change App Name

Edit `app.json`:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Change Colors

Edit screen StyleSheet:

```javascript
color: "#667eea"; // Change to your brand color
```

### Add App Icon

1. Create 1024x1024 PNG
2. Save as `assets/icon.png`
3. Expo auto-generates all sizes!

## 🎉 You're Ready!

Expo makes mobile development SO much easier:

- No Xcode needed
- No Android Studio needed
- No emulators needed
- Just scan and go! 📱

**Start developing:**

```bash
npx expo start
```

Scan QR → Build amazing things! 🚀

## 📚 Resources

- Expo Docs: https://docs.expo.dev
- Expo Go: Download from app store
- EAS Build: https://docs.expo.dev/build/introduction
- Expo AV: https://docs.expo.dev/versions/latest/sdk/av

---

**Questions?** Everything just works with Expo! If you have issues, check the Common Issues section above.
