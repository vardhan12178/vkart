import React from "react";
import { BeatLoader } from "react-spinners";

const LoadingSpinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
            <BeatLoader color="#F59E0B" size={15} margin={2} />
        </div>
    );
};

export default LoadingSpinner;
