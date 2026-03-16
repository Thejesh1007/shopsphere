const crypto = require('crypto')
const prisma = require('../lib/prisma')

const MOCK_KEY_ID = 'rzp_test_mock_shopsphere'
const MOCK_SECRET = 'mock_secret_shopsphere_2024'

const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' })
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order is already paid or cancelled' })
    }

    const mockRazorpayOrderId = `order_mock_${Date.now()}_${order.id}`

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { razorpayOrderId: mockRazorpayOrderId, status: 'pending' },
      create: {
        orderId: order.id,
        amount: order.total,
        status: 'pending',
        method: 'razorpay',
        razorpayOrderId: mockRazorpayOrderId
      }
    })

    res.json({
      razorpayOrderId: mockRazorpayOrderId,
      amount: Math.round(order.total * 100),
      currency: 'INR',
      keyId: MOCK_KEY_ID
    })
  } catch (err) {
    console.error('CreateRazorpayOrder error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ message: 'All payment fields are required' })
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', MOCK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' })
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: parseInt(orderId) },
        data: {
          status: 'paid',
          razorpayPaymentId,
          razorpaySignature
        }
      })

      await tx.order.update({
        where: { id: parseInt(orderId) },
        data: { status: 'confirmed' }
      })
    })

    res.json({ message: 'Payment verified successfully', success: true })
  } catch (err) {
    console.error('VerifyPayment error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createRazorpayOrder, verifyPayment }