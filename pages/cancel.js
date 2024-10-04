import { useRouter } from 'next/router';
import tw from 'tailwind-styled-components';

function Cancel() {
  const router = useRouter();

  return (
    <Wrapper>
      <Message>
        <h1>Payment Canceled</h1>
        <p>Your payment has been canceled. If this was a mistake, you can try again.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </Message>
    </Wrapper>
  );
}

export default Cancel;

const Wrapper = tw.div`
  flex justify-center items-center h-screen bg-gray-100
`;

const Message = tw.div`
  bg-white p-8 rounded-lg shadow-lg text-center
`;

const Button = tw.button`
  mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600
`;
