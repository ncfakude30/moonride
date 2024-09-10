export const SET_SELECTED_CAR = 'SET_SELECTED_CAR';
export const SET_CURRENCY = 'SET_CURRENCY';

export const setSelectedCar = (car) => ({
    type: SET_SELECTED_CAR,
    payload: car,
});

export const setCurrency = (currency) => ({
    type: SET_CURRENCY,
    payload: currency,
});
