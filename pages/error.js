import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { isPaymentValid } from './api/api.service';

function Success() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isValid, setIsValid] = useState(null); // Start as null for initial loading state
  const { query } = router;

  useEffect(() => {
    // Verify payment using the query parameters from the Ozow redirect
    const verifyTransaction = async () => {
      try {
        const result = await isPaymentValid(query); // Pass the query as the payment details
        setIsValid(result);
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsValid(false); // Set to false if verification fails
      }
    };

    verifyTransaction();
  }, [query, router]);

  // Countdown logic and automatic redirect after 5 seconds
  useEffect(() => {
    if (countdown > 0 && isValid !== null) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isValid === true && countdown <= 0) {
      router.push('/'); // Redirect to home page if success
    }
  }, [countdown, router, isValid]);

  // Display loading state
  if (isValid === null) {
    return (
      <Wrapper className="bg-gray-200">
        <Message>
          <Title>Processing Payment...</Title>
          <Description>Please wait while we processing your payment.</Description>
        </Message>
      </Wrapper>
    );
  }
  // Handle invalid payment (error state)
    return (
        <Wrapper className="bg-gradient-to-r from-red-400 via-red-500 to-red-600">
        <Message>
            <ErrorTitle>Payment Failed!</ErrorTitle>
            <ErrorDescription>
            We encountered an issue processing your payment. Please try again or contact support.
            </ErrorDescription>
            <ErrorButton onClick={() => router.push('/payment')}>Retry Payment</ErrorButton>
            <ErrorButton onClick={() => router.push('/')}>Go to Home</ErrorButton>
        </Message>
        </Wrapper>
    );
}

export default Success;

// Tailwind-styled components
const Wrapper = tw.div`
  flex justify-center items-center h-screen
`;

const Message = tw.div`
  bg-white p-8 rounded-lg shadow-lg text-center z-10
`;

const Title = tw.h1`
  text-4xl font-bold text-green-800 mb-4
`;

const Description = tw.p`
  text-gray-600 text-lg mb-4
`;

const Countdown = tw.span`
  font-bold text-blue-500
`;

const Button = tw.button`
    bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full p-2 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-green-500 hover:to-green-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-green-500
    w-full max-w-xs
`;

// Error state styling
const ErrorTitle = tw.h1`
  text-4xl font-bold text-red-800 mb-4
`;

const ErrorDescription = tw.p`
  text-gray-600 text-lg mb-4
`;

const ErrorButton = tw.button`
  bg-gradient-to-r from-red-600 to-red-400 text-white rounded-full p-2 font-semibold shadow-lg
  hover:bg-gradient-to-r hover:from-red-500 hover:to-red-300 transition-colors
  focus:outline-none focus:ring-1 focus:ring-red-500
  w-full max-w-xs mb-2
`;

const AnimationWrapper = tw.div`
  absolute top-0 left-0 w-full h-full flex justify-center items-center
`;

const CircleOuter = tw.div`
  relative w-40 h-40 rounded-full bg-gray-200 flex justify-center items-center shadow-2xl
`;

const CircleInner = tw.div`
  relative w-36 h-36 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-spin-slow
  ${(props) => (props.countdown <= 0 ? 'hidden' : '')}  // Hide after countdown ends
`;
