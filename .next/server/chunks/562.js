"use strict";
exports.id = 562;
exports.ids = [562];
exports.modules = {

/***/ 3562:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4191);
/* harmony import */ var tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_image__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5675);



const recentTrips = [
    {
        id: 1,
        pickup: 'Mzinti',
        dropoff: 'Malelane',
        price: 'R200.00',
        time: '30 mins',
        rating: 4.5,
        driverProfile: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
        id: 2,
        pickup: 'Nelspruit',
        dropoff: 'White River',
        price: 'R150.00',
        time: '20 mins',
        rating: 4,
        driverProfile: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
];
function RecentTrips() {
    return(/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(RecentTripsWrapper, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Title, {
                children: "Recent Trips"
            }),
            recentTrips.map((trip)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(TripCard, {
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(TripDetails, {
                            children: [
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Detail, {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Label, {
                                            children: "Pickup:"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Value, {
                                            children: trip.pickup
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Detail, {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Label, {
                                            children: "Dropoff:"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Value, {
                                            children: trip.dropoff
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Detail, {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Label, {
                                            children: "Price:"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Value, {
                                            children: trip.price
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Detail, {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Label, {
                                            children: "Time:"
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Value, {
                                            children: trip.time
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Detail, {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Label, {
                                            children: "Rating:"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(Value, {
                                            children: [
                                                trip.rating,
                                                " ★"
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(DriverProfile, {
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(next_image__WEBPACK_IMPORTED_MODULE_2__["default"], {
                                src: trip.driverProfile,
                                alt: "Driver",
                                width: 50,
                                height: 50,
                                className: "rounded-full"
                            })
                        })
                    ]
                }, trip.id)
            )
        ]
    }));
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RecentTrips);
const RecentTripsWrapper = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().div)`
    flex flex-col space-y-2 p-4 // Reduced space between items
`;
const Title = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().h2)`
    text-xl font-bold mb-2 // Reduced margin-bottom
`;
const TripCard = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().div)`
    flex items-center bg-white shadow-md rounded-lg p-3 // Reduced padding
`;
const TripDetails = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().div)`
    flex-1
`;
const Detail = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().div)`
    flex justify-between py-1
`;
const Label = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().span)`
    font-medium text-gray-600
`;
const Value = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().span)`
    text-gray-800
`;
const DriverProfile = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_1___default().div)`
    ml-4
`;


/***/ })

};
;