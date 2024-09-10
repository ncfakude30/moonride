import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import { AuthProvider } from '../contexts/AuthContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';

function MyApp({ Component, pageProps }) {
    return (
        <Provider store={store}>
            <AuthProvider>
                <WebSocketProvider>
                    <Component {...pageProps} />
                </WebSocketProvider>
            </AuthProvider>
        </Provider>
    );
}

export default MyApp;
