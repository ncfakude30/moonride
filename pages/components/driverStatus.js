import React, { useState, useEffect } from 'react';
import tw from 'tailwind-styled-components';
import { setDriverStatus,  } from '../../store/reducers/driverReducer'; // Adjust the import path as needed
import { useSelector, useDispatch } from 'react-redux';
import { getUser } from '../api/api.service';

const OnlineToggle = () => {
    const dispatch = useDispatch();
    const { online } = useSelector((state) => state.driver); // Get the online status from Redux
    const user = useSelector((state) => state.auth.user);
    const [isOnline, setIsOnline] = useState(online); // Set initial state

    // Fetch the driver's current status from the database on component mount
    useEffect(() => {
        if(!user) {
            console.log(`user is required`);
            return;
        }
        
        const fetchStatus = async () => {
            try {
                const user = await getUser(user?.id); // Fetch initial status from API or Redux
                console.log(user);
                setIsOnline(user?.status && user?.role?.toLowerCase() === 'driver'); // Update the state based on the fetched status
            } catch (error) {
                console.error('Error fetching driver status:', error);
            }
        };
        fetchStatus();
    }, [dispatch, user]);

    // Toggle the driver's online/offline status
    const toggleOnlineStatus = async () => {
        const newStatus = !isOnline; // Flip the current status
        setIsOnline(newStatus); // Update the state immediately for UI feedback
        try {
            // Dispatch the action to update the status in Redux and database
            dispatch(setDriverStatus(newStatus)); 
            console.log('Driver status updated successfully');
        } catch (error) {
            console.error('Failed to update driver status:', error);
        }
    };

    return (
        <RoleToggle onClick={toggleOnlineStatus}>
            <ToggleLabel isOnline={isOnline}>
                <ToggleCircle isOnline={isOnline} />
            </ToggleLabel>
            <ToggleText isOnline={isOnline}>
                {isOnline ? 'Online' : 'Offline'}
            </ToggleText>
        </RoleToggle>
    );
};

export default OnlineToggle;

const RoleToggle = tw.div`
  bg-gradient-to-r from-gray-600 to-gray-400 text-white text-center rounded-full p-2 font-semibold shadow-lg
  my-2 relative flex items-center cursor-pointer
`;

const ToggleLabel = tw.label`
  relative flex items-center h-10 w-16 rounded-full p-1 transition-colors
  ${(props) => (props.isOnline ? 'bg-green-500' : 'bg-gradient-to-r from-gray-600 to-gray-400')}
`;

const ToggleCircle = tw.div`
  bg-white h-8 w-8 rounded-full shadow-md transform transition-transform
  ${(props) => (props.isOnline ? 'translate-x-6' : 'translate-x-0')}
`;

const ToggleText = tw.span`
  ml-2 text-base
`;


