# 🖌️ Realtime Collaborative Drawing App

A web-based collaborative drawing app built with **React**, **Canvas API**, **Redux Toolkit**, and **WebSockets**. 
Users can draw, insert images, write text, and collaborate in real-time across tabs or with other users.

## 🌐 Live Demo

[Open Drawing App](https://my-drawing-app-rust.vercel.app/)

## 🚀 **Features:**

- ✏️ Pencil tool. Draw lines with different thickness and color.
- 🧽 Eraser mode.
- 📝 Text input on canvas.
- 🎨 Choose color and opacity.
- 🔺 Drawing geometric shapes (rectangle, circle, line).
- 🗑️ Clear the canvas.
- 🖼️ Inserting and editing images (resize, drag, opacity control).
- 📡 WebSocket-powered real-time collaboration.
- 👥 Per-user canvas layers.
- 🔐 Simple user authentication.

## 🛠️ Tech Stack

### Frontend
- **Next.js**
- **React**
- **TypeScript**
- **Redux Toolkit**
- **Canvas API**
- **SCSS**

### Backend
- **Node.js**
- **Express**
- **WebSockets (`ws`)**
- **JWT**
- **bcrypt**

## 📦 **Installation:**

1. Clone the repository:
   ```bash
   git clone git@github.com:ValentinaFediakova/my-drawing-app.git
   ```
2. Go to the project folder:
   ```bash
   cd my-drawing-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## 💡 What This Project Demonstrates

- Building a realtime application with WebSockets
- Synchronizing application state between multiple clients
- Working directly with the HTML Canvas API
- Designing separate abstractions for different drawing tools
- Managing multiple canvas layers
- Handling interactive image manipulation
- Combining React state with imperative Canvas rendering
- Building a small full-stack authentication flow
- Structuring a Next.js frontend with a separate Node.js backend
