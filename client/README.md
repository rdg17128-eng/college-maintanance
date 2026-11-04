# CampusCare - Frontend Client

Frontend client for the College Maintenance Management System built with **React 19**, **Vite 8**, and **Tailwind CSS v4**.

## Technologies Used

- **React 19** (`react@^19.3.1`, `react-dom@^19.3.1`): Latest functional component model, hooks (`useState`, `useEffect`, `useCallback`, `useContext`).
- **Vite 8** (`vite@^8.3.4`): Next-generation frontend tooling with instant server start and lightning-fast HMR.
- **Tailwind CSS v4** (`tailwindcss@^4.3.3`, `@tailwindcss/vite@^4.3.3`): Utility-first CSS framework with streamlined CSS-first configuration.
- **Custom Lightweight Animations**: Simple keyframe animations (`fadeIn`, `modalZoom`) and smooth transitions for modal dialogs and dynamic views.
- **Context API**:
  - `AuthContext`: Centralized authentication and token state.
  - `ToastContext`: Floating non-blocking feedback messages.
- **Proxy Configuration**: Configured in `vite.config.js` to automatically forward `/api` and `/uploads` requests to `http://localhost:5000`.

## Scripts

- `npm run dev`: Start Vite development server on port 5173.
- `npm run build`: Build production assets to `dist/`.
- `npm run preview`: Preview production build locally.
