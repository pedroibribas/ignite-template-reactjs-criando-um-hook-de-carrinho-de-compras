import { createContext, ReactNode, useContext, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'
import { Product, Stock } from '../types'

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  })

  const addProduct = async (productId: number) => {
    try {
      // Obter item do estoque
      const stock = await api.get(`/stock/${productId}`)
      // Obter quantidade do item do estoque
      const stockAmount = stock.data.amount

      // Obter dados do carrinho
      const updatedCart = [...cart]
      // Verificar se o produto existe no carrinho
      const productExists = updatedCart.find(
        product => product.id === productId
      )
      // Obter quantidade do produto no carrinho
      const currentAmount = productExists ? productExists.amount : 0
      // Obter quantidade desejada
      const amount = currentAmount + 1

      if (amount > stockAmount) {
        // Retornar erro
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (productExists) {
        // Atualizar amount do produto
        productExists.amount = amount
      } else {
        // Obter dados do produto
        const product = await api.get(`/products/${productId}`)
        // Adicionar amount ao produto
        const newProduct = { ...product.data, amount: 1 }
        // Adicionar novo produto
        updatedCart.push(newProduct)
      }

      // Atualizar estado do carrinho
      setCart(updatedCart)

      // Guardar dados do carrinho no formato string
      const data = JSON.stringify(updatedCart)
      // Enviar dados ao Local Storage
      localStorage.setItem('@RocketShoes:cart', data)
    } catch {
      toast.error('Erro na adição do produto')
    }
  }

  const removeProduct = (productId: number) => {
    try {
      // Obter dados do carrinho
      const updatedCart = [...cart]
      // Encontrar produto pelo index
      const productIndex = updatedCart.findIndex(item => item.id === productId)

      if (productIndex >= 0) {
        // Remover produto pelo index
        updatedCart.splice(productIndex, 1)
        // Atualizar estado cart
        setCart(updatedCart)
        // Guardar na Local Storage
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        // Rodar erro
        throw Error()
      }
    } catch {
      toast.error('Erro na remoção do produto')
    }
  }

  const updateProductAmount = async ({
    productId,
    amount
  }: UpdateProductAmount) => {
    try {
      // Obter dados do carrinho
      const updatedCart = [...cart]
      // Encontrar produto no carrinho
      const productExists = updatedCart.find(item => item.id === productId)

      // Obter dados do produto do estoque
      const stock = await api.get(`/stock/${productId}`)
      // Obter amount do produto em estoque
      const productStockAmount = stock.data.amount

      // Se a quantidade do produto for menor ou igual a zero, sair da função
      if (amount <= 0) return

      // Verificar se existe no estoque a quantidade desejada do produto
      if (amount > productStockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      // Verificar se o produto existe no carrinho
      if (productExists) {
        // Atualizar amount do produto
        productExists.amount = amount
        // Atualizar estado do carrinho
        setCart(updatedCart)
        // Perpetuar valor atualizado do carrinho na localStorage
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart))
      } else {
        // Lançar para catch
        throw Error()
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
    }
  }

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}
