import React from 'react'
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline
} from 'react-icons/md'

import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../util/format'
import { Container, ProductTable, Total } from './styles'

interface Product {
  id: number
  title: string
  price: number
  image: string
  amount: number
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart()

  const cartFormatted = cart.map(product => ({
    // Obter objeto do produto desestruturado
    ...product,
    // Adicionar campo com preço do produto formatado
    priceFormatted: formatPrice(product.price),
    // Adicionar campo com o valor da quantidade total do produto
    subTotal: formatPrice(product.price * product.amount)
  }))

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      // Retornar acumulador + subtotal do produto
      return sumTotal + product.price * product.amount
    }, 0)
  )

  function handleProductIncrement(product: Product) {
    // Obter id do produto
    const productId = product.id
    // Obter amount incrementada do produto
    const amount = product.amount + 1
    // Obter produto com amount atualizado
    const updatedProduct = {
      productId: productId,
      amount: amount
    }
    // Chamar função de atualização do amount do produto
    updateProductAmount(updatedProduct)
  }

  function handleProductDecrement(product: Product) {
    // Obter id do produto
    const productId = product.id
    // Obter amount incrementada do produto
    const amount = product.amount - 1
    // Obter produto com amount atualizado
    const updatedProduct = {
      productId: productId,
      amount: amount
    }
    // Chamar função de atualização do amount do produto
    updateProductAmount(updatedProduct)
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map(product => (
            <tr key={product.id} data-testid="product">
              <td>
                <img src={product.image} alt={product.title} />
              </td>
              <td>
                <strong>{product.title}</strong>
                <span>{product.priceFormatted}</span>
              </td>
              <td>
                <div>
                  <button
                    type="button"
                    data-testid="decrement-product"
                    disabled={product.amount <= 1}
                    onClick={() => handleProductDecrement(product)}
                  >
                    <MdRemoveCircleOutline size={20} />
                  </button>
                  <input
                    type="text"
                    data-testid="product-amount"
                    readOnly
                    value={product.amount}
                  />
                  <button
                    type="button"
                    data-testid="increment-product"
                    onClick={() => handleProductIncrement(product)}
                  >
                    <MdAddCircleOutline size={20} />
                  </button>
                </div>
              </td>
              <td>
                <strong>{product.subTotal}</strong>
              </td>
              <td>
                <button
                  type="button"
                  data-testid="remove-product"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  )
}

export default Cart
