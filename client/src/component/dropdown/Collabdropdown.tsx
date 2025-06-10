import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../../Context/context";
import getAuthToken from "../../utils/getToken";

const Collabdropdown = () => {
  const{id,userId} = useGlobalContext();
  const [email, setEmail] = useState<string>("");
  const [verifiedEmail, setVerifiedEmail] = useState<string[]>([]);
  const  navigate = useNavigate();

  const startCollab = () => {
    const url = `/collab?id=${encodeURIComponent(id)}`;
    console.log("the people was invited!!");
    window.open(url, '_blank');
  };
  
  const handleClick = async(e: React.FormEvent) => {
    const token = getAuthToken();
    e.preventDefault();
    
    try {
      const response =  await axios.get("http://localhost:8080/verifyMail", { params: { email: email , note_id:id} , headers:{'Authorization': `Bearer ${token}`}} );
      if (response.status !== 200) {
        alert("user is not registered or invalid mail");
        return;
      } else {
        console.log("recieved data",response.data["id"]);
        if (email && !verifiedEmail.includes(email)) {
          setVerifiedEmail(prev => [...prev, email]);
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        alert("user is not registered or invalid mail");
        return;
      } else {
        console.error(error);
      }
    }
    
    setEmail(""); 
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleClick} className="flex flex-col gap-2 items-start">
        {/* Email List */}
        {verifiedEmail.length > 0 && (
          <ul className="mb-2 list-disc pl-5">
            {verifiedEmail.map((elem, idx) => (
              <li key={idx} className="text-sm text-white-800">{elem}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 items-center">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter collaborator email"
            className="border rounded px-2 py-1"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Add
          </button>
          <button type="submit" onClick={startCollab}>
            Send Invites
          </button>
        </div>
      </form>
    </div>
  );
};

export default Collabdropdown;
