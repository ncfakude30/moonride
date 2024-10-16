import React, { useState } from 'react';
import tw from 'tailwind-styled-components';

const OnlineToggle = () => {
    const [isOnline, setIsOnline] = useState(false);

    const toggleOnlineStatus = () => {
        setIsOnline((prev) => !prev);
        // You can add logic here to update the user's status in your database
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

export default OnlineToggle;
