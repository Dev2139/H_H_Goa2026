# HH Goa 2026 Badge & Profile Frame Generator 🌊

An extremely premium, production-ready MERN stack web application built for the **HH Goa 2026 Frame Generator** challenge. The application enables developers and event attendees to upload their profile photo and instantly generate either a circular **Profile Picture Frame** or a conference-pass-style **Builder ID Card** badge with custom details (Name, Role, Stack).

---

## 🚀 Key Features

*   **Format A: Profile Picture Frame**
    *   Smart cover-resize cropping of the user's photo to $1080\times1080\text{px}$.
    *   Dynamic circular masking of the selfie using Sharp vector compositing.
    *   Premium tropical beach gradient border overlay with Goa wave vectors and palm leaves.
*   **Format B: Builder ID ID Card (Pass)**
    *   Conference-pass ratio format ($1080\times1350\text{px}$).
    *   Glassmorphic container design featuring neon-lit outer glowing gradients.
    *   Randomized automated Builder Titles (e.g. *Code Alchemist*, *Frontend Wizard*, *React Rockstar*).
    *   Dynamic transparent-background QR code rendering that encodes the badge's sharing link.
*   **Smart iPhone HEIC Support**
    *   Automatic backend HEIC/HEIF to PNG image conversion so iPhone photos upload flawlessly.
*   **Double Storage Engine**
    *   Uploads to Cloudinary (Preferred) or falls back dynamically to local disk storage (`server/uploads/`) if credentials are not configured.
*   **Advanced Social Sharing Integration**
    *   Serves a dedicated crawler-safe backend share page `/share/:shareId` filled with Open Graph meta tags (e.g., `og:image`, `twitter:card`).
    *   Platforms like X (Twitter) render the generated card directly in the post preview, while human visitors are dynamically redirected to the interactive React SPA.
*   **Premium Interactive UI**
    *   Default Dark Mode UI featuring modern typography (Inter/Outfit).
    *   Vibrant hover states, micro-interactions, page transition animations, and loading skeletons.
    *   Axios-based upload percentage progress bars.
    *   Celebratory particle confetti explosions on successful generation.
    *   Automatic database garbage collection (TTL) after 24 hours to secure user privacy.

---

## 📁 Project Structure

```text
HHGOA/
├── client/                 # Frontend React 19 Application
│   ├── public/
│   ├── src/
│   │   ├── components/      # UI components (Header, Footer, GlassCard, etc.)
│   │   ├── pages/           # Pages (Landing, Generator, Preview, About, Privacy, 404)
│   │   ├── services/        # Axios API service configuration
│   │   ├── App.jsx          # Router & layout container
│   │   ├── index.css        # Tailwind imports & customized class styles
│   │   └── main.jsx
│   ├── tailwind.config.js  # Theme extensions & colors
│   └── package.json
└── server/                 # Backend Node.js Express Server
    ├── controllers/        # Route controllers (upload, generate, metadata)
    ├── routes/             # REST endpoints router
    ├── models/             # Mongoose schemas (Image TTL database)
    ├── middleware/         # Security configs and Multer validators
    ├── services/           # Storage handlers (Cloudinary & local disk)
    ├── utils/              # Image converters & SVG layouts builders
    ├── server.js           # Server startup script
    └── package.json
```

---

## 🛠️ Environmental Setup

### 1. Server Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hh-goa-2026?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173

# Optional: Cloudinary. If empty, the server automatically saves images to local disk.
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Client Configuration
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Running Locally

### Backend Server
1. Navigate into server folder:
   ```bash
   cd server
   ```
2. Run installation:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### Frontend Client
1. Navigate into client folder:
   ```bash
   cd client
   ```
2. Run installation:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser at `http://localhost:5173`.

---

## 📖 API Documentation

### 1. Upload Raw Image
*   **Endpoint:** `POST /api/upload`
*   **Content-Type:** `multipart/form-data`
*   **Payload:** `{ image: <File> }`
*   **Response (200 OK):**
    ```json
    {
      "message": "Upload successful",
      "imageUrl": "http://localhost:5000/uploads/raw-1723049182-a1b2c3.png"
    }
    ```

### 2. Generate PFP Frame (Format A)
*   **Endpoint:** `POST /api/generate/frame`
*   **Content-Type:** `multipart/form-data` (supports uploading a file directly or sending a URL)
*   **Payload:**
    *   `image`: `<File>` (Optional if `photoUrl` is provided)
    *   `photoUrl`: `string` (Optional if `image` file is provided)
    *   `enhance`: `boolean`
*   **Response (201 Created):**
    ```json
    {
      "_id": "64d0a1b2...",
      "imageType": "frame",
      "generatedImageUrl": "https://res.cloudinary.com/cloud/image/upload/pfp-a1b2c3d4.png",
      "shareId": "a1b2c3d4",
      "createdAt": "2026-08-08T00:00:00Z"
    }
    ```

### 3. Generate Builder Card (Format B)
*   **Endpoint:** `POST /api/generate/card`
*   **Content-Type:** `multipart/form-data`
*   **Payload:**
    *   `image`: `<File>` (Optional if `photoUrl` is provided)
    *   `photoUrl`: `string`
    *   `name`: `string` (Max 24 chars)
    *   `role`: `string` (Max 30 chars)
    *   `stack`: `string` (Max 45 chars)
    *   `enhance`: `boolean`
*   **Response (201 Created):**
    ```json
    {
      "_id": "64d0a1b8...",
      "name": "DEV HACKER",
      "role": "Full Stack Architect",
      "stack": "React, Node, Tailwind",
      "builderTitle": "CODE ALCHEMIST",
      "imageType": "card",
      "generatedImageUrl": "https://res.cloudinary.com/cloud/image/upload/card-x1y2z3.png",
      "shareId": "x1y2z3",
      "createdAt": "2026-08-08T00:00:00.000Z"
    }
    ```

### 4. Get Badge Metadata
*   **Endpoint:** `GET /api/image/:shareId`
*   **Response (200 OK):** Returns the database Mongoose record.

### 5. Delete Badge
*   **Endpoint:** `DELETE /api/image/:shareId`
*   **Response (200 OK):**
    ```json
    { "message": "Badge deleted successfully." }
    ```

### 6. Get Recent Gallery Items
*   **Endpoint:** `GET /api/gallery`
*   **Response (200 OK):** Returns the 8 most recently generated badges.

---

## 🚢 Deployment Guide

### 1. Database → MongoDB Atlas
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and spin up a free M0 Cluster.
2. Under **Network Access**, whitelist `0.0.0.0/32` (or restrict access to your Render backend IP).
3. Under **Database Access**, create a user with read/write privileges.
4. Retrieve your Connection String (`mongodb+srv://...`) and supply it as `MONGODB_URI` in the server's `.env`.

### 2. Backend Server → Render
1. Sign up/log in to [Render](https://render.com).
2. Create a new **Web Service** and link it to your GitHub Repository.
3. Configure the following parameters:
    *   **Root Directory:** `server`
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
4. Add your environment variables (`MONGODB_URI`, `FRONTEND_URL`, `CLOUDINARY_URL`, etc.) under the **Environment** tab.
5. *Note:* If running on Render's free tier, the first request may take ~50 seconds to warm up the server. Sharp image processing takes under 3 seconds once running.

### 3. Frontend Application → Vercel
1. Install Vercel CLI or import the project directly into [Vercel Dashboard](https://vercel.com).
2. Select your repository. Set parameters:
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `client`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
3. Add the environment variable:
    *   `VITE_API_URL` = `<your_render_service_backend_url>/api`
4. Deploy!
