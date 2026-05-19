import { useNavigate } from "react-router-dom";

export default function Card({ _id, name, price, image }) {

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-brand flex flex-col hover:shadow-lg transition-shadow duration-300 group h-full">

      <div className="h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-50 relative p-3 sm:p-4 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between border-t border-gray-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {name}
          </h3>

          <p className="text-lg sm:text-xl font-black text-brand mb-3 sm:mb-4">
            S/. {price.toFixed(2)}
          </p>
        </div>

        <button
          onClick={() => navigate(`/product/${_id}`)}
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2 sm:py-3 rounded-lg transition active:scale-95"
        >
          Comprar
        </button>
      </div>

    </div>
  );
}