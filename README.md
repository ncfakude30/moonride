# MoonRide

<div align="center">
    <img src="https://github.com/user-attachments/assets/a0610813-de9f-49d2-ab67-ea331ef9680b" alt="MoonRide Logo" width="500" height="auto" />
</div>


**MoonRide** is an advanced ride-sharing application designed to connect users with drivers seamlessly. It includes real-time tracking, secure QR code verification, and integrated map services for accurate navigation. This project leverages modern technologies including NestJS, DynamoDB, API Gateway, and AWS Lambda to deliver a robust and scalable solution.

## Features

- **Real-Time Tracking:** View driver locations and track rides in real-time using integrated map services.
- **QR Code Verification:** Secure ride confirmations through unique QR codes.
- **Ride Booking:** Smooth process for booking rides, fare estimation, and driver assignments.
- **Cross-Platform Support:** Web app with React.js and Next.js, mobile app with React Native.

## Technology Stack

- **Frontend:**
  - **React.js:** For the web application
  - **React Native:** For the mobile application
  - **Next.js:** For server-side rendering and API routes

- **Backend:**
  - **NestJS:** Framework for building efficient, scalable Node.js server-side applications
  - **DynamoDB:** NoSQL database service for flexible and scalable data storage
  - **API Gateway:** Managed service for creating, publishing, and managing APIs
  - **AWS Lambda:** Serverless compute service for running backend code in response to events

- **Maps Integration:**
  - **Google Maps API** or **Mapbox** for real-time map services and location tracking

- **Real-Time Communication:**
  - **AWS API Gateway WebSocket** for real-time updates

- **QR Code Functionality:**
  - **QR Code Generation Library:** For creating unique QR codes
  - **QR Code Scanning:** Integrated in the mobile app for ride verification

- **Authentication:**
  - **JWT:** For user and driver authentication
  - **OAuth:** For social logins (Google, Facebook, Apple)

- **Payment Gateway:**
  - **Stripe** or **PayPal** for handling transactions

## Setup

### Prerequisites

- Node.js (>= 14.x)
- AWS CLI
- AWS Account

### Frontend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/moonride.git
    cd moonride
    ```

2. Navigate to the `frontend` directory and install dependencies:
    ```bash
    cd frontend
    npm install
    ```

3. Start the React.js or React Native application:
    ```bash
    npm start
    ```

### Backend Setup

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables for AWS:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_REGION`
    - `DYNAMODB_TABLE_NAME`

4. Deploy the backend to AWS Lambda using the AWS CLI:
    ```bash
    npm run deploy
    ```

5. Set up API Gateway to connect with Lambda functions.

### Running Locally

1. Start the NestJS server:
    ```bash
    npm run start
    ```

2. Ensure that DynamoDB local is running for local testing.

## Deployment

1. **Frontend Deployment:**
   - Deploy the React.js application using Vercel or Netlify.
   - Prepare the mobile app for submission to the Google Play Store and Apple App Store.

2. **Backend Deployment:**
   - Deploy Lambda functions via the AWS Management Console or AWS CLI.
   - Configure API Gateway to route requests to Lambda functions.

## Testing

- **Frontend:** Use Jest and React Testing Library for unit and integration tests.
- **Backend:** Use Jest and Supertest for unit and integration tests of NestJS services and controllers.

## Contributing

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature/your-feature
    ```
3. Make your changes.
4. Commit your changes:
    ```bash
    git commit -am 'Add some feature'
    ```
5. Push to the branch:
    ```bash
    git push origin feature/your-feature
    ```
6. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [NestJS](https://nestjs.com/)
- [DynamoDB](https://aws.amazon.com/dynamodb/)
- [API Gateway](https://aws.amazon.com/api-gateway/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [React.js](https://reactjs.org/)
- [React Native](https://reactnative.dev/)
- [Google Maps API](https://developers.google.com/maps)
- [Mapbox](https://www.mapbox.com/)
- [Stripe](https://stripe.com/)
- [PayPal](https://www.paypal.com/)

For any questions or issues, please open an issue or contact us at [your-email@example.com].
