const initialState = {
    pickup: null,
    dropoff: null,
    user: null,
    messages: [],
    loading: true,
};

const trackingReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_TRACKING_DETAILS':
            return {
                ...state,
                pickup: action.payload.pickup,
                dropoff: action.payload.dropoff,
                user: action.payload.user,
                loading: false,
            };
        case 'UPDATE_MESSAGES':
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        default:
            return state;
    }
};

export default trackingReducer;
