const prisma = require('../lib/prisma')

const createReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const { rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    })
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' })
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: { user: { select: { id: true, name: true } } }
    })

    res.status(201).json({ message: 'Review submitted', review })
  } catch (err) {
    console.error('CreateReview error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteReview = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' })
    }

    await prisma.review.delete({ where: { id } })
    res.json({ message: 'Review deleted' })
  } catch (err) {
    console.error('DeleteReview error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createReview, deleteReview }