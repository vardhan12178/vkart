import React, { useEffect, useState } from 'react';
import axios from './axiosInstance'; 
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import { FaCamera } from 'react-icons/fa';

const Profile = ({ setIsLoggedIn }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editor, setEditor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setUser(response.data);
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

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!editor) return;

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
      } catch (err) {
        setError('Failed to upload profile image');
      }
    });
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="profile-container p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {user ? (
        <div className="profile-info bg-white p-6 shadow-lg rounded-lg relative">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={user.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <label htmlFor="file-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
              <FaCamera className="text-white text-2xl" />
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {selectedFile && (
            <>
              <AvatarEditor
                ref={(ref) => setEditor(ref)}
                image={selectedFile}
                width={250}
                height={250}
                border={50}
                scale={1.2}
              />
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mt-4"
              >
                Upload Profile Picture
              </button>
            </>
          )}
          <p className="text-xl font-semibold mb-2">Name: {user.name}</p>
          <p className="text-xl font-semibold mb-2">Username: {user.username}</p>
          <p className="text-lg mb-2">Email: {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mt-4"
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-center text-lg">No user found</p>
      )}
    </div>
  );
};

export default Profile;
