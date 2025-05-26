# Survify - Survey Authentication & Email Verification API

Survify is a survey platform backend that includes secure user authentication, email verification via OTP, password reset, and role-based access (User, Manager, Admin). This project is built using Node.js, Express, MongoDB, JWT, and Nodemailer.

---

## 🔧 Features

* JWT-based authentication with cookies
* Secure password hashing using bcrypt
* Email OTP verification (Nodemailer + bcrypt hashed OTPs)
* Role-based access control
* Reset password with OTP
* Admin verification for business accounts

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* bcrypt.js
* jsonwebtoken
* dotenv
* nodemailer

---

##  Folder Structure (Relevant)

```
├── models
│   ├── user.js
│   └── otp.js
├── controllers
│   └── authController.js
├── .env
├── package.json
```

---

##  Environment Variables

Create a `.env` file with the following variables:

```
JWT_SECRET=your_jwt_secret
EMAIL=your_email@gmail.com
PASS=your_app_password
NODE_ENV=development
```

---

##  API Reference

### Register

**POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

Returns a JWT cookie and user info.

---

### Login

**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

Returns JWT cookie, triggers OTP if not verified.

---

### Send OTP

**POST** `/api/auth/send-otp`

```json
{
  "email": "john@example.com"
}
```

Sends OTP email and stores hashed OTP in DB.

---

### Verify Email

**POST** `/api/auth/verify-email`

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Verifies OTP and sets `isVerified=true`.

---

### Reset Password

**POST** `/api/auth/reset-password`

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newsecurepass"
}
```

Changes password if OTP is valid.

---

### Logout

**POST** `/api/auth/logout`
Clears the JWT cookie.

---

### Create Business Account

**POST** `/api/business/create`

```json
{
  "name": "Acme Inc",
  "email": "manager@acme.com",
  "password": "business123"
}
```

Creates a manager account pending admin approval.

---

### Verify Business (Admin Only)

**POST** `/api/admin/verify-business`

```json
{
  "businessid": "<business-user-id>"
}
```

Sets the `isVerified` flag to `true` for a business account. Requires admin JWT cookie.

---


## 🧠 Author

**Mokshagna Gorantla** – [gorantlamokshgnaism@gmail.com](mailto:gorantlamokshgnaism@gmail.com)



---

## 🔒 Security Notes

* OTPs are hashed using bcrypt and expire in 10 minutes.
* Each OTP has a limited number of attempts.
* JWT is stored in an HTTP-only cookie for security.
