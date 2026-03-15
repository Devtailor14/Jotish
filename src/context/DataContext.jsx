import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [mergedImage, setMergedImage] = useState(null);

  return (
    <DataContext.Provider value={{ employees, setEmployees, mergedImage, setMergedImage }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
