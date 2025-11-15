# Real-Time Development Guide

## 🔥 Hot Reload / Live Updates

MasterDiaryApp is configured for **real-time updates** during development. When you edit files, changes will automatically appear in your browser without manually refreshing!

## ✨ How It Works

### Frontend (React + Vite)
- **Hot Module Replacement (HMR)** is enabled via Vite
- Edit any `.jsx`, `.js`, or `.css` file in `frontend/src/`
- Changes appear **instantly** in your browser (typically < 1 second)
- Component state is preserved when possible
- Errors display as overlays in the browser

### Backend (Node.js + Express)
- **Auto-restart** is enabled via nodemon
- Edit any `.js` file in `backend/src/` or `backend/server.js`
- Server automatically restarts (typically 1-2 seconds)
- API endpoints update without manual intervention

## 🚀 Quick Start

### 1. Install Dependencies (First Time Only)
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start Development Servers

**Option A: Start Both Servers Together (Recommended)**
```bash
# From project root
npm run dev
```

**Option B: Start Servers Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. View Your App
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📝 Making Real-Time Edits

### Frontend Changes (Instant Updates)

1. **Edit a Component**
   ```bash
   # Open any component file
   code frontend/src/components/Dashboard.jsx
   ```

2. **Make Your Changes**
   - Modify JSX, CSS, or logic
   - Save the file (Ctrl+S / Cmd+S)

3. **See Updates Instantly**
   - Browser updates automatically
   - No manual refresh needed
   - Component state preserved (when possible)

### Backend Changes (Auto-Restart)

1. **Edit a Route or Model**
   ```bash
   # Open any backend file
   code backend/src/routes/projects.js
   ```

2. **Make Your Changes**
   - Modify API endpoints, models, or logic
   - Save the file

3. **Server Restarts Automatically**
   - Watch the terminal for "Server restarted" message
   - API changes take effect immediately
   - Typically takes 1-2 seconds

## 🎯 Common Development Workflows

### Adding a New Feature to the UI

```bash
# 1. Edit the component
code frontend/src/components/PaintDiary.jsx

# 2. Save your changes (Ctrl+S)
# 3. Browser updates automatically - see changes instantly!
```

### Modifying an API Endpoint

```bash
# 1. Edit the route file
code backend/src/routes/diaries_fixed2.js

# 2. Save your changes
# 3. Server restarts automatically
# 4. Test the endpoint (changes are live)
```

### Styling Updates

```bash
# 1. Edit CSS
code frontend/src/App.css

# 2. Save
# 3. Styles update instantly (no page reload)
```

## ⚙️ Configuration Details

### Vite Configuration (Frontend HMR)
Located in: `vite.config.js`

Key features:
- **HMR Overlay**: Shows errors directly in browser
- **Fast Refresh**: Preserves component state
- **Optimized Watching**: Efficient file change detection

### Nodemon Configuration (Backend Auto-Reload)
Located in: `backend/nodemon.json`

Watches:
- `src/` directory (all routes, models, middleware)
- `server.js` (main server file)
- `.env` (environment variables)

Ignores:
- `node_modules/`
- Test files

## 🐛 Troubleshooting

### HMR Not Working (Frontend)

**Problem**: Changes not appearing in browser

**Solutions**:
1. Check if dev server is running (`npm run dev` in frontend/)
2. Look for errors in browser console (F12)
3. Try manual refresh (Ctrl+R / Cmd+R)
4. Restart dev server if needed

### Nodemon Not Restarting (Backend)

**Problem**: API changes not taking effect

**Solutions**:
1. Check if nodemon is running (`npm run dev` in backend/)
2. Look for syntax errors in terminal
3. Ensure file is saved properly
4. Restart nodemon if needed: Ctrl+C, then `npm run dev`

### Port Already in Use

**Problem**: `EADDRINUSE` error

**Solutions**:
```bash
# Kill process on port 5173 (frontend)
npx kill-port 5173

# Kill process on port 5000 (backend)
npx kill-port 5000

# Then restart servers
```

## 💡 Best Practices

### For Maximum Productivity

1. **Keep Both Servers Running**
   - Use `npm run dev` from project root
   - Opens both frontend and backend in one command

2. **Use a Good Code Editor**
   - VS Code recommended
   - Auto-save on focus change (optional)
   - Enable format-on-save

3. **Watch the Terminal**
   - Backend: See restart messages
   - Frontend: See HMR updates and build status

4. **Browser DevTools Open**
   - F12 to open
   - Console tab shows errors
   - Network tab shows API calls

5. **Test Frequently**
   - Make small changes
   - Test immediately
   - Catch errors early

### Common Patterns

**Component Development:**
```javascript
// Edit component, save, see update instantly
export default function MyComponent() {
  return <div>Updated content</div>;
  // Save → Browser updates → Continue editing
}
```

**API Development:**
```javascript
// Edit route, save, server restarts
router.get('/api/endpoint', (req, res) => {
  res.json({ message: 'Updated response' });
  // Save → Server restarts → Test with Postman/Browser
});
```

## 🎨 Visual Feedback

### Frontend HMR Indicators
- **Green**: HMR update successful
- **Red Overlay**: Compilation error (shows error details)
- **Console Messages**: "[vite] hot updated" in browser console

### Backend Restart Indicators
- Terminal shows: `[nodemon] restarting due to changes...`
- Terminal shows: `[nodemon] starting node server.js`
- Terminal shows: `Server is running on port 5000`

## 🔍 Monitoring Changes

### Watch File Changes in Real-Time

**Terminal 1**: Frontend changes
```bash
cd frontend
npm run dev
# Watch for: "[vite] hmr update" messages
```

**Terminal 2**: Backend changes
```bash
cd backend
npm run dev
# Watch for: "[nodemon] restarting" messages
```

## 📊 Performance Tips

1. **Frontend**
   - HMR is very fast (< 100ms typically)
   - Full page reloads only when necessary
   - State preservation speeds up testing

2. **Backend**
   - Nodemon restart is quick (1-2 seconds)
   - Only restarts when watched files change
   - Environment variables update without manual restart

## 🌟 Advanced Features

### Preserving Component State
React Fast Refresh preserves state during HMR:
- Edit JSX → State preserved
- Edit hooks → State preserved (usually)
- Edit exports → May reset state

### Error Recovery
HMR has built-in error recovery:
- Fix syntax error → HMR resumes automatically
- No need to restart dev server
- Error overlay disappears when fixed

## 📚 Additional Resources

- [Vite HMR Documentation](https://vitejs.dev/guide/features.html#hot-module-replacement)
- [Nodemon Documentation](https://nodemon.io/)
- [React Fast Refresh](https://www.npmjs.com/package/react-refresh)

---

**Need Help?** Check the troubleshooting section above or create an issue on GitHub.

**Happy Coding!** 🚀 Edit files and watch your changes appear in real-time!
