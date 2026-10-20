# Adaigi (PayUPI) — Instant Raast Payment Settlements

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3.0-61dafb?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A free, non-custodial, open-source payment confirmation platform for Pakistani merchants. Generate instant Raast QR payment links and automatically verify incoming bank alert emails in ~10 seconds with **₨0 in gateway fees**.

---

## The Problem & The Solution

- **The Problem:** Traditional payment gateways in Pakistan (JazzCash, Easypaisa, Safepay) charge 2.5%–4% transaction fees, require business registration (NTN), and have weeks of approval delays. While the State Bank of Pakistan's **Raast** network is instant and free, banks provide no public merchant webhook or checkout API to notify your store when a customer pays.
- **The Solution:** **Adaigi** bridges this gap. When your customer scans your generated Raast QR code and pays, your bank sends an instant transaction alert email to your Gmail. Adaigi securely reads this notification via IMAP in real time (within **10 seconds**), matches the transaction, and marks the checkout page **PAID**.

---

## Key Benefits

- **₨0 Gateway Fees:** Zero middleman fees or transaction cuts. All funds settle directly bank-to-bank into your account.
- **Non-Custodial:** Money goes straight from the customer's bank to your IBAN. Adaigi never touches or holds your funds.
- **Instant Automated Verification:** Checks incoming bank alert emails via IMAP and confirms transactions in ~10 seconds.
- **Dynamic Raast QR Codes:** Automatically embeds payment amounts and transaction identifiers into standard Raast QR codes compatible with all Pakistani banking and wallet apps.
- **Self-Hosted & Private:** Deploy your own independent instance for free using Vercel and MongoDB Atlas.

---

## Prerequisites

Before setting up Adaigi, ensure you have:

1. **Node.js 18+** & **pnpm** installed on your system.
2. A **MongoDB database** (local MongoDB instance or free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)).
3. A **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) configured for bank alerts.
4. A **Pakistani bank account** or wallet with Raast enabled to receive payments.

---

## Quick Start Installation

### 1. Clone the repository
```bash
git clone https://github.com/anzamuneebkhanofficial/adaigi.git
cd adaigi
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables
Copy the sample environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` in your editor and enter your own configuration (store name, bank IBAN, MongoDB URI, and Gmail App Password). All required fields are documented with clean demo placeholders in [`.env.example`](.env.example).

### 4. Run the development server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How It Works

1. **Log In:** Go to `/admin` and log in to your merchant dashboard.
2. **Create Payment:** Enter the payment amount and a reference (e.g., Order #1042) to generate a unique payment link.
3. **Share Link:** Send the payment link to your customer.
4. **Customer Pays:** The customer opens the link and scans the Raast QR code using any Pakistani bank app (Meezan, HBL, UBL, Nayapay, Sadapay, etc.).
5. **Instant Confirmation:** When your bank sends the credit alert email, Adaigi detects it and updates the customer's screen to **Payment Received** in ~10 seconds.

---

## License

This project is open-source software licensed under the **[MIT License](LICENSE)**. You are free to clone, customize, and self-host it for personal or commercial projects.

---

## Founder & Developer

**Muhammad Anza Muneeb Khan**  
Founder & Lead Full-Stack Engineer — Creator of Adaigi

- **GitHub:** [@anzamuneebkhanofficial](https://github.com/anzamuneebkhanofficial)
- **Repository:** [https://github.com/anzamuneebkhanofficial/adaigi](https://github.com/anzamuneebkhanofficial/adaigi)
