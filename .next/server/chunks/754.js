"use strict";
exports.id = 754;
exports.ids = [754];
exports.modules = {

/***/ 3452:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({"src":"/_next/static/media/moon-ride.4ede293a.png","height":500,"width":500,"blurDataURL":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAA0UlEQVR42mMAgf//HzFC6P9MDFCw4dJVRjDj1+9HzBDJt/bHr104UD53w9mSScu8GICgds0usBxY5cvXVy7nbz/4P3Pfmf9VB8/dZfj/H2LCyTMbwca+eXNt39yV8/6vPbzj/65bF48zIIP///+zHb16Uf/y1ROTHzy8OPXe/Utm75Hcw/Dz10vNf/8/uP3//1/9//9fZv//f/P4//+/DAM6uP74XuqmC9d9WRgYBHomzwyFS3z88RbsoGfvXqo8+/JJkYGBgbV/xjzNeet2MgEAMglttyS+JlEAAAAASUVORK5CYII="});

/***/ }),

/***/ 2356:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__) => {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ap": () => (/* binding */ provider),
/* harmony export */   "I8": () => (/* binding */ auth)
/* harmony export */ });
/* unused harmony export app */
/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3745);
/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(401);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_app__WEBPACK_IMPORTED_MODULE_0__]);
([firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_app__WEBPACK_IMPORTED_MODULE_0__] = __webpack_async_dependencies__.then ? await __webpack_async_dependencies__ : __webpack_async_dependencies__);


const firebaseConfig = {
    apiKey: "AIzaSyDqEZ8XQh8W1UNMxYmV8ckUfHYvJp2ge1k",
    authDomain: "uber-clone-ddb16.firebaseapp.com",
    projectId: "uber-clone-ddb16",
    storageBucket: "uber-clone-ddb16.appspot.com",
    messagingSenderId: "1062829683379",
    appId: "1:1062829683379:web:3057427abacc8c0f9ab6c6"
};
// Initialize Firebase
const app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);
const provider = new firebase_auth__WEBPACK_IMPORTED_MODULE_1__.GoogleAuthProvider();
const auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)();


});

/***/ })

};
;