# WECARE.DIGITAL — Serverless URL Shortener Platform

Welcome to the repository for the **WECARE.DIGITAL URL Shortener** — a secure, scalable, serverless solution to create, manage, and share custom short links powered by AWS cloud infrastructure.

---

## 🚀 Project Overview

This solution is designed to deliver a **high-performance URL shortener** using modern AWS serverless technologies and a responsive Vue.js dashboard.

Built for:
- **Scalability**
- **Security**
- **Minimal operational overhead**
- **Global availability**

---

## 🏗️ Architecture

- **Frontend:** Vue.js Single Page Application (SPA) hosted on Amazon S3 with CloudFront CDN
- **Authentication:** Amazon Cognito User Pools (OAuth2 + JWT Tokens)
- **Backend:** Amazon API Gateway (REST API secured with Cognito Authorizer)
- **Database:** Amazon DynamoDB (Serverless NoSQL for storing short links)
- **DNS Management:** Amazon Route53
- **CI/CD:** AWS Amplify connected to GitHub repository

---

## 🌐 Custom Domains

| Domain | Purpose |
|--------|---------|
| [r.wecare.digital](https://r.wecare.digital) | Public URL Redirection |
| [go.wecare.digital](https://go.wecare.digital) | Secure User Dashboard for link management |

---

## ✨ Key Features

- 🚀 Create, edit, delete short links easily
- 🔎 Full search across ID, URL, and remarks
- 📋 Copy shortened links to clipboard
- 📈 Paginated list (500 links per page)
- 🔒 Fully secured via Amazon Cognito authentication
- 🌎 Fast global access via Amazon CloudFront CDN
- 🛡️ Backend protected by OAuth2 JWT authorization

---

## 🔒 Security

- Frontend login using Amazon Cognito Hosted UI (OAuth2)
- JWT Token validation for all protected API routes
- Owner-based data access control in DynamoDB
- CORS correctly configured for cross-domain API access

---

## 📚 Documentation

Full Architecture Whitepaper available:  
👉 [AWS URL Shortener Architecture — Full Documentation (PDF)](link-to-pdf-if-you-upload-it)

Highlights:
- Expanded System Architecture
- Dashboard Evolution (Earlier vs Improved)
- Full End-to-End Data Flow
- Expanded Change Management (Fixes and Enhancements)
- Security Best Practices Applied

---

## 📦 Repository Structure

```plaintext
/client             --> Vue.js Frontend Source Code
/amplify            --> AWS Amplify App Configuration
/cdk                --> (Optional) Future Infrastructure as Code modules
README.md           --> Project Overview (this file)


git clone https://github.com/wecaredigital/r.wecare.digital.git

cd client
npm install
npm run serve

