# E-commerce Backend API

Production-ready Node.js/Express/MongoDB backend with mobile OTP authentication and JWT.

## Features

- 📱 Mobile OTP Authentication
- 🔐 JWT Token-based Authorization
- 🏗️ MVC Architecture
- ✅ Input Validation
- 🛡️ Security Headers (Helmet)
- 📝 Request Logging (Morgan)
- ⚠️ Centralized Error Handling
- 🔄 Database Connection Retry Logic

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd d:\Ecommerce\backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   - `JWT_SECRET` - Use a strong random string
   - `MONGODB_URI` - Your MongoDB connection string

4. **Start MongoDB**
   
   Make sure MongoDB is running:
   ```bash
   mongod
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will run on `http://localhost:5000` with auto-reload on file changes.

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "mobile": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "1234",
  "dummyOtp": "1234"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "mobile": "9876543210",
  "otp": "1234"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "mobile": "9876543210"
  }
}
```

## Project Structure

```
backend/
├── config/
│   ├── constants.js      # Application constants
│   └── database.js       # MongoDB connection
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── authMiddleware.js # JWT verification
│   ├── errorHandler.js   # Error handling
│   └── validator.js      # Input validation
├── models/
│   └── User.js          # User schema
├── routes/
│   └── authRoutes.js    # Auth endpoints
├── utils/
│   ├── otpService.js    # OTP generation
│   └── tokenService.js  # JWT operations
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── README.md           # Documentation
└── server.js           # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecommerce_db` |
| `JWT_SECRET` | Secret key for JWT | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `OTP_EXPIRES_IN` | OTP expiration in minutes | `10` |
| `NODE_ENV` | Environment mode | `development` |

## Testing

### Using curl

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"9876543210\"}"
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"9876543210\",\"otp\":\"1234\"}"
```

### Using Thunder Client / Postman

1. Import the endpoints
2. Test send-otp with a 10-digit mobile number
3. Use OTP `1234` to verify
4. Copy the JWT token from response

## Development Notes

- **Dummy OTP**: Currently using `1234` for all OTP requests (development only)
- **OTP Logging**: OTP is logged to console for testing
- **Token Expiry**: JWT tokens expire after 7 days by default

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**
   - Set strong `JWT_SECRET`
   - Set `NODE_ENV=production`
   - Use MongoDB Atlas or managed instance

2. **Integrate Real SMS Service**
   - Update `utils/otpService.js`
   - Add Twilio, AWS SNS, or similar
   - Remove dummy OTP logic

3. **Security Enhancements**
   - Enable rate limiting
   - Configure proper CORS origins
   - Set up HTTPS/SSL
   - Add request monitoring

4. **Database**
   - Use connection pooling
   - Enable authentication
   - Set up backups

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port 5000

### Dependencies Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
