# Smart Emergency Medical Dispatch System

A dedicated web portal serving dual operational roles: Enterprise System Admin and Tactical Dispatcher.

## Tech Stack
- **Framework**: React 18+ (Vite)
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Network**: Axios, @stomp/stompjs
- **Maps**: React-Leaflet
- **Icons**: Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Check the `.env` file for required configuration variables.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Architecture
- `src/layouts/`: Contains distinct layouts for Admin (Light Mode) and Dispatcher (Dark Mode).
- `src/pages/`: Role-specific views.
- `src/store/`: Zustand state stores (e.g., Auth).
- `src/services/`: API and WebSocket configurations.
