import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import DriverDashboard from '../components/DriverDashboard';

function DriverDashboardPage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Check if user is a driver
        if (user.role !== 'driver') {
            router.push('/');
            return;
        }
    }, [user, router]);

    if (!user || user.role !== 'driver') {
        return (
            <LoadingWrapper>
                <LoadingSpinner />
                <LoadingText>Loading dashboard...</LoadingText>
            </LoadingWrapper>
        );
    }

    return (
        <Wrapper>
            <DriverDashboard user={user} />
        </Wrapper>
    );
}

export default DriverDashboardPage;

const Wrapper = tw.div`
    min-h-screen bg-gray-100
`;

const LoadingWrapper = tw.div`
    min-h-screen bg-gray-100 flex flex-col items-center justify-center
`;

const LoadingSpinner = tw.div`
    w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin
`;

const LoadingText = tw.p`
    mt-4 text-gray-600
`;