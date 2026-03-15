const prisma = require('../lib/prisma')

const getAllProducts = async (req, res) => {
  try {
    const { search, categoryId, page = 1, limit = 12 } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const where = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } }
      }),
      prisma.product.count({ where })
    ])

    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (err) {
    console.error('GetAllProducts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json({ product })
  } catch (err) {
    console.error('GetProductById error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body

    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, price and categoryId are required' })
    }

    const category = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } })
    if (!category) {
      return res.status(400).json({ message: 'Category not found' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        imageUrl,
        categoryId: parseInt(categoryId)
      },
      include: { category: { select: { id: true, name: true } } }
    })

    res.status(201).json({ message: 'Product created', product })
  } catch (err) {
    console.error('CreateProduct error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { name, description, price, stock, imageUrl, categoryId } = req.body

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (price !== undefined) data.price = parseFloat(price)
    if (stock !== undefined) data.stock = parseInt(stock)
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId)

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } }
    })

    res.json({ message: 'Product updated', product })
  } catch (err) {
    console.error('UpdateProduct error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await prisma.product.delete({ where: { id } })

    res.json({ message: 'Product deleted' })
  } catch (err) {
    console.error('DeleteProduct error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}