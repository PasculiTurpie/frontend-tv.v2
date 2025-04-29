import React from 'react'
import { Navigate, Route } from 'react-router-dom'

const ProtectedRoute = ({ children, isAuth, ...props }) => {

  
  return (
    <>
      <Route {...props}>
        {isAuth ? children : <Navigate to={'/login'} />}
      </Route>
    </>
  )
}

export default ProtectedRoute