import React, { createContext, useState, useContext } from 'react';

const DietaryContext = createContext();

export const DietaryProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    allergies: {},
    dietType: {},
    foodPreferences: {},
  });

  return (
    <DietaryContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </DietaryContext.Provider>
  );
};

export const useDietary = () => useContext(DietaryContext);
