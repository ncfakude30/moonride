import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';
import tw from 'tailwind-styled-components';
import Image from 'next/image';
import { loginApi } from './api/app.service';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/reducers/authSlice';

function Login() {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleAuthStateChanged = async (user) => {
            if (user) {
                try {
                    const response = await loginApi({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        id: user?.id || user.uid,
                    });

                    console.log(`Login response: ${JSON.stringify(response)}`);
                    if (response.success) {
                        dispatch(setUser({
                            name: user.displayName,
                            photoUrl: user.photoURL,
                            id: user?.id || user.uid
                        }));
                        router.push('/');
                    } else {
                        console.error('Failed to store user data');
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Oops, something went wrong', error);
                    router.push('/login');
                }
            }
        };

        const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
        return () => unsubscribe();
    }, [dispatch, router]);

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    };

    return (
        <Wrapper>
            <Content>
                <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt='MoonRides Logo' width={200} height={200} />
                <Title>Login to access your account</Title>
                <HeadImage src='https://i.ibb.co/CsV9RYZ/login-image.png' width={300} height={200} />
                <SignInButton onClick={handleSignIn}>Sign in with Google</SignInButton>
            </Content>
        </Wrapper>
    );
}

export default Login;

const Wrapper = tw.div`
    flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-100 // Dark gray gradient
`;

const Content = tw.div`
    flex flex-col items-center justify-center flex-grow p-4
`;

const SignInButton = tw.button`
    bg-black text-white text-center py-4 mt-6 self-center w-full
`;

const Title = tw.div`
    text-5xl font-extrabold text-gray-300 text-center mb-6
    bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
    shadow-md
`;

const HeadImage = tw.img`
    object-contain w-full mt-6
`;
