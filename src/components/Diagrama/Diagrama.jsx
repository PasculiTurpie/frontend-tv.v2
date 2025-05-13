import React from 'react'
import { useParams } from 'react-router-dom'

const Diagrama = ({ id }) => {

  const {params} = useParams()
console.log(params)

  useEffect(() => {
    axios.get(`http://localhost:3000/api/v2/signal/${id}`)
      console.log(id)
      .then((response) => {
        console.log(response.data)
        setSignalTv(response.data)
      })
  }, [])

  return (
    <>

    </>
  )
}

export default Diagrama