import React, { useEffect, useId, useState } from 'react';
import userIcon from '/user_icon.png'; // adjust the path if needed
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/supabase';
import { deleteAllUserNotes } from '../../IndexDB/db';
import { useGlobalContext } from '../../Context/context';
import getAuthToken from '../../utils/getToken';
import { useVerifyUser } from '../../utils/verifyUser';
import useUpdateProfile from '../../utils/useUserUpdateProfile';
export const Navbar = () => {
  
  const {userD,userId,setUserId} = useGlobalContext();
  const navigate = useNavigate();
  const token = getAuthToken();
  const verifyUser = useVerifyUser();
  const updateProfile = useUpdateProfile();


  useEffect(()=>{
    if(userD.userName==="Guest"){
      updateProfile();
    }
    if(userId==="Guest"){
      (async()=>{
        const _uid = await verifyUser();
      setUserId(_uid ?? "Guest");
      })
    }
    console.log("Form navbar: ",userId,userD);
  },[]);

  const handleLogin=()=>{
    navigate('/login');
  }


  const handleProfile=()=>{
    navigate('/profile');
  }

  const navToHome=()=>{
    navigate('/');
  }
    const handleLogOut=async()=>{
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      // Optionally refresh the page or invalidate the cache
      navigate('/');
      window.location.reload();

    }
  }

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow-md">
      <h2 className="text-xl font-medium text-black py-2" onClick={navToHome}>Notes</h2>

      {/* User Icon with Dropdown */}
      <div className="relative group">
        <img
          src={userIcon}
          alt="User icon"
          className="w-8 h-8 rounded-full cursor-pointer"
        />

        
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
          <ul className="py-1 text-sm text-gray-700">
            { userId!=="Guest" &&
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleProfile}>Profile</li>}
            { userId!=="Guest" &&
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogOut}>Logout</li>}
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogin}>Login</li> 
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
