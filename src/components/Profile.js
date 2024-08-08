import React, { useEffect, useState, Suspense, lazy } from 'react';
import axios from './axiosInstance';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import { FaCamera, FaPen, FaEnvelope, FaInfoCircle } from 'react-icons/fa';


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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bars-spinner">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="profile-container mt-12 p-4 sm:p-8 max-w-5xl mx-auto bg-white rounded-lg shadow-2xl">
      {user ? (
        <div className="profile-info p-4 sm:p-8 bg-gray-100 rounded-lg shadow-lg relative">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
            <img
              src={user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              srcSet={`
                ${user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 1x,
                ${user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 2x
              `}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-lg"
              loading="lazy"
            />
            <label htmlFor="file-upload" className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-teal-500 p-2 sm:p-3 rounded-full cursor-pointer flex items-center justify-center transition-transform transform hover:scale-110">
              <FaCamera className="text-white text-sm sm:text-lg" />
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
                className="absolute top-2 right-2 bg-green-500 p-2 sm:p-3 rounded-full text-white flex items-center justify-center transition-transform transform hover:scale-110"
              >
                <FaPen className="text-sm sm:text-lg" />
              </button>
            )}
          </div>
          {selectedFile && (
            <>
              <AvatarEditor
                ref={(ref) => setEditor(ref)}
                image={selectedFile}
                width={320}
                height={320}
                border={50}
                scale={1.2}
                className="mb-4 sm:mb-6 mx-auto"
              />
              <button
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-5 rounded-lg transition duration-300"
              >
                Upload
              </button>
            </>
          )}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 break-words"><strong>Name:</strong> {user.name}</p>
            <p className="text-sm sm:text-lg text-gray-700 mb-2 break-words"><strong>Username:</strong> {user.username}</p>
            <p className="text-sm sm:text-lg text-gray-700 mb-4 break-words"><strong>Email:</strong> {user.email}</p>
          </div>
          <h2 className="text-gray-800 text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-4">Order History</h2>
          <Suspense fallback={<p className="text-center text-lg text-gray-600">Loading orders...</p>}>
            {orders.length === 0 ? (
              <p className="text-center text-lg text-gray-600">You have no orders yet.</p>
            ) : (
              orders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </Suspense>
          <div className="text-center mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/about" className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:bg-gradient-to-l hover:from-green-600 hover:to-green-500 text-white font-semibold py-2 sm:py-3 px-4 sm:px-5 rounded-lg transition duration-300">
              <FaInfoCircle className="mr-2 text-sm sm:text-lg" />
              About Us
            </Link>
            <Link to="/contact" className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 hover:bg-gradient-to-l hover:from-indigo-600 hover:to-indigo-500 text-white font-semibold py-2 sm:py-3 px-4 sm:px-5 rounded-lg transition duration-300">
              <FaEnvelope className="mr-2 text-sm sm:text-lg" />
              Contact Us
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:bg-gradient-to-l hover:from-red-600 hover:to-red-500 text-white font-semibold py-2 sm:py-3 px-4 sm:px-5 rounded-lg transition duration-300"
            >
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
