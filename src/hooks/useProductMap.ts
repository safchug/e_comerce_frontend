import { useEffect, useState } from 'react'
import { listProducts } from '../api/products'
import type { Product } from '../types'

// Cart/order responses only carry productId per line, and there's no GET
// /products/:id, so fetch a page of the catalog just to look up names.
export function useProductMap() {
  const [productMap, setProductMap] = useState<Record<string, Product>>({})

  useEffect(() => {
    listProducts({ limit: 100 })
      .then((res) => {
        const map: Record<string, Product> = {}
        for (const product of res.data) map[product.id] = product
        setProductMap(map)
      })
      .catch(() => {})
  }, [])

  return productMap
}
