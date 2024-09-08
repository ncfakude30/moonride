import { useEffect, useState } from 'react';
import Head from 'next/head';
import tw from 'tailwind-styled-components';
import Map from './components/Map';
import Link from 'next/link';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import RecentTrips from './components/RecentTrips'; // Import the RecentTrips component
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
                    id: user?.id || user.uid,
                    ...user,
                });
            } else {
                setUser(null);
                router.push('/login');
            }
        });
    }, [router]);

    return (
        <Wrapper>
            <Map />
            <ActionItems>
                <Header style={{ backgroundColor: '#1a1a2e' }}> {/* Dark blue color */}
                    <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt="MoonRides Logo" height={112} width={112} />
                    <Profile>
                        <Name>{user && user.name}</Name>
                        <UserImage
                            src={user && user.photoUrl}
                            onClick={() => signOut(auth)}
                        />
                    </Profile>
                </Header>
                <ActionButtons>
                    <Link
                        href={{
                            pathname: '/search',
                            query: { user: JSON.stringify(user) }
                        }}
                    >
                        <ActionButton>
                            <ActionButtonImage src='https://i.ibb.co/cyvcpfF/uberx.png' />
                            <Label>Ride</Label>
                        </ActionButton>
                    </Link>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://moonride-media.s3.amazonaws.com/water.png'/>
                        <Label>Water</Label>
                    </ActionButton>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://i.ibb.co/n776JLm/bike.png'/>
                        <Label>Order</Label>
                    </ActionButton>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://moonride-media.s3.amazonaws.com/helper.png'/>
                        <Label>Helper</Label>
                    </ActionButton>
                    <ActionButton>
                        <Badge>Coming Soon</Badge>
                        <ActionButtonImage src='https://i.ibb.co/5RjchBg/uberschedule.png' />
                        <Label>Reserve</Label>
                    </ActionButton>
                </ActionButtons>
                <RecentTrips user={user} />
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
    flex overflow-x-auto no-scrollbar whitespace-nowrap
    space-x-1.5
    mt-2 // Adds 2px space at the top
`;

const ActionButton = tw.button`
    relative flex flex-col items-center justify-center bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-lg p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
    flex-none // Prevent stretching
    w-32 h-32 // Adjust size as needed
    max-w-xs // Ensures button doesn’t exceed max width
    overflow-hidden // Ensures content doesn’t overflow
`;

const ActionButtonImage = tw.img`
    h-24 w-24 // Adjust the size of the image if needed
    object-cover // Ensure the image covers its container
    mb-2 // Margin bottom to add more space between the image and the label
    z-10 // Ensures the image is above other elements if needed
`;

const Badge = tw.div`
    absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full
`;

const Label = tw.div`
    absolute bottom-2 // Position the label at the bottom with some padding
    text-base // Slightly larger font size
    text-white // Change label text color to white
    z-20 // Ensure the label is above the image
`;
