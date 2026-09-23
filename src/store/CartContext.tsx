import { resolveImageUrl } from '../core/api/imageUrl'
/* eslint-disable react-refresh/only-export-components -- provider and its typed hook form one cohesive module */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartLine, MenuItem } from '../types'
import { useAuth } from '../core/auth/AuthContext'
import { cartApi } from '../core/api/services'
import { environment } from '../core/config/environment'
import type { ApiCart } from '../core/types/api'

type CartContextValue = {
  lines: CartLine[]
  count: number
  subtotal: number
  addItem: (item: MenuItem) => void
  setQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  syncError: string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [syncError,setSyncError]=useState(''); const { user } = useAuth()
  const applyApiCart = (cart: ApiCart) => { setSyncError(''); setLines(cart.items.map(({ menuItem, quantity }) => ({ id: menuItem._id, restaurantId: menuItem.restaurant, restaurantName: cart.groups?.find(group => group.restaurant === menuItem.restaurant)?.restaurantName, name: menuItem.name, description: menuItem.description ?? '', price: menuItem.price, category: menuItem.category, image: resolveImageUrl(menuItem.imageUrl) ?? '/images/food/sri_lankan_feast.jpg', quantity }))); }
  useEffect(() => { if (environment.useMocks || user?.role !== 'customer') return; let active=true; cartApi.get().then((cart)=>{if(active)applyApiCart(cart)}).catch((error)=>{if(active)setSyncError(error instanceof Error?error.message:'Unable to load cart')}); return()=>{active=false} }, [user])
  const addItem = (item: MenuItem) => {
    if (!environment.useMocks && user?.role === 'customer') {
      void cartApi.add(item.id).then(applyApiCart).catch((error) => setSyncError(error instanceof Error ? error.message : 'Unable to update cart'))
      return
    }
    setLines((current) => {
    const match = current.find((line) => line.id === item.id)
    const next = match ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...item, quantity: 1 }]
    return next
    })
  }
  const setQuantity = (id: string, quantity: number) => { setLines((current) => quantity < 1 ? current.filter((line) => line.id !== id) : current.map((line) => line.id === id ? { ...line, quantity } : line)); if (!environment.useMocks && user?.role === 'customer') void (quantity<1?cartApi.remove(id):cartApi.update(id,quantity)).then(applyApiCart).catch((error)=>setSyncError(error instanceof Error?error.message:'Unable to update cart')) }
  const removeItem = (id: string) => { setLines((current) => current.filter((line) => line.id !== id)); if (!environment.useMocks && user?.role === 'customer') void cartApi.remove(id).then(applyApiCart).catch((error)=>setSyncError(error instanceof Error?error.message:'Unable to remove item')) }
  const clearCart = async () => { try { if (!environment.useMocks && user?.role === 'customer') await cartApi.clear(); setLines([]); setSyncError('') } catch (error) { setSyncError(error instanceof Error ? error.message : 'Unable to clear cart'); throw error } }
  const refreshCart = async () => { if (!environment.useMocks && user?.role === 'customer') { applyApiCart(await cartApi.get()); setSyncError('') } }
  const value = { refreshCart, lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal: lines.reduce((sum, line) => sum + line.price * line.quantity, 0), addItem, setQuantity, removeItem, clearCart, syncError }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within CartProvider')
  return value
}
