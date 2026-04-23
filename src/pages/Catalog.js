import Card from "../components/Card";
import products from "../data/products";

export default function Catalog() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Nendoroids</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}