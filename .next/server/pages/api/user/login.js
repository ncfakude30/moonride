"use strict";
(() => {
var exports = {};
exports.id = 866;
exports.ids = [866];
exports.modules = {

/***/ 2437:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "POST": () => (/* binding */ POST)
});

;// CONCATENATED MODULE: external "next/server"
const server_namespaceObject = require("next/server");
;// CONCATENATED MODULE: ./pages/api/user/login.js
// pages/api/storeUser.js

async function POST(req) {
    try {
        const { email , displayName , photoURL  } = await req.json();
        // Make sure you replace YOUR_LAMBDA_ENDPOINT with your Lambda function's endpoint URL
        const lambdaEndpoint = `${process.env.API_BASE_URL}/login`;
        const response = await fetch(lambdaEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                displayName,
                photoURL
            })
        });
        if (!response.ok) {
            throw new Error('Failed to store user data');
        }
        return server_namespaceObject.NextResponse.json({
            message: 'User data stored successfully'
        });
    } catch (error) {
        return server_namespaceObject.NextResponse.json({
            error: error.message
        }, {
            status: 500
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(2437));
module.exports = __webpack_exports__;

})();