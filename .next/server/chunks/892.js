"use strict";
exports.id = 892;
exports.ids = [892];
exports.modules = {

/***/ 9892:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ components_RideSelector)
});

// EXTERNAL MODULE: external "react/jsx-runtime"
var jsx_runtime_ = __webpack_require__(997);
// EXTERNAL MODULE: external "react"
var external_react_ = __webpack_require__(6689);
// EXTERNAL MODULE: external "tailwind-styled-components"
var external_tailwind_styled_components_ = __webpack_require__(4191);
var external_tailwind_styled_components_default = /*#__PURE__*/__webpack_require__.n(external_tailwind_styled_components_);
;// CONCATENATED MODULE: ./data/carList.js
const carList = [
    {
        imgUrl: 'https://i.ibb.co/cyvcpfF/uberx.png',
        service: 'UberX',
        multiplier: 1
    },
    {
        imgUrl: 'https://i.ibb.co/YDYMKny/uberxl.png',
        service: 'UberXL',
        multiplier: 1.5
    },
    {
        imgUrl: 'https://i.ibb.co/Xx4G91m/uberblack.png',
        service: 'Black',
        multiplier: 2
    },
    {
        imgUrl: 'https://i.ibb.co/cyvcpfF/uberx.png',
        service: 'Comfort',
        multiplier: 1.2
    },
    {
        imgUrl: ' https://i.ibb.co/1nStPWT/uberblacksuv.png',
        service: 'Black SUV',
        multiplier: 2.8
    }
];

;// CONCATENATED MODULE: ./pages/components/RideSelector.js




const countryToCurrency = {
    'ZA': 'ZAR',
    'US': 'USD'
};
const getCurrencyCode = (countryCode)=>{
    return countryToCurrency[countryCode] || 'USD'; // Default to USD if not found
};
const getUserCountryCode = async ()=>{
    try {
        const response = await fetch('https://ipapi.co/country_code/');
        const countryCode = await response.text();
        return countryCode;
    } catch (error) {
        console.error('Error fetching country code:', error);
        return 'US'; // Default to US in case of an error
    }
};
function RideSelector({ pickupCoordinates , dropoffCoordinates , onSelectRide  }) {
    const { 0: rideDuration , 1: setRideDuration  } = (0,external_react_.useState)(0);
    const { 0: selectedCar , 1: setSelectedCar  } = (0,external_react_.useState)(null);
    const { 0: currency , 1: setCurrency  } = (0,external_react_.useState)('USD');
    (0,external_react_.useEffect)(()=>{
        const fetchData = async ()=>{
            const countryCode = await getUserCountryCode();
            setCurrency(getCurrencyCode(countryCode));
        };
        fetchData();
    }, []);
    (0,external_react_.useEffect)(()=>{
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates[0]},${pickupCoordinates[1]};${dropoffCoordinates[0]},${dropoffCoordinates[1]}?access_token=pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ`).then((res)=>{
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        }).then((data)=>{
            if (data.routes && data.routes.length > 0) {
                var ref;
                setRideDuration(((ref = data.routes[0]) === null || ref === void 0 ? void 0 : ref.duration) / 60); // Convert duration from seconds to minutes
            }
        }).catch((err)=>console.error('Fetch error:', err)
        );
    }, [
        pickupCoordinates,
        dropoffCoordinates
    ]);
    const handleCarClick = (car)=>{
        setSelectedCar(car);
        onSelectRide(car); // Notify parent component about the selected car
    };
    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)(Wrapper, {
        children: [
            /*#__PURE__*/ jsx_runtime_.jsx(Title, {
                children: "Choose a ride, or swipe up for more"
            }),
            /*#__PURE__*/ jsx_runtime_.jsx(CarList, {
                children: carList.map((car, index)=>{
                    return(/*#__PURE__*/ (0,jsx_runtime_.jsxs)(Car, {
                        onClick: ()=>handleCarClick(car)
                        ,
                        isSelected: (selectedCar === null || selectedCar === void 0 ? void 0 : selectedCar.service) === car.service,
                        children: [
                            /*#__PURE__*/ jsx_runtime_.jsx(CarImage, {
                                src: car.imgUrl
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)(CarDetails, {
                                children: [
                                    /*#__PURE__*/ jsx_runtime_.jsx(Service, {
                                        children: car.service
                                    }),
                                    /*#__PURE__*/ jsx_runtime_.jsx(Time, {
                                        children: "5 min away"
                                    })
                                ]
                            }),
                            /*#__PURE__*/ (0,jsx_runtime_.jsxs)(Price, {
                                children: [
                                    currency === 'ZAR' ? 'R' : 'R',
                                    (rideDuration * car.multiplier).toFixed(2)
                                ]
                            })
                        ]
                    }, index));
                })
            })
        ]
    }));
}
/* harmony default export */ const components_RideSelector = (RideSelector);
const Wrapper = (external_tailwind_styled_components_default()).div`
    flex-1 overflow-y-scroll flex flex-col
`;
const Title = (external_tailwind_styled_components_default()).div`
    text-gray-500 text-center text-xs py-2 border-b
`;
const CarList = (external_tailwind_styled_components_default()).div`
    overflow-y-scroll
`;
const Car = (external_tailwind_styled_components_default()).div`
    flex p-4 items-center cursor-pointer
    ${(props)=>props.isSelected && (external_tailwind_styled_components_default())`bg-gray-200 border-2 border-blue-500`
}
`;
const CarImage = (external_tailwind_styled_components_default()).img`
    h-14 mr-4
`;
const CarDetails = (external_tailwind_styled_components_default()).div`
    flex-1
`;
const Service = (external_tailwind_styled_components_default()).div`
    font-medium
`;
const Time = (external_tailwind_styled_components_default()).div`
    text-xs text-blue-500
`;
const Price = (external_tailwind_styled_components_default()).div`
    text-sm
`;


/***/ })

};
;