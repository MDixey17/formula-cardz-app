# Formula Cardz Mobile App 📱

The **Formula Cardz App** provides the user interface for iOS devices to interact with the ecosystem, getting collection data, card information, and 1/1 statuses.

---

## 📑 Table of Contents
- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deploying](#-deploying)
- [Project Structure](#-project-structure)
- [Related Projects](#-related-projects)
- [Acknowledgements](#-acknowledgments)

---

## 📖 About

Formula Cardz is a platform for Formula 1 trading card collectors to track market values, rare discoveries, and personal collections. The core feature that makes Formula Cardz so unique is the 1/1 tracker that is automatically updated weekly by scraping data from popular graders such as PSA and BGS. There is also support for system administrators to update asynchronously to provide a live tracking experience.

---

## ✨ Features

- **Account Creation**: Secure account creation with password reset functionality
- **Cards**: Comprehensive card data model and search capabilities
- **Collections**: Track owned cards and their details
- **Card Drops**: Upcoming product releases
- **One of One Tracking**: Track which 1/1s have been found in various sets
- **Themes:** Support for dark and light theme

---

## 🛠 Tech Stack

- **Frontend:** React Native, Expo, TypeScript
- **Data Storage:** AsyncStorage
- **Deployment:** Apple App Store

---

## 🚀 Getting Started

```bash
git clone https://github.com/MDixey17/formula-cardz-app.git
cd formula-cardz-app
npm install
npm run dev
```
---

## ☁️ Deploying

Make sure everything looks good on your local machine before deploying. This is using the free tier with Expo to deploy to the App Store so be careful with how often deployments are done.

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 📂 Project Structure

```plaintext
formula-cardz-app/
|── app/
|   |── (tabs)/     # Tab routing for different screens in the app
|── assets/         # Images and digital assets used in the app
|── components/     # Custom React Native components used throughout the app
|── contexts/       # Custom contexts used for user authentication and theming throughout the app
|── hooks/          # Custom React hooks used throughout the app
|── services/       # Interface to make all the API calls done in the app
|── types/          # Custom type definitions used throughout the app, primarily with expected API responses
|── app.json
|── eas.json
|── expo-env.d.ts
|── package.json
|── README.md
|── tsconfig.json
```

---

## 🌍 Related Projects

- [formula-cardz-api](https://github.com/MDixey17/formula-cardz-api)
- [formula-cardz-schedulers](https://github.com/MDixey17/formula-cardz-schedulers)
- [formula-cardz-ui](https://github.com/MDixey17/formula-cardz-ui)

---

## 🙏 Acknowledgments

- Special thanks to [justaninchident_cards](https://www.instagram.com/justaninchident_cards), [kceecards](https://www.instagram.com/kceecards), and [GridCardsUK](https://www.instagram.com/gridcardsuk) for providing 1/1 status data.
