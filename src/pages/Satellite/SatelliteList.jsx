import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../index.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import Swal from "sweetalert2";
import ModalForm from "../../components/ModalForm/ModalForm";




export const SatelliteList = () => {
    const [satellites, setSatellites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemId, setItemId] = useState('')



    const getAllSatellites = () => {
        axios
            .get(`http://localhost:3000/api/v2/satellite`)
            .then((response) => {
                setSatellites(response.data);
                setIsLoading(false); // <- mover aquí
            })
            .catch((error) => {
                console.log(`Error: ${error.response.data.message}`);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `${error.response.data.message}`,
                    footer: '<a href="#">Contactar a administrador</a>'
                  });
                setIsLoading(false); // también en caso de error
            });
    };

    useEffect(() => {
        refreshList();
    }, []);

    const refreshList = () => {
        getAllSatellites();
    }

    const deleteSatellite = async (id) => {
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
                await axios.delete(
                    `http://localhost:3000/api/v2/satellite/${id}`
                );
                getAllSatellites(); // Refresca la lista después de confirmar
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

    const showModal = (id) => {
        console.log(id)
        setItemId(id)
        setIsModalOpen(true);
    };
    
    const handleOk = () => {
        setIsModalOpen(false);
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Registro actualizado",
            showConfirmButton: false,
            timer: 1500
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };



    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/satelite">Formulario</Link>
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
                    {satellites.length}
                </p>
                {isLoading ? (
                    <div className="loader__spinner">
                        <Loader />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre satelite</th>
                                <th>Tipo de polarización</th>
                                <th>Url Web</th>
                                <th className="action">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {satellites.map((satellite) => (
                                <tr key={satellite._id} id={satellite._id}>
                                    <td>{satellite.satelliteName}</td>
                                    <td>
                                        {
                                            satellite.satelliteType
                                                .typePolarization
                                        }
                                    </td>
                                    <td>
                                        <Link
                                            to={satellite.satelliteUrl}
                                            target="_blank"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                    <td className="button-action">
                                        <button
                                            className="button btn-primary"
                                            onClick={() => { showModal(satellite._id)}}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="button btn-danger"
                                            onClick={() =>
                                                deleteSatellite(satellite._id)
                                            }
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
            {isModalOpen && (
                <ModalForm isModalOpen={isModalOpen} itemId={itemId} handleOk={handleOk} handleCancel={handleCancel} refreshList={refreshList}
                />
            )}
        </>
    );
};
