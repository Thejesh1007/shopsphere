const prisma = require('../lib/prisma')

const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueData,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          payment: true
        }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: 'asc' },
        take: 5
      })
    ])

    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData._sum.amount || 0
      },
      recentOrders,
      lowStockProducts,
      ordersByStatus
    })
  } catch (err) {
    console.error('GetStats error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const where = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true } }
            }
          },
          payment: true
        }
      }),
      prisma.order.count({ where })
    ])

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (err) {
    console.error('GetAllOrders error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`
      })
    }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true
      }
    })

    res.json({ message: 'Order status updated', order: updatedOrder })
  } catch (err) {
    console.error('UpdateOrderStatus error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } }
        }
      }),
      prisma.user.count()
    ])

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (err) {
    console.error('GetAllUsers error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete another admin account' })
    }

    await prisma.user.delete({ where: { id } })

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('DeleteUser error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getStats, getAllOrders, updateOrderStatus, getAllUsers, deleteUser }