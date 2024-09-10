import Link from 'next/link';
import tw from 'tailwind-styled-components';

function Success() {
    return (
        <Wrapper>
            <Message>Thank you! Your trip has been confirmed and payment was successful.</Message>
            <Link href='/' passHref>
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
    text-xl mb-4 text-center
`;

const HomeButton = tw.a`
    bg-black text-white py-2 px-4 rounded cursor-pointer transition-colors duration-300 ease-in-out hover:bg-gray-800
`;
