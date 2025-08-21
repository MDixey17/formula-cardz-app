# formula-cardz-app
Mobile app source code for Formula Cardz

## Setup for Local Development
1. Clone the repository onto your machine
2. Run `npm install`
3. Run `npm run dev` to run the mobile app code locally to test with how it looks with a chromium based browser

## Deploying to iOS App Store
1. Make sure everything looks good on your local machine before deploying. This is using the free tier with Expo to deploy to the App Store so be careful with how often deployments are done.
2. Run `eas build --platform ios --profile production` to create the build in Expo to prepare to send to the App Store.
3. Run `eas submit --platform ios` to submit the build to the App Store.
