import { Star, CheckCircle } from "lucide-react";
import { REVIEWS } from "@/constants/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-[#D4DFEF]"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const avgRating = (
    REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-[#DCE7F8]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="w-2 h-5 bg-[#0057FF] -skew-x-[24deg] rounded-sm" />
              <span className="w-2 h-5 bg-[#0095FF] -skew-x-[24deg] rounded-sm" />
            </div>
            <h2 className="font-montserrat font-black italic text-3xl text-[#0B172A]">
              Opiniones <span className="text-[#0057FF]">Reales</span>
            </h2>
          </div>
          <p className="text-[#546885] text-sm mb-5">
            Clientes satisfechos en San Salvador
          </p>

          {/* Summary */}
          <div className="inline-flex items-center gap-4 bg-[#F8FAFF] border border-[#DCE7F8] rounded-2xl px-6 py-4 shadow-sm">
            <div>
              <p className="font-montserrat font-black text-4xl text-[#0057FF]">
                {avgRating}
              </p>
              <StarRating rating={5} />
              <p className="text-[#546885] text-xs mt-1 font-medium">
                {REVIEWS.length} reseñas
              </p>
            </div>
            <div className="w-px h-12 bg-[#DCE7F8]" />
            <div className="text-left space-y-1">
              {[5, 4, 3].map((star) => {
                const count = REVIEWS.filter((r) => r.rating === star).length;
                const pct = Math.round((count / REVIEWS.length) * 100);
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[#4D607D] text-[10px] font-bold w-4">
                      {star}★
                    </span>
                    <div className="w-24 h-1.5 bg-[#E2ECFA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[#6B7E9E] text-[10px] font-medium">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-[#F8FAFF] border border-[#DCE7F8] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#0057FF]/45 hover:shadow-[0_10px_24px_rgba(0,68,180,0.08)] transition-all"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0057FF] to-[#0095FF] flex items-center justify-center shrink-0">
                  <span className="font-black text-white text-xs">
                    {review.avatar}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[#0B172A] font-bold text-xs truncate">
                      {review.name}
                    </p>
                    {review.verified && (
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[#6B7E9E] text-[10px]">{review.date}</p>
                </div>
              </div>

              {/* Stars + product */}
              <div>
                <StarRating rating={review.rating} />
                <p className="text-[#0057FF] text-[10px] font-bold mt-1 truncate">
                  {review.productName}
                </p>
              </div>

              {/* Comment */}
              <p className="text-[#334663] text-xs leading-relaxed flex-1">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
