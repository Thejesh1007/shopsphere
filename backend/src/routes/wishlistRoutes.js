const express = require('express')
const router = express.Router()
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController')
const auth = require('../middleware/auth')

router.get('/', auth, getWishlist)
router.post('/:productId', auth, toggleWishlist)

module.exports = router