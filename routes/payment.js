const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

// Payment processing endpoint
router.post('/process', PaymentController.processPayment);

// Payment status check endpoint
router.get('/status/:transactionId', PaymentController.getPaymentStatus);

// Payment callback endpoint (for bank/payment provider webhooks)
router.post('/callback', PaymentController.handleCallback);

// Get supported payment methods
router.get('/methods', (req, res) => {
  try {
    const config = require('../config/config.json');
    const supportedMethods = Object.keys(config.bankAPIs).map(method => ({
      id: method,
      name: method,
      minimumAmount: config.minimumAmount,
      maximumAmount: config.maximumAmount,
      currency: config.currency
    }));

    res.json({
      status: 'success',
      data: {
        methods: supportedMethods
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payment methods'
    });
  }
});

// Validate amount for specific payment method
router.post('/validate', (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const config = require('../config/config.json');

    if (!amount || !paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount and payment method are required'
      });
    }

    const amountNum = parseFloat(amount);
    const isValid = !isNaN(amountNum) && 
                   amountNum >= config.minimumAmount && 
                   amountNum <= config.maximumAmount &&
                   Object.keys(config.bankAPIs).includes(paymentMethod);

    res.json({
      status: 'success',
      data: {
        isValid,
        currency: config.currency,
        minimumAmount: config.minimumAmount,
        maximumAmount: config.maximumAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Validation failed'
    });
  }
});

module.exports = router;