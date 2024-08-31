import tw from 'tailwind-styled-components';
import Image from 'next/image';

const recentTrips = [
    {
        id: 1,
        pickup: 'Mzinti',
        dropoff: 'Malelane',
        price: 'R200.00',
        time: '30 mins',
        rating: 4.5,
        driverProfile: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        id: 2,
        pickup: 'Nelspruit',
        dropoff: 'White River',
        price: 'R150.00',
        time: '20 mins',
        rating: 4.0,
        driverProfile: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    // Add more trips as needed
];

function RecentTrips() {
    return (
        <RecentTripsWrapper>
            <Title>Recent Trips</Title>
            {recentTrips.map(trip => (
                <TripCard key={trip.id}>
                    <TripDetails>
                        <Detail>
                            <Label>Pickup:</Label>
                            <Value>{trip.pickup}</Value>
                        </Detail>
                        <Detail>
                            <Label>Dropoff:</Label>
                            <Value>{trip.dropoff}</Value>
                        </Detail>
                        <Detail>
                            <Label>Price:</Label>
                            <Value>{trip.price}</Value>
                        </Detail>
                        <Detail>
                            <Label>Time:</Label>
                            <Value>{trip.time}</Value>
                        </Detail>
                        <Detail>
                            <Label>Rating:</Label>
                            <Value>{trip.rating} ★</Value>
                        </Detail>
                    </TripDetails>
                    <DriverProfile>
                        <Image src={trip.driverProfile} alt="Driver" width={50} height={50} className="rounded-full" />
                    </DriverProfile>
                </TripCard>
            ))}
        </RecentTripsWrapper>
    );
}

export default RecentTrips;

const RecentTripsWrapper = tw.div`
    flex flex-col space-y-4 p-4
`;

const Title = tw.h2`
    text-xl font-bold mb-4
`;

const TripCard = tw.div`
    flex items-center bg-white shadow-md rounded-lg p-4
`;

const TripDetails = tw.div`
    flex-1
`;

const Detail = tw.div`
    flex justify-between py-1
`;

const Label = tw.span`
    font-medium text-gray-600
`;

const Value = tw.span`
    text-gray-800
`;

const DriverProfile = tw.div`
    ml-4
`;
