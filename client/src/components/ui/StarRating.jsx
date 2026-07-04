import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${i < rating ? 'text-gold fill-gold' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-gold' : ''}`}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
