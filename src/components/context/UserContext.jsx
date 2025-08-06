import { createContext, useState } from "react";


export const UserContext = createContext();



export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [isAuth, setIsAuth] = useState(false)

  return (
    <UserContext.Provider value={{user, setUser, isAuth, setIsAuth}}>
      {children}
    </UserContext.Provider>
  )
}