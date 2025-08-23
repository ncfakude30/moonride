import { useState } from 'react';
import tw from 'tailwind-styled-components';
import Image from 'next/image';

const TripSummary = ({ trip, onRate, onTipDriver }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [selectedTip, setSelectedTip] = useState(0);
    const [customTip, setCustomTip] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tipOptions = [10, 20, 50, 100];

    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    const handleTipSelect = (amount) => {
        setSelectedTip(amount);
        setCustomTip('');
    };

    const handleCustomTipChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setCustomTip(value);
            setSelectedTip(0);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please provide a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit rating
            await onRate({
                tripId: trip.id,
                rating,
                feedback,
                driverId: trip.driverInfo?.id
            });

            // Process tip if selected
            const tipAmount = customTip ? parseInt(customTip) : selectedTip;
            if (tipAmount > 0 && onTipDriver) {
                await onTipDriver(tipAmount);
            }

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SummaryContainer>
            <Header>
                <CompletionIcon>✅</CompletionIcon>
                <Title>Trip Completed!</Title>
                <Subtitle>Thank you for riding with MoonRide</Subtitle>
            </Header>

            <TripDetails>
                <DetailRow>
                    <DetailLabel>From:</DetailLabel>
                    <DetailValue>{trip.pickup}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>To:</DetailLabel>
                    <DetailValue>{trip.dropoff}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>Distance:</DetailLabel>
                    <DetailValue>{trip.distance || '12.5 km'}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>Duration:</DetailLabel>
                    <DetailValue>{trip.duration || '25 min'}</DetailValue>
                </DetailRow>
                <DetailRow>
                    <DetailLabel>Fare:</DetailLabel>
                    <DetailValue>R{trip.price}</DetailValue>
                </DetailRow>
            </TripDetails>

            {trip.driverInfo && (
                <DriverSection>
                    <DriverImage
                        src={trip.driverInfo.profilePicture || trip.driverProfile || 'https://moonride-media.s3.amazonaws.com/default.png'}
                        alt="Driver"
                        width={60}
                        height={60}
                    />
                    <DriverInfo>
                        <DriverName>{trip.driverInfo.name || trip.driverName || 'Your Driver'}</DriverName>
                        <DriverRating>⭐ {trip.driverInfo.rating || '4.8'}</DriverRating>
                    </DriverInfo>
                </DriverSection>
            )}

            <RatingSection>
                <RatingTitle>How was your ride?</RatingTitle>
                <StarContainer>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            $filled={star <= rating}
                            onClick={() => handleStarClick(star)}
                        >
                            ⭐
                        </Star>
                    ))}
                </StarContainer>
                <FeedbackInput
                    placeholder="Share your feedback (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                />
            </RatingSection>

            <TipSection>
                <TipTitle>Add a tip for your driver</TipTitle>
                <TipOptions>
                    {tipOptions.map((amount) => (
                        <TipButton
                            key={amount}
                            $selected={selectedTip === amount}
                            onClick={() => handleTipSelect(amount)}
                        >
                            R{amount}
                        </TipButton>
                    ))}
                </TipOptions>
                <CustomTipContainer>
                    <CustomTipInput
                        placeholder="Custom amount"
                        value={customTip}
                        onChange={handleCustomTipChange}
                    />
                </CustomTipContainer>
            </TipSection>

            <SubmitButton
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </SubmitButton>
        </SummaryContainer>
    );
};

export default TripSummary;

const SummaryContainer = tw.div`
    min-h-screen bg-gray-100 p-6 flex flex-col justify-center max-w-md mx-auto
`;

const Header = tw.div`
    text-center mb-8
`;

const CompletionIcon = tw.div`
    text-6xl mb-4
`;

const Title = tw.h1`
    text-2xl font-bold text-gray-800 mb-2
`;

const Subtitle = tw.p`
    text-gray-600
`;

const TripDetails = tw.div`
    bg-white rounded-lg p-4 mb-6 shadow-sm
`;

const DetailRow = tw.div`
    flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0
`;

const DetailLabel = tw.span`
    text-gray-600 font-medium
`;

const DetailValue = tw.span`
    text-gray-800 font-semibold
`;

const DriverSection = tw.div`
    bg-white rounded-lg p-4 mb-6 shadow-sm flex items-center space-x-4
`;

const DriverImage = tw(Image)`
    rounded-full
`;

const DriverInfo = tw.div`
    flex-1
`;

const DriverName = tw.h3`
    font-semibold text-gray-800
`;

const DriverRating = tw.p`
    text-yellow-500 text-sm
`;

const RatingSection = tw.div`
    bg-white rounded-lg p-4 mb-6 shadow-sm
`;

const RatingTitle = tw.h3`
    font-semibold text-gray-800 mb-4 text-center
`;

const StarContainer = tw.div`
    flex justify-center space-x-2 mb-4
`;

const Star = tw.button`
    text-2xl transition-all duration-200
    ${props => props.$filled ? 'opacity-100 scale-110' : 'opacity-30 hover:opacity-60'}
`;

const FeedbackInput = tw.textarea`
    w-full p-3 border border-gray-300 rounded-lg resize-none
    focus:outline-none focus:ring-2 focus:ring-blue-500
`;

const TipSection = tw.div`
    bg-white rounded-lg p-4 mb-6 shadow-sm
`;

const TipTitle = tw.h3`
    font-semibold text-gray-800 mb-4 text-center
`;

const TipOptions = tw.div`
    grid grid-cols-4 gap-2 mb-4
`;

const TipButton = tw.button`
    py-2 px-4 rounded-lg border-2 font-semibold transition-colors
    ${props => props.$selected 
        ? 'border-blue-500 bg-blue-500 text-white' 
        : 'border-gray-300 text-gray-700 hover:border-blue-300'
    }
`;

const CustomTipContainer = tw.div`
    flex justify-center
`;

const CustomTipInput = tw.input`
    w-32 p-2 border border-gray-300 rounded-lg text-center
    focus:outline-none focus:ring-2 focus:ring-blue-500
`;

const SubmitButton = tw.button`
    w-full py-4 bg-blue-500 text-white rounded-lg font-semibold text-lg
    hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
`;