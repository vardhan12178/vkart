import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Stars = ({ value }) => {
    const rounded = Math.round(value * 2) / 2;
    return (
        <div className="flex items-center gap-0.5 text-amber-400 text-xs">
            {Array.from({ length: 5 }).map((_, i) => {
                if (i + 1 <= Math.floor(rounded)) return <FaStar key={i} />;
                if (i + 0.5 === rounded) return <FaStarHalfAlt key={i} />;
                return <FaRegStar key={i} className="text-gray-200" />;
            })}
        </div>
    );
};

export default Stars;
