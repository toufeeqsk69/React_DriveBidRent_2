import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import store from './redux/store.js'
import AppInitializer from './AppInitializer.jsx'
import './index.css'
import '@splidejs/react-splide/css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <AppInitializer />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
)
