import React from "react";
import {
  Star,
} from "lucide-react";
import HalfStar from "./icons/HalfStar";

const Stars = ({ value }) => {
    const rounded = Math.round(value * 2) / 2;
    return (
        <div className="flex items-center gap-0.5 text-amber-400 text-xs">
            {Array.from({ length: 5 }).map((_, i) => {
                if (i + 1 <= Math.floor(rounded)) return <Star fill="currentColor" size="1em" key={i} />;
                if (i + 0.5 === rounded) return <HalfStar key={i} />;
                return <Star size="1em" key={i} className="text-gray-200" />;
            })}
        </div>
    );
};

export default Stars;
