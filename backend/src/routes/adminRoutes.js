const express = require('express')
const router = express.Router()
const {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/stats', auth, admin, getStats)
router.get('/orders', auth, admin, getAllOrders)
router.put('/orders/:id/status', auth, admin, updateOrderStatus)
router.get('/users', auth, admin, getAllUsers)
router.delete('/users/:id', auth, admin, deleteUser)

module.exports = router