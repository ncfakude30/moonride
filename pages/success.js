import { useEffect } from 'react';
import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';

function Success() {
  const router = useRouter();

  useEffect(() => {
    // Add any additional logic here (e.g., updating DB, triggering notifications, etc.)
  }, []);

  return (
    <Wrapper>
      <Message>
        <h1>Payment Successful!</h1>
        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </Message>
    </Wrapper>
  );
}

export default Success;

const Wrapper = tw.div`
  flex justify-center items-center h-screen bg-gray-100
`;

const Message = tw.div`
  bg-white p-8 rounded-lg shadow-lg text-center
`;

const Button = tw.button`
  mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600
`;
