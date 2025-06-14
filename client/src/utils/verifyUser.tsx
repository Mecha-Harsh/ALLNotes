// utils/useVerifyUser.ts
import { useCallback } from "react";
import getAuthToken from "./getToken";
import { useGlobalContext } from "../Context/context";
import { supabase } from "../supabase/supabase";

export const useVerifyUser = () => {
  const { userId, setUserId,setUserD} = useGlobalContext();

  const verifyUser = useCallback(async (): Promise<string | null> => {
    console.log('Current userId:', userId);
    
    if (userId === "Guest" || !userId) {
      try {
        
        const token = getAuthToken() ?? "";
        console.log('Token:', token);
        
        if (!token) {
          console.log("No token found");
          return null;
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
          console.log("Token verification failed:", error);
          setUserId("Guest");
          return null;
        }

        if (user?.id) {
          setUserId(user.id);
          return user.id;
        } else {
          setUserId("Guest");
          return null;
        }
      } catch (error) {
        console.log("Please log in!", error);
        setUserId("Guest");
        return null;
      }
    }
    
    // If userId is already set and not "Guest", return it
    return userId;
  }, [userId, setUserId]);

  return verifyUser;
};