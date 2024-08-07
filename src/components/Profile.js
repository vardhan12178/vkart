import React, { useEffect, useState } from 'react';
import axios from './axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import { FaCamera, FaPen, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import OrderCard from './OrderCard';

const Profile = ({ setIsLoggedIn }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      try {
        const profileResponse = await axios.get('/api/profile');
        setUser(profileResponse.data);
        
        const ordersResponse = await axios.get('/api/profile/orders');
        setOrders(ordersResponse.data);
      } catch (err) {
        setError('Failed to fetch profile or orders');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, []);

  const handleLogout = () => {
    Cookies.remove('jwt_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!editor || !selectedFile) return;

    const canvas = editor.getImage();
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('profileImage', blob, selectedFile.name);

      try {
        const response = await axios.post('/api/profile/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUser(response.data);
        setSelectedFile(null); 
      } catch (err) {
        setError('Failed to upload profile image');
      }
    });
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="profile-container p-8 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      {user ? (
        <div className="profile-info bg-white p-8 shadow-md rounded-lg relative mt-20">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <img
              src={user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              srcSet={`
                ${user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 1x,
                ${user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 2x
              `}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-gray-300 shadow-md"
              loading="lazy"
            />
            <label htmlFor="file-upload" className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer flex items-center justify-center transition-transform transform hover:scale-110">
              <FaCamera className="text-white text-lg" />
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <button
                onClick={handleUpload}
                className="absolute top-2 right-2 bg-green-600 p-2 rounded-full text-white flex items-center justify-center transition-transform transform hover:scale-110"
              >
                <FaPen />
              </button>
            )}
          </div>
          {selectedFile && (
            <>
              <AvatarEditor
                ref={(ref) => setEditor(ref)}
                image={selectedFile}
                width={300}
                height={300}
                border={50}
                scale={1.2}
                className="mb-4 mx-auto"
              />
              <button
                onClick={handleUpload}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Upload
              </button>
            </>
          )}
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2"><strong>Name:</strong> {user.name}</p>
            <p className="text-lg text-gray-700 mb-2"><strong>Username:</strong> {user.username}</p>
            <p className="text-lg text-gray-700 mb-4"><strong>Email:</strong> {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
          <div className="text-center mt-8">
            <Link to="/contact" className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
              <FaEnvelope className="mr-2" />
              Contact Us
            </Link>
          </div>
          <div className="text-center mt-8">
            <Link to="/about" className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
              <FaInfoCircle className="mr-2" />
              About Us
            </Link>
          </div>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-center text-lg text-gray-600">You have no orders yet.</p>
          ) : (
            orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))
          )}
        </div>
      ) : (
        <p className="text-center text-lg">No user data found.</p>
      )}
    </div>
  );
};

export default Profile;
