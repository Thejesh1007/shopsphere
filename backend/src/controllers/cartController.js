const prisma = require('../lib/prisma')

const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
            category: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity
    }, 0)

    res.json({ cartItems, subtotal, itemCount: cartItems.length })
  } catch (err) {
    console.error('GetCart error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' })
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.stock < 1) {
      return res.status(400).json({ message: 'Product is out of stock' })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: parseInt(productId)
        }
      }
    })

    let cartItem

    if (existingItem) {
      const newQuantity = existingItem.quantity + parseInt(quantity)

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} units available`
        })
      }

      cartItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: req.user.id,
            productId: parseInt(productId)
          }
        },
        data: { quantity: newQuantity },
        include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        },
        include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } }
      })
    }

    res.status(201).json({ message: 'Added to cart', cartItem })
  } catch (err) {
    console.error('AddToCart error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateCartItem = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} units available` })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    })

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not in cart' })
    }

    const cartItem = await prisma.cartItem.update({
      where: { userId_productId: { userId: req.user.id, productId } },
      data: { quantity: parseInt(quantity) },
      include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } }
    })

    res.json({ message: 'Cart updated', cartItem })
  } catch (err) {
    console.error('UpdateCartItem error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const removeFromCart = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    })

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not in cart' })
    }

    await prisma.cartItem.delete({
      where: { userId_productId: { userId: req.user.id, productId } }
    })

    res.json({ message: 'Item removed from cart' })
  } catch (err) {
    console.error('RemoveFromCart error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } })
    res.json({ message: 'Cart cleared' })
  } catch (err) {
    console.error('ClearCart error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart }