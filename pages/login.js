import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithPopup, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, provider } from '../firebase'; // Firebase config and initialization
import tw from 'tailwind-styled-components';
import Image from 'next/image';
import { loginApi } from './api/api.service';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/reducers/authSlice';

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and registration
  const [showPhoneInput, setShowPhoneInput] = useState(false); // State to toggle phone input

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
              id: user?.id || user.uid,
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

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Handle phone number sign-in
  const handlePhoneSignIn = () => {
    setShowPhoneInput(true); // Show the phone number input when clicked
  };

  const handleSendOtp = async () => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
    } catch (error) {
      console.error('Error during phone sign-in:', error);
    }
  };

  // Verify OTP
  const verifyCode = async () => {
    try {
      const credential = await auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      await auth.signInWithCredential(credential);
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  // Toggle between login and registration
  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    setPhoneNumber('');
    setVerificationCode('');
    setVerificationId('');
    setShowPhoneInput(false); // Reset phone input visibility when toggling
  };

  return (
    <Wrapper>
      <Content>
        <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt='MoonRides Logo' width={200} height={200} />
        <Title>{isRegistering ? 'Register your account' : 'Login to access your account'}</Title>

        {/* Phone Number Sign In */}
        <SignInButton onClick={handlePhoneSignIn}>Sign in with Phone Number</SignInButton>

        {showPhoneInput && (
          <InputBoxes>
            <Input
              type="text"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <SignInButton onClick={handleSendOtp}>Send OTP</SignInButton>
          </InputBoxes>
        )}

        {/* Google Sign In */}
        <SignInButton onClick={handleGoogleSignIn}>Sign in with Google</SignInButton>


        {/* OTP Verification */}
        {verificationId && (
          <InputBoxes>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <SignInButton onClick={verifyCode}>Verify OTP</SignInButton>
          </InputBoxes>
        )}

        <div id="recaptcha-container"></div>
        
        {/* Toggle between login and registration */}
        <ToggleLink onClick={toggleRegister}>
          {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
        </ToggleLink>
      </Content>
    </Wrapper>
  );
}

export default Login;

const Wrapper = tw.div`
  flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-100
`;

const Content = tw.div`
  flex flex-col items-center justify-center flex-grow p-4
`;

const SignInButton = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white text-center rounded-full p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-gray-600 focus:ring-opacity-25
    w-full max-w-xs my-2  // Added margin for spacing between buttons
`;

const InputBoxes = tw.div`
    flex flex-col mb-4 // Added bottom margin for spacing
`;

const Input = tw.input`
    h-12 bg-white text-gray-700 my-2 rounded-lg shadow-sm p-3 outline-none border border-gray-300
    placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition
`;

const Title = tw.div`
  text-5xl font-extrabold text-gray-300 text-center mb-6
  bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
  shadow-md
`;

const ToggleLink = tw.span`
  text-blue-500 cursor-pointer mt-4 hover:underline
`;
