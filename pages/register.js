import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase'; // Firebase config and initialization
import tw from 'tailwind-styled-components';
import Image from 'next/image';

function Register() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Optional email
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');

  // Handle phone number registration
  const handleRegister = async () => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
      }, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  // Verify OTP during registration
  const verifyCode = async () => {
    try {
      const credential = await auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      await auth.signInWithCredential(credential);
      // Optionally call your API to store the user's name and email here
      router.push('/login');
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  return (
    <Wrapper>
      <Content>
        <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt='MoonRides Logo' width={200} height={200} />
        <Title>Register your account</Title>

        {/* Name Input */}
        <InputBoxes>
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Optional Email Input */}
        <Input
          type="email"
          placeholder="Optional: Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Phone Number Registration */}
        <Input
          type="text"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        </InputBoxes>
        <SignInButton onClick={handleRegister}>Send OTP</SignInButton>

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

        <div id="recaptcha-container"></div>
        
      </Content>
    </Wrapper>
  );
}

export default Register;

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
    w-full max-w-xs
`;

const InputBoxes = tw.div`
    flex flex-col
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
