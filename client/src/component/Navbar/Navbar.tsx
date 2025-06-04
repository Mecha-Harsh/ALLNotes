import React from 'react';
import userIcon from '/user_icon.png'; // adjust the path if needed

export const Navbar = () => {
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
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
           
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
