import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import './Diagram.css'

const Diagrama = () => {

  const {id} = useParams()
   const [nodes, setNodes] = useState([])
   const navigate = useNavigate()

   useEffect(() => {
          axios
              .get(`http://localhost:3000/api/v2/signal/${id}`)
              .then((response) => {
                  setNodes(response.data.equipos);
              });
      }, []);

      const handleSubmitBack = () => {
        navigate(`/signal/${id}`)
      }
 
  return (
    <>
    <div className="container__diagram">

      <h1>Diagrama</h1>
      
        <button className='button btn-danger' onClick={handleSubmitBack}>volver</button>
    </div>
      

    </>
  )
}

export default Diagrama