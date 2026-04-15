"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoginDialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialogContext = createContext<LoginDialogContextType | undefined>(
  undefined
);

export const useLoginDialogContext = () => {
  const context = useContext(LoginDialogContext);
  if (!context) {
    throw new Error(
      "useLoginDialogContext must be used within LoginDialogProvider"
    );
  }
  return context;
};

export const LoginDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <LoginDialogContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </LoginDialogContext.Provider>
  );
};
