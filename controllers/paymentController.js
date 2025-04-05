const config = require('../config/config.json');

class PaymentController {
  static async processPayment(req, res) {
    try {
      const { amount, paymentMethod, customerName, email, phone } = req.body;

      // Validate required fields
      if (!amount || !paymentMethod || !customerName || !email) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        });
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < config.minimumAmount || amountNum > config.maximumAmount) {
        return res.status(400).json({
          status: 'error',
          message: `Amount must be between ${config.minimumAmount} and ${config.maximumAmount} ${config.currency}`
        });
      }

      // Validate payment method
      const supportedMethods = Object.keys(config.bankAPIs);
      if (!supportedMethods.includes(paymentMethod)) {
        return res.status(400).json({
          status: 'error',
          message: `Payment method must be one of: ${supportedMethods.join(', ')}`
        });
      }

      // Generate transaction ID
      const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Simulate payment processing
      const bankConfig = config.bankAPIs[paymentMethod];
      const isSuccess = Math.random() < bankConfig.successRate;

      if (isSuccess) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = {
          status: 'success',
          message: 'Payment processed successfully',
          data: {
            transactionId,
            amount: amountNum,
            currency: config.currency,
            paymentMethod,
            customerName,
            email,
            phone,
            timestamp: new Date().toISOString(),
            paymentStatus: 'COMPLETED',
            bankReference: `REF-${Math.random().toString(36).substr(2, 9)}`
          }
        };

        return res.status(200).json(response);
      } else {
        // Simulate failed payment
        const errorCodes = [
          'INSUFFICIENT_FUNDS',
          'BANK_TIMEOUT',
          'INVALID_ACCOUNT',
          'SYSTEM_ERROR'
        ];
        const randomError = errorCodes[Math.floor(Math.random() * errorCodes.length)];

        return res.status(400).json({
          status: 'error',
          message: 'Payment processing failed',
          error: {
            code: randomError,
            description: `Payment failed due to ${randomError.toLowerCase().replace('_', ' ')}`
          },
          data: {
            transactionId,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  static async getPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction ID is required'
        });
      }

      // Simulate status check delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate random status (in real implementation, this would check the actual transaction status)
      const statuses = ['COMPLETED', 'PENDING', 'FAILED'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return res.status(200).json({
        status: 'success',
        data: {
          transactionId,
          paymentStatus: randomStatus,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Status check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : {}
      });
    }
  }

  static async handleCallback(req, res) {
    try {
      const callbackData = req.body;
      
      // Log callback data
      console.log('Payment callback received:', callbackData);

      // Validate callback signature (in production, implement proper signature validation)
      
      // Process callback data
      // In a real implementation, update the transaction status in the database
      
      return res.status(200).json({
        status: 'success',
        message: 'Callback processed successfully'
      });
    } catch (error) {
      console.error('Callback processing error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
}

module.exports = PaymentController;