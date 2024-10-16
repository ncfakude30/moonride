// pages/drivers.js

import { useState, useEffect } from 'react';
import Head from 'next/head';
import tw from 'tailwind-styled-components';
import Map from './components/Map';
import Link from 'next/link';
import { useRouter } from 'next/router';
import RecentTrips from './components/RecentTrips';
import OnlineToggle from './components/driverStatus';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { setUser, clearUser } from '../store/reducers/authSlice';
import Skeleton from 'react-loading-skeleton';

export default function Drivers() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const router = useRouter();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                dispatch(clearUser());
                router.push('/login');
            } else {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [dispatch, router]);

    const handleSignOut = () => {
        signOut(auth).then(() => {
            dispatch(clearUser());
            router.push('/login');
        });
    };

    const handlePopupOpen = () => {
        setIsPopupOpen(true);
    };

    const handlePopupClose = () => {
        setIsPopupOpen(false);
    };

    return (
        <Wrapper>
            {isLoading ? (
                <SkeletonWrapper>
                    <Skeleton height={300} />
                    <Skeleton count={5} height={50} />
                </SkeletonWrapper>
            ) : (
                <>
                    <MapContainer>
                        <Map />
                    </MapContainer>
                    <ContentWrapper>
                        <ActionItems>
                            <Header style={{ backgroundColor: '#1a1a2e' }}>
                            <Image src='https://moonride-media.s3.amazonaws.com/moon-ride.png' alt="MoonRides Logo" height={80} width={80} />
                                <OnlineToggle /> {/* Add the OnlineToggle here */}
                                <Profile>
                                    <Name>{user && user.name}</Name>
                                    <UserImage
                                        src={user && user.photoUrl}
                                        onClick={handleSignOut}
                                    />
                                </Profile>
                            </Header>
                             
                            <ActionButtons>
                                <ActionButton onClick={handlePopupOpen}>
                                    <ActionButtonImage src='https://moonride-media.s3.amazonaws.com/dashboard.png' />
                                    <Label>Dashboard</Label>
                                </ActionButton>
                            
                                <ActionButton onClick={handlePopupOpen}>
                                    <ActionButtonImage src='https://moonride-media.s3.amazonaws.com/earnings.png' />
                                    <Label>Earnings</Label>
                                </ActionButton>
                                <ActionButton onClick={handlePopupOpen}>
                                    <ActionButtonImage src='https://moonride-media.s3.amazonaws.com/settings.png' />
                                    <Label>Settings</Label>
                                </ActionButton>
                                
                            </ActionButtons>
                            <RecentTrips user={user} />
                        </ActionItems>
                    </ContentWrapper>
                    {isPopupOpen && (
                        <PopupOverlay>
                            <PopupCard>
                                <PopupTitle>Coming Soon</PopupTitle>
                                <PopupContent>We’re working hard to bring you this feature. Stay tuned for updates!</PopupContent>
                                <CloseButton onClick={handlePopupClose}>Close</CloseButton>
                            </PopupCard>
                        </PopupOverlay>
                    )}
                </>
            )}
        </Wrapper>
    );
}

const Wrapper = tw.div`
    flex flex-col h-screen
    bg-gradient-to-b from-[#0f0f3f] to-[#0a0a1a]
`;

const SkeletonWrapper = tw.div`
    flex flex-col items-center justify-center h-full
`;

const MapContainer = tw.div`
    flex-none h-[150px] w-full // Ensure the map takes at least 150px height
`;

const ContentWrapper = tw.div`
    flex-1 overflow-y-auto // Ensure the remaining content can scroll if needed
`;

const ActionItems = tw.div`
    flex-1 p-4
`;

const Header = tw.div`
    flex justify-between items-center p-4
    rounded-lg
`;

const Profile = tw.div`
    flex justify-between items-center
`;

const Name = tw.div`
    flex-shrink-0
    mr-4 text-sm text-gray-300 font-medium
    max-w-[calc(100%-3rem)]  // Adjust based on UserImage size and margin
    overflow-hidden text-ellipsis whitespace-nowrap
`;

const UserImage = tw.img`
    h-12 w-12 rounded-full border border-gray-200 p-px object-cover cursor-pointer
`;

const ActionButtons = tw.div`
    flex overflow-x-auto no-scrollbar whitespace-nowrap
    space-x-1.5 mt-2
`;

const ActionButton = tw.button`
    relative flex flex-col items-center justify-center bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-lg p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
    flex-none w-32 h-32 max-w-xs overflow-hidden
`;

const ActionButtonImage = tw.img`
    h-20 w-20 object-cover mb-4 z-8
`;

const Badge = tw.div`
    absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full
`;

const Label = tw.div`
    absolute bottom-2 text-base text-white z-20
`;

const PopupOverlay = tw.div`
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20
`;

const PopupCard = tw.div`
    bg-white rounded-lg shadow-lg p-6 w-80 max-w-full text-center
`;

const PopupTitle = tw.h2`
    text-xl font-bold mb-4
`;

const PopupContent = tw.p`
    text-gray-700 mb-6
`;

const CloseButton = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-2 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-gray-500
    w-full max-w-xs
`;
