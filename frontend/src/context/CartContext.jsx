import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)

  const fetchCart = async () => {
    if (!user) { setCartItems([]); setSubtotal(0); setItemCount(0); return }
    try {
      const res = await api.get('/cart')
      setCartItems(res.data.cartItems)
      setSubtotal(res.data.subtotal)
      setItemCount(res.data.itemCount)
    } catch { }
  }

  useEffect(() => { fetchCart() }, [user])

  return (
    <CartContext.Provider value={{ cartItems, subtotal, itemCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)