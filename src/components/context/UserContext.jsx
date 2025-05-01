import { createContext, useState } from "react";


export const UserContext = createContext();



export const UserProvider = (props) => {
  const [user, setUser] = useState({})
  const [isAuth, setIsAuth] = useState(false)

  return (
    <UserContext.Provider value={{user, setUser, isAuth, setIsAuth}}>
      {props.children}
    </UserContext.Provider>
  )
}