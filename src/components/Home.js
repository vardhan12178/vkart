import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white h-4/5 md:h-80 flex items-center justify-center">
      <div className="flex flex-col  md:flex-row items-center justify-between w-full max-w-6xl p-4">
        <div className="md:w-1/2 p-6 text-center">
          <h1 className="text-blue-600 text-4xl font-bold mb-4">Vkart</h1>
          <p className="text-gray-600 text-lg mb-6">Shop with us we have the best products available online</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition duration-300">
            <Link to="/products">Shop now</Link>
          </button>
        </div>
        <div className="md:w-1/2 flex justify-center items-center">
          <img className="max-h-80 md:max-h-80 w-full md:w-auto object-contain" src="https://cdn.dribbble.com/users/1042380/screenshots/7107889/media/1566b58ed94e8ee2f7561079641d5a29.png" alt="avatar" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export default Home;
