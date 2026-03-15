const express = require('express')
const router = express.Router()
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.post('/', auth, admin, createProduct)
router.put('/:id', auth, admin, updateProduct)
router.delete('/:id', auth, admin, deleteProduct)

module.exports = router