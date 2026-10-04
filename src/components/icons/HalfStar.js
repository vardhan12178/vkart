import { Star, StarHalf } from "lucide-react";

// A full star outline with its left half filled — the look of the old
// Font Awesome half-star. lucide's StarHalf alone is only the left half.
export default function HalfStar({ size = "1em", className = "", ...props }) {
  return (
    <span
      className={`relative inline-block shrink-0 align-[-0.125em] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Star size={size} className="absolute inset-0" {...props} />
      <StarHalf size={size} fill="currentColor" className="absolute inset-0" {...props} />
    </span>
  );
}
