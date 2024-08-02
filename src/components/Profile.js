import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; 
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Profile = ({ setIsLoggedIn }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setUser(response.data);
        console.log(response);
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    setIsLoggedIn(false);
    navigate('/login');
    
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="profile-container p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {user ? (
        <div className="profile-info bg-white p-6 shadow-lg rounded-lg">
          <img
            src={user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold mb-2">Name: {user.name}</p>
          <p className="text-xl font-semibold mb-2">Username: {user.username}</p>
          <p className="text-lg mb-2">Email: {user.email}</p>
          <p className="text-lg mb-4">User ID: {user._id}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-center text-lg">No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
