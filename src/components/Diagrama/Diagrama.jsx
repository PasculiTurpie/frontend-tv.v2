import React from 'react'

const Diagrama = ({ id }) => {
  id='23423452345235'

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