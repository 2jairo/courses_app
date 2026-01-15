import type { ReactNode } from "react";
import { UserContext, useCreateUserContext } from "./createUserContext";

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const value = useCreateUserContext()
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}