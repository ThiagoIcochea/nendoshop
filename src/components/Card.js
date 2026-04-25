export default function Card({ name, price, image }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-gray-600">S/. {price}</p>

        <button className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
          Comprar
        </button>
      </div>
    </div>
  );
}