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
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [buttonText, setButtonText] = useState('Sign in with Phone Number');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isGoogleDisabled, setIsGoogleDisabled] = useState(false);
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDriver, setIsDriver] = useState(false); // Toggle state for Driver/Rider

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
            role: isDriver ? 'driver' : 'rider',
            status: true,
          });

          if (response.success) {
            dispatch(setUser({
              name: user.displayName,
              photoUrl: user.photoURL,
              id: user?.id || user.uid,
              role: isDriver ? 'driver' : 'rider',
              status: true,
            }));

            if(isDriver) {
              router.push('/driver');
            } else{
              router.push('/');
            }
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
  }, [dispatch, router, isRegistering, isDriver]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setIsPhoneDisabled(true);
      await signInWithPopup(auth, provider);
      setIsLoading(false);
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsLoading(false);
    }
  };

  const handlePhoneButtonClick = () => {
    if (!isOtpSent) {
      setShowPhoneInput(true);
      setButtonText('Send OTP');
      setIsOtpSent(true);
      setIsGoogleDisabled(true);
    } else {
      handleSendOtp();
    }
  };

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, `+${phoneNumber?.trim()}`, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error during phone sign-in:', error);
      setIsLoading(false);
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
    setIsOtpSent(false);
    setButtonText('Sign in with Phone Number');
  };

  const toggleRole = () => {
    setIsDriver(!isDriver);
  };

  return (
    <Wrapper>
      <Content>
        <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt='MoonRides Logo' width={200} height={200} />
        <Title>{isRegistering ? 'Register your account' : 'Login to access your account'}</Title>

        {/* Loader popup */}
        {isLoading && (
          <LoadingPopup>
            <LoadingWrapper>
              <Loader />
              <LoadingMessage>{isOtpSent ? 'Sending OTP...' : 'Signing in with Google...'}</LoadingMessage>
            </LoadingWrapper>
          </LoadingPopup>
        )}

        {/* Phone number input */}
        <div className={`overflow-hidden transition-all duration-500 ${showPhoneInput ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <InputBoxes>
            <PhoneInput
              country={'us'}
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

        {/* Role Toggle: Rider or Driver */}
        <RoleToggle onClick={toggleRole}>
          <ToggleLabel isDriver={isDriver}>
            <ToggleCircle isDriver={isDriver} />
          </ToggleLabel>
          <ToggleText isDriver={isDriver}>{isDriver ? 'Sign in as Driver' : 'Sign in as Rider'}</ToggleText>
        </RoleToggle>
        {/* Toggle between login and registration */}
        <ToggleLink onClick={toggleRegister}>
          {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
        </ToggleLink>
        <div id="recaptcha-container"></div>
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
  w-full my-2 disabled:bg-gray-400
`;

const InputBoxes = tw.div`
  flex items-center bg-white px-4 py-2 rounded-lg shadow-md mb-4
`;

const Input = tw.input`
  border-none outline-none w-full text-gray-600 text-lg
`;

const Title = tw.div`
  text-5xl font-extrabold text-gray-300 text-center mb-6
  bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
  shadow-md
`;

const RoleToggle = tw.div`
  bg-gradient-to-r from-gray-600 to-gray-400 text-white text-center rounded-full p-2 font-semibold shadow-lg
  w-full my-2 disabled:bg-gray-400
  relative flex items-center mt-2 cursor-pointer
`;

const ToggleLabel = tw.label`
  relative flex items-center h-10 w-16 rounded-full p-1 transition-colors
  ${(props) => props.isDriver ? 'bg-green-500' : 'bg-gradient-to-r from-gray-600 to-gray-400'}
`;

const ToggleCircle = tw.div`
  bg-white h-8 w-8 rounded-full shadow-md transform transition-transform
  ${(props) => props.isDriver ? 'translate-x-6' : 'translate-x-0'}
`;

const ToggleText = tw.span`
  text-white-500 ml-3 text-lg font-medium
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
