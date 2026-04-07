# E-commerce Backend API

Production-ready Node.js/Express/MongoDB backend with Razorpay payment support.

## Features

- 💳 Razorpay order creation & signature verification
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

### Payments (Razorpay)

#### Create Order
```http
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 499,
  "currency": "INR",
  "customerMobile": "9876543210",
  "customerName": "John Doe",
  "customerAddress": {
    "house": "123 Main Street",
    "city": "Muzaffarpur",
    "state": "Bihar",
    "pincode": "842001"
  },
  "cartSnapshot": []
}
```

#### Verify Payment
```http
POST /api/payment/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXX",
  "razorpayPaymentId": "pay_XXXX",
  "razorpaySignature": "signature_XXXX"
}
```

## Project Structure

```
backend/
├── config/
│   ├── constants.js      # Application constants
│   └── database.js       # MongoDB connection
├── controllers/
│   └── paymentController.js # Razorpay logic
├── middleware/
│   ├── errorHandler.js   # Error handling
│   └── validator.js      # Input validation
├── models/
│   ├── Transaction.js    # Payment transactions
│   └── User.js           # User schema (optional / legacy)
├── routes/
│   └── paymentRoutes.js  # Payment endpoints
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
| `RAZORPAY_KEY_ID` | Razorpay Key ID | (required) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | (required) |
| `NODE_ENV` | Environment mode | `development` |

## Testing

### Using curl

**Create Razorpay order:**
```bash
curl -X POST http://localhost:5000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d "{\"amount\":499,\"currency\":\"INR\",\"customerMobile\":\"9876543210\",\"customerName\":\"John Doe\"}"
```

### Using Thunder Client / Postman

1. Import the endpoints
2. Test send-otp with a 10-digit mobile number
3. Use OTP `1234` to verify
4. Copy the JWT token from response

## Development Notes
- Payments are public and validated server-side (amount + customer mobile).

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**
   - Set `NODE_ENV=production`
   - Use MongoDB Atlas or managed instance

2. **Security Enhancements**
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
