import { createContext, useState } from "react";


export const UserContext = createContext();



export const UserProvider = (props) => {
  const [user, setUser] = useState({
    name: "Jorge Sepúlveda", profilePicture:"https://media.licdn.com/dms/image/v2/D4E03AQHNis1IfH_fsw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725648714099?e=1750896000&v=beta&t=uLT2rKQ9zh74Tr08P5QhPEWgfqcUM9AMH0rqwoYyjao", email: "jorge.sepulveda@grupogtd.com", role: "admin"
  })

  return (
    <UserContext.Provider value={{user, setUser}}>
      {props.children}
    </UserContext.Provider>
  )
}