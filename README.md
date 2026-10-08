# M3U8 Playlist Analyzer

A full-stack web application designed to analyze `.m3u8` playlist files. It provides insights into track statistics, artist distribution, and identifies duplicate entries in your music libraries.

## 🚀 Features

- **Multi-method Input:**
  - Drag & Drop `.m3u8` files directly into the browser.
  - Manual file selection.
  - Raw text pasting for quick M3U8 snippet analysis.
- **In-depth Analytics:**
  - **Summary Dashboard:** Total track count, unique artist count, total playback duration (formatted as HH:MM:SS), and duplicate count.
  - **Top Artists:** Automatically generates a ranked list of artists by their frequency in the playlist.
  - **Duplicate Detection:** Scans for identical "Artist - Title" pairs to help clean up playlists.
- **Modern Tech Stack:**
  - **Frontend:** React 19, Vite, CSS-in-JS/Modules.
  - **Backend:** Node.js, Express, Multer for file processing.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd m3u-analyzer
```

### 2. Backend Setup
The backend runs on Node.js and processes the playlist logic.
```bash
cd server
npm install
npm start
```
*The server will start on `http://localhost:3001`.*

### 3. Frontend Setup
The frontend is built with React and Vite.
```bash
# From the project root
npm install
npm run dev
```
*The application will be available at `http://localhost:5173`.*

---

## 📂 Project Structure

- `/src`: React frontend application.
  - `App.jsx`: Main dashboard UI and API integration.
- `/server`: Express.js backend.
  - `index.js`: API endpoints and middleware configuration.
  - `parser.js`: Core logic for parsing M3U8 headers (`#EXTINF`) and track metadata.
- `.continue/rules/`: Project guidelines and AI assistant context.

---

## 📖 How it Works

1. **Parsing:** The backend splits the M3U8 content by line, specifically looking for `#EXTINF` tags to extract duration, artist names, and track titles.
2. **Analysis:** It aggregates the data to calculate total duration and identifies artists with the most entries.
3. **Duplicates:** Tracks are compared using a case-insensitive "Artist + Title" key to find potential duplicates.

## 📝 Dependencies

- **Frontend:** `react`, `vite`.
- **Backend:** `express`, `cors`, `multer` (for handling multipart/form-data file uploads).

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
