const express = require('express')
const router = express.Router()
const { getAllCategories, createCategory } = require('../controllers/categoryController')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/', getAllCategories)
router.post('/', auth, admin, createCategory)

module.exports = router