# 🏡 An's Homestay

**An's Homestay** is a modern full-stack web application that allows users to effortlessly **book homestays** and enables hosts to efficiently **manage their properties**. The platform is designed to be intuitive, responsive, and scalable — built with real-world use cases in mind.

---

## ✨ Features

- 🔍 **Search & Browse**: Find homestays by location, price range, amenities, and more  
- 🛏️ **Homestay Details**: View descriptions, images, availability, and guest capacity  
- 📅 **Booking System**: Book homestays with check-in/check-out management  
- 💳 **Payment Integration**: Support for multiple payment methods (e.g. Cash, Stripe)  
- 🧑‍💼 **Host Dashboard**: Manage listings, booking requests, and guest information  
- 📊 **Analytics**: Track booking statistics and performance metrics for hosts  
- 🔐 **Authentication & Roles**: Secure login with role-based access (Admin, Host, Customer)

---

## 🚀 Tech Stack

- **Frontend**: (React / Next.js / Vue — _update this based on what you use_)  
- **Backend**: Node.js / Express / NestJS  
- **Database**: PostgreSQL / MongoDB  
- **Authentication**: JWT / OAuth  
- **Payment**: Stripe Integration  
- **Deployment**: AWS / Vercel / Docker (_customizable based on your infra_)

---

## 👤 About the Developer

This project was built with care by **An** as a passion project to explore real-world booking workflows and scalable web architecture.

---

## 📂 Project Structure

```bash
.
├── client/           # Frontend code
├── server/           # Backend API & business logic
├── prisma/           # DB schema (if using Prisma)
├── docs/             # Documentation & mockups
└── README.md

## 🛠️ Getting Started

### Install Dependencies

Make sure you have [pnpm](https://pnpm.io/) installed. Then, run the following command to install all dependencies for both the frontend and backend:

```bash
pnpm install
```

### Start the Project

To start the project, use the following commands:

1. Start the backend server:
    ```bash
    pnpm run dev:server
    ```

2. Start the frontend client:
    ```bash
    pnpm run dev:client
    ```

The application should now be running locally. Open your browser and navigate to `http://localhost:3000` (or the port specified in your configuration).