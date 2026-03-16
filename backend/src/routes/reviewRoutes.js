const express = require('express')
const router = express.Router()
const { createReview, deleteReview } = require('../controllers/reviewController')
const auth = require('../middleware/auth')

router.post('/:productId', auth, createReview)
router.delete('/:id', auth, deleteReview)

module.exports = router