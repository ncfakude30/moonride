import { useEffect, useState } from 'react';
import Head from 'next/head';
import tw from 'tailwind-styled-components';
import Map from './components/Map';
import Link from 'next/link';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import RecentTrips from './components/RecentTrips'; // Import the RecentTrips component
import MoonRidesImage from '../public/moon-ride.png';
import Image from 'next/image';

export default function Home() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({
                    name: user.displayName,
                    photoUrl: user.photoURL,
                    id: user?.uid || user.displayName
                });
            } else {
                setUser(null);
                router.push('/login');
            }
        });
    }, []);

    return (
        <Wrapper>
            <Map />
            <ActionItems>
                <Header style={{ backgroundColor: '#1a1a2e' }}> {/* Dark blue color */}
                    <Image src={MoonRidesImage} alt="MoonRides Logo" height={112} width={112} />
                    <Profile>
                        <Name>{user && user.name}</Name>
                        <UserImage
                            src={user && user.photoUrl}
                            onClick={() => signOut(auth)}
                        />
                    </Profile>
                </Header>
                <ActionButtons>
                    <Link href='/search'>
                        <ActionButton>
                            <ActionButtonImage src='https://i.ibb.co/cyvcpfF/uberx.png' />
                            Ride
                        </ActionButton>
                    </Link>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://i.ibb.co/n776JLm/bike.png' />
                        Wheels
                    </ActionButton>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://i.ibb.co/5RjchBg/uberschedule.png' />
                        Reserve
                    </ActionButton>
                </ActionButtons>
                <RecentTrips />
            </ActionItems>
        </Wrapper>
    );
}

const Wrapper = tw.div`
    flex flex-col h-screen
    bg-gradient-to-b from-[#0f0f3f] to-[#0a0a1a] // Night sky gradient with dark blue tones
`;

const ActionItems = tw.div`
    flex-1 p-4
`;

const Header = tw.div`
    flex justify-between items-center p-4
    rounded-lg // Optional: Add rounded corners if desired
`;

const Profile = tw.div`
    flex items-center
`;

const Name = tw.div`
    mr-4 w-20 text-sm text-gray-300 font-medium // Light gray color, medium weight
`;

const UserImage = tw.img`
    h-12 w-12 rounded-full border border-gray-200 p-px object-cover cursor-pointer
`;

const ActionButtons = tw.div`
    flex
`;

const ActionButton = tw.div`
    relative flex flex-col flex-1 bg-gray-200 m-1 h-32 items-center justify-center rounded-lg overflow-hidden transform hover:scale-105 transition text-xl
`;

const ActionButtonImage = tw.img`
    h-3/5
`;

const Badge = tw.div`
    absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full
    whitespace-nowrap
`;

const InputButton = tw.div`
    h-20 bg-gray-200 text-2xl p-4 flex items-center mt-8
`;