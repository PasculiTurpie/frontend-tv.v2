import { Link } from 'react-router-dom'
import api from '../../utils/api.js'
import { useEffect, useState } from 'react'
import Loader from '../../components/Loader/Loader'

const ListarDcm = () => {

  const [dcms, setDcms] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  const getAllDcm = () => {
    api.getDcm()
      .then((res)=> {
        console.log(res.data)
        setDcms(res.data)
        setIsLoading(false);
      })
    .catch((error) => {
                    console.log(error);
                    console.log(`Error: ${error.message}`);
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: `${error.message}`,
                        footer: '<a href="#">Contactar a administrador</a>',
                    });
                    setIsLoading(false); // también en caso de error
                });
  }
  useEffect(() => {
    refreshList()
  },[])

  const refreshList = () => {
    getAllDcm();
  };


  return (
    <>
    <div className="outlet-main">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/dcm">Formulario</Link>
                            </li>
                            <li
                                className="breadcrumb-item active"
                                aria-current="page"
                            >
                                Listar
                            </li>
                        </ol>
                    </nav>
                    <p className="">
                        <span className="total-list">Total items: </span>
                        {dcms.length}
        </p>
        {isLoading ? (
          <div className="loader__spinner">
            <Loader />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Marca Ird</th>
                <th>Multicast salida</th>
                <th>Ip de gestión</th>
                <th className="action">Acciones</th>
              </tr>
            </thead>
            <tbody>
                {dcms.map((dcm) => (
                  <tr key={dcm._id} id={dcm._id}>
                    <td>{dcm.nombreDcm}</td>
                    <td>{dcm.mcastOut }</td>
                  <td>
                    <Link
                        to={`http://${dcm.ipGestion}`}
                      target="_blank"
                    >
                        {dcm.ipGestion}
                    </Link>
                  </td>
                  <td className="button-action">
                    <button
                      className="button btn-primary"
                      /* onClick={() => {
                        showModal(dcm._id);
                      }} */
                    >
                      Editar
                    </button>
                    <button
                      className="button btn-danger"
                      /* onClick={() =>
                        deleteEncoderIrd(dcm._id)
                      } */
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
    </>
  )
}

export default ListarDcm