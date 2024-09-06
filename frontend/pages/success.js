import Link from 'next/link';
import tw from 'tailwind-styled-components';

function Success() {
    return (
        <Wrapper>
            <Message>Thank you! Your trip has been confirmed and payment was successful.</Message>
            <Link href='/'>
                <HomeButton>Go Home</HomeButton>
            </Link>
        </Wrapper>
    );
}

export default Success;

const Wrapper = tw.div`
    flex h-screen items-center justify-center flex-col
`;

const Message = tw.div`
    text-xl mb-4
`;

const HomeButton = tw.div`
    bg-black text-white py-2 px-4 rounded cursor-pointer
`;
