const prisma = require('../lib/prisma')

const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    res.json({ wishlistItems, itemCount: wishlistItems.length })
  } catch (err) {
    console.error('GetWishlist error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const toggleWishlist = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    })

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_productId: { userId: req.user.id, productId } }
      })
      return res.json({ message: 'Removed from wishlist', wishlisted: false })
    }

    await prisma.wishlist.create({
      data: { userId: req.user.id, productId }
    })

    res.status(201).json({ message: 'Added to wishlist', wishlisted: true })
  } catch (err) {
    console.error('ToggleWishlist error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getWishlist, toggleWishlist }