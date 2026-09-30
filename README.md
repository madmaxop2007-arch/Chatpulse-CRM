# ChatPulse CRM - Real Estate SaaS Web Application

ChatPulse CRM is a production-grade, multi-tenant Real Estate Customer Relationship Management (CRM) SaaS designed for property brokers, individual real estate agents, and multi-agent brokerage agencies.

---

## 🚀 Key Features

* **Multi-Tenant Architecture**: Multi-agency isolation with individual roles (Owner, Admin, Agent).
* **Real Firebase Backend**: Firebase Authentication, Cloud Firestore (ABAC isolation), and Firebase Storage.
* **Leads Management**: Filter by status, priority, budget, property type, source, and location. Contact leads directly via Phone (`tel:`) and WhatsApp.
* **Lead Profile & Activity Timeline**: Comprehensive interaction logs, notes, call records, and follow-ups. Convert lead to verified client with 1-click.
* **Properties Inventory**: Support for residential (Apartments, Villas, Builder Floors, Plots) and commercial listings. Includes multi-image upload with client-side canvas compression.
* **Clients Records**: Track Buyers, Tenants, Investors, Landlords, and Sellers with custom requirements.
* **Follow-ups & Tasks**: Never miss client follow-ups with dedicated status filters (Today, Overdue, Upcoming, Completed).
* **Site Visits**: Schedule and coordinate property visits with calendar schedules and status tracking.
* **Sales Pipeline / Deals Kanban**: Visual stage progression (New -> Qualified -> Site Visit -> Negotiation -> Documentation -> Closed Won -> Closed Lost) with automatic total stage value calculation.
* **Real-Time Dashboard**: Key metrics calculated live from Firestore (Total Leads, Active Properties, Won Revenue, Pipeline Value, Lead Funnel).
* **Indian Real Estate Demo Seeder**: 1-click generation of 20 realistic leads, 15 properties (DLF Phase 1/2, Golf Course Ext, Sector 57, Dwarka), 10 clients, follow-ups, and pipeline deals.
* **CSV Import & Export**: Fast export and column-validated import for Leads, Properties, and Clients.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
* **Backend**: Firebase Authentication, Cloud Firestore, Firebase Storage
* **Security**: Granular attribute-based security rules (`firestore.rules` and `storage.rules`)

---

## 📋 Complete Step-by-Step Setup Guide

Follow these exact steps to connect ChatPulse CRM to your Firebase project:

### 1. Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select an existing Google Cloud project).
3. Name your project (e.g., `chatpulse-crm-app`).
4. (Optional) Choose whether to enable Google Analytics, then click **Create project**.

### 2. Add a Web App
1. In your Firebase Project Overview dashboard, click the **Web icon** (`</>`).
2. Enter an app nickname, e.g., `ChatPulse CRM Web`.
3. Click **Register app**.

### 3. Copy Firebase Configuration
Copy the configuration object provided in the console. You need the following keys:
* `apiKey`
* `authDomain`
* `projectId`
* `storageBucket`
* `messagingSenderId`
* `appId`

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your copied Firebase values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

*Note: You can also paste these credentials directly in the in-app setup banner if testing in a live browser!*

### 5. Enable Authentication
1. In the Firebase console sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.

### 6. Create Cloud Firestore Database
1. In the sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `asia-south1` for Mumbai / India).
4. Start in **Production mode** (security rules will be deployed next).

### 7. Enable Firebase Storage
1. In the sidebar, navigate to **Build > Storage**.
2. Click **Get Started**, choose default cloud storage bucket location, and click **Done**.

### 8. Deploy Firestore & Storage Security Rules
Install Firebase CLI tools if not already installed:
```bash
npm install -g firebase-tools
```
Log in and initialize Firebase in the project root:
```bash
firebase login
firebase init firestore
firebase init storage
```
Deploy the included hardened security rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 9. Run Application Locally
Install all project dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 10. Build for Production & Deploy to Firebase Hosting or Vercel
Build optimized production bundle:
```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase init hosting
firebase deploy --only hosting
```

---

## ⚡ Deploying to Vercel

ChatPulse CRM is pre-configured with `vercel.json` for zero-configuration SPA routing and asset caching.

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for ChatPulse CRM"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New...** > **Project**.
4. Import your Git repository.
5. Vercel automatically detects **Vite** as the framework:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Expand **Environment Variables** and add the following keys from your Firebase Console:
   - `VITE_FIREBASE_API_KEY`: *(Your Firebase Web API key)*
   - `VITE_FIREBASE_AUTH_DOMAIN`: `your-project-id.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID`: `your-project-id`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `your-project-id.firebasestorage.app` *(Optional on Spark plan)*
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `your-messaging-sender-id`
   - `VITE_FIREBASE_APP_ID`: `your-app-id`
   - `VITE_FIREBASE_STORAGE_ENABLED`: `false` *(or `true` if Cloud Storage is enabled)*
7. Click **Deploy**. Your CRM will be live in seconds!

> **Important (Firebase Authorized Domains)**:
> In the Firebase Console, go to **Authentication** > **Settings** > **Authorized Domains**, click **Add domain**, and add your Vercel deployment domain (e.g., `your-app.vercel.app`) so authentication requests are authorized.

---

### Option B: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. In the project root, run:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to link and deploy your project.
4. Set environment variables using the CLI:
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```
5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔒 Security Architecture

* **Multi-Tenant ABAC**: Every document is namespaced under `organizations/{orgId}/`. Access is granted strictly by validating that the requesting user's UID exists in `organizations/{orgId}/members/{uid}`.
* **No Client Delegation**: Queries are validated at the rule layer so unauthorized reads across organizations are impossible.
* **Storage Protection**: Uploads are restricted to authenticated agency members, validated for MIME type `image/*`, and capped at 10MB per file.
* **Zero Credential Exposure**: No service-account keys or admin secrets exist in frontend code.

---

## 🧪 Seeding Sample Data

1. Register an agency in the app.
2. In the Onboarding step (or in **Settings > Demo Data Seeder**), click **Seed Demo Data**.
3. This creates 20 Indian real estate leads, 15 properties, 10 clients, tasks, site visits, and deals in your agency.
4. You can click **Clear Demo Data** at any time to purge sample entries without affecting real data.
