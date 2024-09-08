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
                                <TripDetails>
                                    <Detail>
                                        <Label>Pickup:</Label>
                                        <Value>{trip?.pickupName || trip?.pickup}</Value>
                                    </Detail>
                                    <Detail>
                                        <Label>Dropoff:</Label>
                                        <Value>{trip?.dropoffName || trip?.dropoff}</Value>
                                    </Detail>
                                    <Detail>
                                        <Label>Price:</Label>
                                        <Value>R{trip?.price}</Value>
                                    </Detail>
                                </TripDetails>
                                <DriverProfile>
                                    <Image
                                        src={trip.driverProfile || 'https://randomuser.me/api/portraits/med/women/1.jpg'}
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

export default RecentTrips;

const RecentTripsWrapper = tw.div`
    flex flex-col space-y-4 p-4
`;

const Title = tw.h2`
    text-2xl font-bold mb-4 text-gray-800
`;

const TripCard = tw.div`
    flex items-center bg-gray-200 shadow-lg rounded-lg p-4 relative transition-transform transform hover:scale-105 cursor-pointer
`;

const StatusBadge = tw.div`
    absolute top-2 left-2 px-3 py-1 text-white text-xs font-semibold rounded-full
    ${props => props.status === 'complete' && 'bg-green-500'}
    ${props => props.status === 'cancelled' && 'bg-blue-500'}
    ${props => props.status === 'failed' && 'bg-red-500'}
`;

const NotificationWrapper = tw.div`
    absolute top-2 right-2 flex items-center space-x-2
`;

const NotificationLabel = tw.span`
    text-sm font-medium text-gray-700
`;

const NotificationBadge = tw.div`
    w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full
`;

const TripDetails = tw.div`
    flex-1 pr-16 pt-4
`;

const Detail = tw.div`
    flex justify-between py-2
`;

const Label = tw.span`
    font-medium text-gray-600
`;

const Value = tw.span`
    text-gray-800
`;

const DriverProfile = tw.div`
    flex-shrink-0 absolute right-4 top-1/2 transform -translate-y-1/2
`;

const LoadingMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const NoTripsMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const LoadMoreButton = tw.button`
    mt-4 bg-blue-600 text-white rounded-lg p-3 font-semibold shadow-lg hover:bg-blue-700 transition-colors
`;
