import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';
import { isPaymentValid, processPayout } from './api/api.service';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Success() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isValid, setIsValid] = useState(null); // Set initial value to null
  const { query } = router;
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { payment } = useSelector(state => state.payment.paymentResponse);
  const { complete: isComplete } = useSelector(state => state.payment);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
            dispatch(clearUser());
            router.push('/login');
        } else {
            setIsValid(false);
        }
    });

    return () => unsubscribe();
}, [dispatch, user, router]);

useEffect(() => {
    console.log(payment);
    if(isComplete && (payment.toUpperCase() === 'CASH')) {
      setIsValid(true);
      return;
    }

    if (payment && (payment.toUpperCase() === 'CASH')) {
      setIsValid(true);
      return;
    }

    if (!query || Object.keys(query).length === 0) {
        setIsValid(false);
        return;
      }
  
      console.log(query);

    // Verify payment using the query parameters from the Ozow redirect
    const verifyTransaction = async () => {
      try {
         // Pass the query parameters to the isPaymentValid function
      const isValid = isPaymentValid({
        SiteCode: query.SiteCode,
        TransactionId: query.TransactionId,
        TransactionReference: query.TransactionReference,
        Amount: query.Amount,
        Status: query.Status,
        Hash: query.Hash,
        Optional1: query.Optional1,
        Optional2: query.Optional2,
        Optional3: query.Optional3,
        Optional4: query.Optional4,
        Optional5: query.Optional5,
        CurrencyCode: query.CurrencyCode,
        IsTest: query.IsTest,
        StatusMessage: query.StatusMessage,
      });

      console.log(isValid);
      
      setIsValid(isValid);

      if(isValid) {
        handleSuccessfulPayment();
      }
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsValid(false); // Assume invalid on error
      }
    };

    const handleSuccessfulPayment = async () => {
      if(result) {
        console.log(`Attempting to process payout for transaction: ${query.TransactionId}`);
        await processPayout({
          tripId: query.TransactionReference,
          driverId: query.TransactionId,
          amount: query.Amount
        }).then((response) => {
          console.log(`Payout response: ${JSON.stringify(response)}`);
        }).catch((error) => {
          console.log(error);
        })
      }
    }

    verifyTransaction();
  }, [query, isValid, payment, isComplete]);


  // Countdown logic and automatic redirect after 5 seconds
  useEffect(() => {
    if (countdown > 0) { // Ensure countdown only starts when payment is valid
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown <= 0) {
      router.push('/'); // Redirect to home page after countdown ends
    }
  }, [countdown, isValid, router]);

  // Show loading or verification message while isValid is null
  if (isValid === null) {
    return (
      <Wrapper>
        <Message>
          <Title>Verifying Payment...</Title>
          <Description>Please wait while we verify your payment details.</Description>
        </Message>
      </Wrapper>
    );
  }

  // Show invalid transaction message if payment is invalid
  if (!isValid) {
    return (
      <Wrapper className="bg-gradient-to-r from-red-400 via-red-500 to-red-600">
        <Message>
          <ErrorTitle>Invalid Transaction</ErrorTitle>
          <ErrorDescription>
            The payment could not be verified. Please try again or contact support.
          </ErrorDescription>
          <Description>
            Redirecting to the home page in <Countdown>{countdown}</Countdown> seconds.
        </Description>
          <ErrorButton onClick={() => router.push('/')}>Go to Home</ErrorButton>
        </Message>
        <AnimationWrapper>
        <CircleOuter>
          <CircleInner countdown={countdown} />
        </CircleOuter>
      </AnimationWrapper>
      </Wrapper>
    );
  }

  // Show success message if payment is valid
  return (
    <Wrapper>
      <Message>
        <Title>Payment Successful!</Title>
        <Description>
          Thank you for your payment. Your transaction has been completed successfully.
          You will be redirected to the home page in <Countdown>{countdown}</Countdown> seconds.
        </Description>
        <Button onClick={() => router.push('/')}>Go to Home Now</Button>
      </Message>
      <AnimationWrapper>
        <CircleOuter>
          <CircleInner countdown={countdown} />
        </CircleOuter>
      </AnimationWrapper>
    </Wrapper>
  );
}

export default Success;

// Tailwind-styled components
const Wrapper = tw.div`
  flex justify-center items-center h-screen bg-gradient-to-r from-green-400 via-green-500 to-blue-500
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

// Animation for countdown
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

// Custom animation for countdown circle
const circleAnimation = `
  @keyframes spin-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const customStyles = tw.div`
  ${circleAnimation}
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
