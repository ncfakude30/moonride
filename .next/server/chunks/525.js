"use strict";
exports.id = 525;
exports.ids = [525];
exports.modules = {

/***/ 3525:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Map": () => (/* binding */ Map),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var tailwind_styled_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4191);
/* harmony import */ var tailwind_styled_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(tailwind_styled_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _mapbox_gl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6158);
/* harmony import */ var _mapbox_gl__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_mapbox_gl__WEBPACK_IMPORTED_MODULE_3__);




(_mapbox_gl__WEBPACK_IMPORTED_MODULE_3___default().accessToken) = 'pk.eyJ1IjoibmNmY29ycCIsImEiOiJjbTBpY3Z6YnAwN240MmxzOXV2dnNzNzEwIn0.oVdWZdXHm_FMRDU2s4mAxQ';
const Map = (props)=>{
    const { 0: userLocation , 1: setUserLocation  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        // Function to get user's location
        const getUserLocation = ()=>{
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position)=>{
                    setUserLocation([
                        position.coords.longitude,
                        position.coords.latitude
                    ]);
                }, (error)=>{
                    console.error('Error getting user location:', error);
                    // Fallback to default location (e.g., United States)
                    setUserLocation([
                        -99.29011,
                        39.39172
                    ]);
                });
            } else {
                console.error('Geolocation is not supported by this browser.');
                // Fallback to default location (e.g., United States)
                setUserLocation([
                    -99.29011,
                    39.39172
                ]);
            }
        };
        getUserLocation();
    }, []);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (userLocation) {
            const map = new (_mapbox_gl__WEBPACK_IMPORTED_MODULE_3___default().Map)({
                container: 'map',
                style: 'mapbox://styles/drakosi/ckvcwq3rwdw4314o3i2ho8tph',
                center: userLocation,
                zoom: 12
            });
            if (props.pickupCoordinates) {
                addToMap(map, props.pickupCoordinates);
            }
            ;
            if (props.dropoffCoordinates) {
                addToMap(map, props.dropoffCoordinates);
            }
            ;
            if (props.pickupCoordinates && props.dropoffCoordinates) {
                map.fitBounds([
                    props.pickupCoordinates,
                    props.dropoffCoordinates
                ], {
                    padding: 60
                });
            }
            ;
        }
    }, [
        userLocation,
        props.pickupCoordinates,
        props.dropoffCoordinates
    ]);
    const addToMap = (map, coordinates)=>{
        new (_mapbox_gl__WEBPACK_IMPORTED_MODULE_3___default().Marker)().setLngLat(coordinates).addTo(map);
    };
    return(/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Wrapper, {
        id: "map"
    }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Map);
const Wrapper = (tailwind_styled_components__WEBPACK_IMPORTED_MODULE_2___default().div)`
    flex-1 h-1/2
`;


/***/ })

};
;