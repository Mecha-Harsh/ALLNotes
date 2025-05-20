import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Note{
  id:number
  title:string
  body:string
}

// Define the shape of your context
interface GlobalContextType {
  id: number;
  setId: React.Dispatch<React.SetStateAction<number>>;
  notes:Note[];
  setNotes:React.Dispatch<React.SetStateAction<Note[]>>;
}

// Create the context with a default value
export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Create a provider component
interface GlobalContextProviderProps {
  children: ReactNode;
}

export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({ children }) => {
  const [id, setId] = useState<number>(1);
  const [notes,setNotes] = useState<Note[]>([]);

  const value = {
    id,
    setId,
    notes,
    setNotes,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalContextProvider');
  }
  
  return context;
};