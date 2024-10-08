import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithPopup, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth, provider } from '../firebase'; // Firebase config and initialization
import tw from 'tailwind-styled-components';
import Image from 'next/image';
import { loginApi, registerApi } from './api/api.service'; // Add registerApi for registration
import { useDispatch } from 'react-redux';
import { setUser } from '../store/reducers/authSlice';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and registration
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [buttonText, setButtonText] = useState('Sign in with Phone Number'); // State for button text
  const [isOtpSent, setIsOtpSent] = useState(false); // State for OTP action
  const [isGoogleDisabled, setIsGoogleDisabled] = useState(false); // Disable Google button
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(false); // Disable Phone button
  const [isLoading, setIsLoading] = useState(false); // Loader state for OTP sending

  useEffect(() => {
    const handleAuthStateChanged = async (user) => {
      if (user) {
        try {
          const apiFunction = isRegistering ? registerApi : loginApi;
          const response = await apiFunction({
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            id: user?.id || user.uid,
          });

          if (response.success) {
            dispatch(setUser({
              name: user.displayName,
              photoUrl: user.photoURL,
              id: user?.id || user.uid,
            }));
            router.push('/');
          } else {
            console.error(`Failed to ${isRegistering ? 'register' : 'login'} user`);
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
  }, [dispatch, router, isRegistering]);

  const handleGoogleSignIn = async () => {
    try {
      setIsPhoneDisabled(true); // Disable phone button when Google sign-in is clicked
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handlePhoneButtonClick = () => {
    if (!isOtpSent) {
      // First click: Show phone input and change button text
      setShowPhoneInput(true);
      setButtonText('Send OTP');
      setIsOtpSent(true);
      setIsGoogleDisabled(true); // Disable Google button when phone button is clicked
    } else {
      // Second click: Send OTP
      handleSendOtp();
    }
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true); // Start loader
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber?.trim()}`, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setIsLoading(false); // Stop loader
    } catch (error) {
      console.error('Error during phone sign-in:', error);
      setIsLoading(false); // Stop loader in case of error
    }
  };

  const verifyCode = async () => {
    try {
      const credential = await auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      await auth.signInWithCredential(credential);
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  const toggleRegister = () => {
    setIsRegistering(!isRegistering);
    setPhoneNumber('');
    setVerificationCode('');
    setVerificationId('');
    setShowPhoneInput(false);
    setIsOtpSent(false); // Reset OTP state when toggling
    setButtonText('Sign in with Phone Number'); // Reset button text when toggling
  };

  return (
    <Wrapper>
      <Content>
        <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt='MoonRides Logo' width={200} height={200} />
        <Title>{isRegistering ? 'Register your account' : 'Login to access your account'}</Title>

        {/* Loader popup while sending OTP */}
        {isLoading && (
          <LoadingPopup>
            <LoadingWrapper>
              <Loader />
              <LoadingMessage>Sending OTP...</LoadingMessage>
            </LoadingWrapper>
          </LoadingPopup>
        )}

        {/* Phone number input */}
        <div className={`overflow-hidden transition-all duration-500 ${showPhoneInput ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <InputBoxes>
            <PhoneInput
              country={'us'} // Default country
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="Enter your phone number"
              specialLabel=""
              disableDropdown={false}
            />
          </InputBoxes>
        </div>

        {/* OTP Verification */}
        {verificationId && (
          <>
            <InputBoxes>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </InputBoxes>
            <SignInButton onClick={verifyCode}>Verify OTP</SignInButton>
          </>
        )}

        {/* Phone Number Sign In */}
        <SignInButton onClick={handlePhoneButtonClick} disabled={isPhoneDisabled}>
          {buttonText}
        </SignInButton>

        {/* Google Sign In */}
        <SignInButton onClick={handleGoogleSignIn} disabled={isGoogleDisabled}>
          {isRegistering ? 'Register with Google' : 'Sign in with Google'}
        </SignInButton>

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

// Tailwind CSS Components

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
    w-full max-w-xs my-2
    disabled:opacity-50 disabled:cursor-not-allowed
`;

const InputBoxes = tw.div`
    flex flex-col mb-4
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
  text-white-500 font-semibold cursor-pointer mt-4 hover:underline
`;

const LoadingPopup = tw.div`
  fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70
`;

const LoadingWrapper = tw.div`
  flex flex-col items-center justify-center py-6
`;

const LoadingMessage = tw.div`
  text-white font-semibold text-center py-4 text-center text-xs py-2
`;

const Loader = tw.div`
  w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white-500
`;
