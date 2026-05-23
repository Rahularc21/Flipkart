import React from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable Star Rating visual bar. Renders solid and empty gold stars out of 5.
 */
export default function StarRating({ rating = 4, size = 16 }) {
  const roundedRating = Math.round(rating);
  
  return (
    <div className="flex items-center gap-0.5" id={`root-star-rating-${rating}`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= roundedRating;
        return (
          <Star
            key={index}
            size={size}
            className={`${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}
