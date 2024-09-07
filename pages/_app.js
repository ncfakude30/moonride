import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';

function MyApp({ Component, pageProps }) {
    return (
        <AuthProvider>
            <WebSocketProvider>
                <Component {...pageProps} />
            </WebSocketProvider>
        </AuthProvider>
    );
}

export default MyApp;
