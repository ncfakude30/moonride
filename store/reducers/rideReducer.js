import { SET_SELECTED_CAR, SET_CURRENCY } from '../actions/rideActions';

const initialState = {
    selectedCar: null,
    currency: 'ZAR',
};

const rideReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SELECTED_CAR:
            return {
                ...state,
                selectedCar: action.payload,
            };
        case SET_CURRENCY:
            return {
                ...state,
                currency: action.payload,
            };
        default:
            return state;
    }
};

export default rideReducer;
