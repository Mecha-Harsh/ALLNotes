import React from 'react';
import userIcon from '/user_icon.png'; // adjust the path if needed
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabase';
import { deleteAllUserNotes } from '../../IndexDB/db';
import { useGlobalContext } from '../../Context/context';

export const Navbar = () => {
  
  const {userId} = useGlobalContext();
  const navigate = useNavigate();

  const handleLogin=()=>{
    navigate('/login');
  }

  const handleDelete = ()=>{
    console.log(userId);
    deleteAllUserNotes(userId);
  }

  const handleProfile=()=>{
    navigate('/profile');
  }

    const handleLogOut=async()=>{
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      // Optionally refresh the page or invalidate the cache
      navigate('/'); // Example: Redirect to a logout page
    }
  }

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow-md">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>

      {/* User Icon with Dropdown */}
      <div className="relative group">
        <img
          src={userIcon}
          alt="User icon"
          className="w-8 h-8 rounded-full cursor-pointer"
        />

        {/* Dropdown */}
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
          <ul className="py-1 text-sm text-gray-700">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleProfile}>Profile</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogOut}>Logout</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogin}>Login</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleDelete}>Delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
