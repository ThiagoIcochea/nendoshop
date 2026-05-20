import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function CommentCard({ comment, loading }) {

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition">

      <div className="flex items-center gap-3 mb-2">

        {loading ? (
          <>
            <Skeleton circle width={32} height={32} />

            <div className="flex flex-col gap-1">
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={12} />
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
              {(comment.user || "Usuario").charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="font-semibold text-sm">
                {comment.user || "Usuario"}
              </p>

              <p className="text-xs text-gray-400">
                {comment.date
                  ? new Date(comment.date).toLocaleDateString()
                  : ""}
              </p>
            </div>
          </>
        )}

      </div>

      {loading ? (
        <>
          <Skeleton width={100} height={16} className="mb-2" />

          <Skeleton count={3} height={14} className="mb-1" />
        </>
      ) : (
        <>
          <div className="text-yellow-400 text-sm mb-2">
            {"★".repeat(comment.rating)}
            {"☆".repeat(5 - comment.rating)}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed break-words">
            {comment.text}
          </p>
        </>
      )}

    </div>
  );
}