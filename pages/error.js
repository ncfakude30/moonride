import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';

function ErrorPage() {
  const router = useRouter();

  return (
    <Wrapper>
      <Message>
        <h1>Payment Error</h1>
        <p>An error occurred during the payment process. Please try again.</p>
        <Button onClick={() => router.push('/payment')}>Retry Payment</Button>
      </Message>
    </Wrapper>
  );
}

export default ErrorPage;

const Wrapper = tw.div`
  flex justify-center items-center h-screen bg-gray-100
`;

const Message = tw.div`
  bg-white p-8 rounded-lg shadow-lg text-center
`;

const Button = tw.button`
  mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600
`;
