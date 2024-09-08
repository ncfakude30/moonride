import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import Image from 'next/image';
import { fetchRecentTrips } from '../api/app.service';
import Link from 'next/link';

function RecentTrips({ user }) {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [hasNotifications, setHasNotifications] = useState(true);

    const loadTrips = async (append = false) => {
        if (user) {
            try {
                setLoading(true);
                const fetchedTrips = await fetchRecentTrips(user?.id, lastEvaluatedKey);
                if (fetchedTrips.trips.length > 0) {
                    setTrips(prevTrips => append ? [...prevTrips, ...fetchedTrips.trips] : fetchedTrips.trips);
                }
                setLastEvaluatedKey(fetchedTrips.lastEvaluatedKey || null);
                setHasMore(!!fetchedTrips.lastEvaluatedKey);
            } catch (e) {
                setError('Failed to load trips');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, [user]);

    if (loading && trips.length === 0) {
        return <LoadingMessage>Loading trips...</LoadingMessage>;
    }

    return (
        <RecentTripsWrapper>
            <Title>Recent Trips</Title>
            {trips.length === 0 ? (
                <NoTripsMessage>Request a trip to see your recent travels!</NoTripsMessage>
            ) : (
                <>
                    {trips.map(trip => (
                        <Link
                            key={trip.tripId}
                            href={{
                                pathname: '/tracking',
                                query: {
                                    pickup: trip?.pickup,
                                    dropoff: trip?.dropoff,
                                    pickupName: trip?.pickupName || trip?.pickup,
                                    dropoffName: trip?.dropoffName || trip?.dropoff,
                                    user: JSON.stringify(user),
                                }
                            }}
                            passHref
                        >
                            <TripCard>
                                <BadgeWrapper>
                                    <StatusBadge status={trip?.status || 'complete'}>
                                        {trip.status || 'Completed'}
                                    </StatusBadge>
                                    {hasNotifications && (
                                        <NotificationWrapper>
                                            <NotificationLabel>Notifications</NotificationLabel>
                                            <NotificationBadge>
                                                5
                                            </NotificationBadge>
                                        </NotificationWrapper>
                                    )}
                                </BadgeWrapper>
                                
                                <TripDetails>
                                    <Detail>
                                        <Label>Pickup:</Label>
                                        <Value>{truncateText(trip?.pickupName || trip?.pickup)}</Value>
                                    </Detail>
                                    <Detail>
                                        <Label>Dropoff:</Label>
                                        <Value>{truncateText(trip?.dropoffName || trip?.dropoff)}</Value>
                                    </Detail>
                                    <Detail>
                                        <Label>Price:</Label>
                                        <Value>R{trip?.price}</Value>
                                    </Detail>
                                </TripDetails>
                                
                                <DriverProfile>
                                    <Image
                                        src={trip.driverProfile || 'https://moonride-media.s3.amazonaws.com/moonriding.png'}
                                        alt="Driver"
                                        width={50}
                                        height={50}
                                        className="rounded-full border-2 border-gray-300"
                                    />
                                </DriverProfile>
                            </TripCard>
                        </Link>
                    ))}
                    {hasMore && (
                        <LoadMoreButton onClick={() => loadTrips(true)}>
                            Load More
                        </LoadMoreButton>
                    )}
                </>
            )}
        </RecentTripsWrapper>
    );
}

const truncateText = (text) => {
    if (!text) return '';
    return text.length > 25 ? `${text.substring(0, 23)}...` : text;
};

export default RecentTrips;

const RecentTripsWrapper = tw.div`
    flex flex-col space-y-4 p-4
`;

const Title = tw.h2`
    text-2xl font-bold mb-4 text-gray-800
`;

const TripCard = tw.div`
    flex relative bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-105 cursor-pointer
    border border-gray-200
    space-y-2
    pt-6 pb-4
    // Ensure space for driver profile
    min-h-[150px] 
    // Add padding for right alignment of driver profile
    pr-16
`;

const BadgeWrapper = tw.div`
    absolute top-4 left-2 right-2 flex justify-between items-center
`;

const StatusBadge = tw.div`
    w-20 h-6 px-2 py-1 text-white text-xs font-bold rounded-full
    flex items-center justify-center
    ${props => props.status === 'complete' && 'bg-green-500'}
    ${props => props.status === 'cancelled' && 'bg-blue-500'}
    ${props => props.status === 'failed' && 'bg-red-500'}
`;

const NotificationWrapper = tw.div`
    flex items-center space-x-1
`;

const NotificationLabel = tw.span`
    text-sm font-medium text-gray-700
`;

const NotificationBadge = tw.div`
    w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full
`;

const TripDetails = tw.div`
    flex-1 pr-4 pt-4 flex flex-col space-y-2
    mb-12
`;

const Detail = tw.div`
    flex items-center
`;

const Label = tw.span`
    font-medium text-gray-600
`;

const Value = tw.span`
    text-gray-800 ml-2
`;

const DriverProfile = tw.div`
    absolute right-4 bottom-4 flex items-center justify-center
`;

const LoadingMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const NoTripsMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const LoadMoreButton = tw.button`
    mt-4 bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
    flex items-center justify-center
    w-full
    max-w-xs
`;
