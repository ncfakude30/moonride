// Action Types
export const SET_PICKUP = 'SET_PICKUP';
export const SET_DROPOFF = 'SET_DROPOFF';

// Action Creators
export const setPickup = (pickup) => ({
    type: SET_PICKUP,
    payload: pickup,
});

export const setDropoff = (dropoff) => ({
    type: SET_DROPOFF,
    payload: dropoff,
});
