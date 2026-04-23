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
  
          <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Comprar
          </button>
        </div>
      </div>
    );
  }