import { SET_SELECTED_CAR, SET_CURRENCY, SET_CAR_PRICE } from '../actions/rideActions';

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
        case SET_CAR_PRICE:
            return {
                ...state,
                carPrice: action.payload,
            };
        default:
            return state;
    }
};



export default rideReducer;
