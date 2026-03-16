const prisma = require('../lib/prisma')

const placeOrder = async (req, res) => {
  try {
    const { address } = req.body

    if (!address) {
      return res.status(400).json({ message: 'Delivery address is required' })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`
        })
      }
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          address,
          status: 'pending',
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          orderItems: {
            include: { product: { select: { id: true, name: true, imageUrl: true } } }
          }
        }
      })

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      await tx.cartItem.deleteMany({ where: { userId: req.user.id } })

      return newOrder
    })

    res.status(201).json({ message: 'Order placed successfully', order })
  } catch (err) {
    console.error('PlaceOrder error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, imageUrl: true } } }
        },
        payment: true
      }
    })

    res.json({ orders })
  } catch (err) {
    console.error('GetUserOrders error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } }
        },
        payment: true
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ order })
  } catch (err) {
    console.error('GetOrderById error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { placeOrder, getUserOrders, getOrderById }