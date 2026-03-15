const prisma = require('../lib/prisma')

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    res.json({ categories })
  } catch (err) {
    console.error('GetAllCategories error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const existing = await prisma.category.findUnique({ where: { name } })
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = await prisma.category.create({
      data: { name, description, imageUrl }
    })

    res.status(201).json({ message: 'Category created', category })
  } catch (err) {
    console.error('CreateCategory error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getAllCategories, createCategory }