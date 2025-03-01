import React, { useEffect, useState, Suspense, lazy } from 'react';
import axios from './axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import { FaCamera, FaPen, FaEnvelope, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import imageCompression from 'browser-image-compression';

const OrderCard = lazy(() => import('./OrderCard'));

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
        const [profileResponse, ordersResponse] = await Promise.all([
          axios.get('/api/profile'),
          axios.get('/api/profile/orders'),
        ]);
        setUser(profileResponse.data);

        const sortedOrders = ordersResponse.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
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
      if (!blob) return;

      try {
        const compressedImage = await imageCompression(blob, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append('profileImage', compressedImage, selectedFile.name);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="profile-container mt-12 p-4 sm:p-8 max-w-6xl mx-auto bg-white rounded-xl shadow-2xl">
      {user ? (
        <div className="profile-info p-6 sm:p-8 bg-gradient-to-r from-orange-50 to-orange-50 rounded-xl shadow-md relative">
          {/* Profile Image Section */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
            <img
              src={user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
              loading="lazy"
            />
            <label
              htmlFor="file-upload"
              className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-full cursor-pointer flex items-center justify-center transition-transform transform hover:scale-110"
            >
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
                className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full text-white flex items-center justify-center transition-transform transform hover:scale-110"
              >
                <FaPen className="text-lg" />
              </button>
            )}
          </div>

          {/* Avatar Editor for Image Cropping */}
          {selectedFile && (
            <div className="mb-6 sm:mb-8 text-center">
              <AvatarEditor
                ref={(ref) => setEditor(ref)}
                image={selectedFile}
                width={240}
                height={240}
                border={20}
                scale={1.2}
                className="mx-auto rounded-lg shadow-lg"
              />
              <button
                onClick={handleUpload}
                className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                Upload
              </button>
            </div>
          )}

          {/* User Details Section */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-sm sm:text-base text-gray-700 mb-2">@{user.username}</p>
            <p className="text-sm sm:text-base text-gray-700 mb-4">{user.email}</p>
          </div>

          {/* Order History Section */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-6">Order History</h2>
          <Suspense fallback={<p className="text-center text-lg text-gray-600">Loading orders...</p>}>
            {orders.length === 0 ? (
              <p className="text-center text-lg text-gray-600">You have no orders yet.</p>
            ) : (
              orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </Suspense>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/about"
              className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              <FaInfoCircle className="mr-2" />
              About Us
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 hover:bg-gradient-to-l hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              <FaEnvelope className="mr-2" />
              Contact Us
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:bg-gradient-to-l hover:from-red-600 hover:to-red-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg">No user data found.</p>
      )}
    </div>
  );
};

export default Profile;