import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Card({ _id, name, price, image, loading = false }) {

  const navigate = useNavigate();

  return (
  <div className="bg-white rounded-xl overflow-hidden border border-brand flex flex-col hover:shadow-lg transition-shadow duration-300 group">

    <div className="h-64 overflow-hidden bg-gray-50 relative p-4 flex items-center justify-center">

      {loading ? (
        <Skeleton height="100%" width="100%" />
      ) : (
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      )}

    </div>

    <div className="p-5 flex-1 flex flex-col justify-between border-t border-gray-100">

      <div>

        {loading ? (
          <>
            <Skeleton height={28} width="80%" className="mb-3" />
            <Skeleton height={28} width="40%" className="mb-4" />
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {name}
            </h3>

            <p className="text-xl font-black text-brand mb-4">
              S/. {price.toFixed(2)}
            </p>
          </>
        )}

      </div>

      {loading ? (
        <Skeleton height={48} borderRadius={8} />
      ) : (
        <button
          onClick={() => navigate(`/product/${_id}`)}
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition"
        >
          Comprar
        </button>
      )}

    </div>

  </div>
);
}