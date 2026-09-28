import ProductCard from '../product/ProductCard'

export default function ProductGrid({ products, cols = 4 }) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  return (
    <div className={`grid ${colClass} gap-3 sm:gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
