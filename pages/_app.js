import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
    return (
      <>
      <Script
                src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyAhU-s47LJFmxiPK4X5zD4oWfccyUN8kEU&libraries=places`}
                strategy="beforeInteractive"
                async
                defer
      />
      <Provider store={store}>
            <AuthProvider>
                <WebSocketProvider>
                    <Component {...pageProps} />
                </WebSocketProvider>
            </AuthProvider>
        </Provider>
      </>
    );
}

export default MyApp;
