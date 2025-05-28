import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import api from "../../utils/api";
import Swal from "sweetalert2";

const IrdListar = () => {
    const [ird, setIrd] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getAllIrds = () => {
        api.getIrd()
            .then((res) => {
                console.log(res.data);
                setIrd(res.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                console.log(`Error: ${error.message}`);
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: `${error.message}`,
                            footer: '<a href="#">Contactar a administrador</a>'
                          });
                        setIsLoading(false); // también en caso de error
            });
    };

    useEffect(() => {
        getAllIrds();
    }, []);

    const deleteEncoderIrd = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro de eliminar el registro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
        });

        if (result.isConfirmed) {
            try {
                await api.deleteIrd(id)
                getAllIrds(); // Refresca la lista después de confirmar
                await Swal.fire({
                    title: "¡Eliminado!",
                    text: "El registro ha sido eliminado",
                    icon: "success",
                });
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al eliminar el registro",
                    icon: "error",
                });
            }
        }
    };

    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/ird">Formulario</Link>
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
                    {ird.length}
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
                            {ird.map((ird) => (
                                <tr key={ird._id} id={ird._id} >
                                    <td>{ird.marcaIrd}</td>
                                    <td>{ird.multicastReceptor}</td>
                                    <td>
                                        <Link
                                            to={`http://${ird.ipAdminIrd}`}
                                            target="_blank"
                                        >
                                            {ird.ipAdminIrd}
                                        </Link>
                                    </td>
                                    <td className="button-action">
                                        <button
                                            className="button btn-primary"
                                            onClick={() => {
                                                showModal(ird._id);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="button btn-danger"
                                            onClick={() => deleteEncoderIrd(ird._id)}
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
    );
};

export default IrdListar;
