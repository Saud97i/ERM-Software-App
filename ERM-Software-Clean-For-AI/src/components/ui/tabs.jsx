import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export function Tabs({ value, onValueChange, defaultValue, children }) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value !== undefined ? value : internal;
  const setSelected = onValueChange || setInternal;
  return (
    <TabsContext.Provider value={{ value: selected, onValueChange: setSelected }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected 
          ? "bg-background text-foreground shadow-sm" 
          : "hover:bg-background/50 hover:text-foreground"
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const { value: selectedValue } = useContext(TabsContext);
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}