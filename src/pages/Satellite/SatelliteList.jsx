import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Satellite.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import Swal from "sweetalert2";

export const SatelliteList = () => {
    const [satellites, setSatellites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const parentElement = useRef(null)

    const getAllSatellites = () => {
        axios
            .get(`http://localhost:3000/api/v2/satellite`)
            .then((response) => {
                setSatellites(response.data);
                setIsLoading(false); // <- mover aquí
            })
            .catch((error) => {
                console.error("Error al obtener los satélites:", error);
                setIsLoading(false); // también en caso de error
            });
    }

    useEffect(() => {
        getAllSatellites()
    }, []);

    const deleteSatellite = async () => {
        const id = parentElement.current.id;

        const result = await Swal.fire({
            title: "¿Estás seguro de eliminar el registro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/api/v2/satellite/${id}`);
                await Swal.fire({
                    title: "¡Eliminado!",
                    text: "El registro ha sido eliminado",
                    icon: "success"
                });
                getAllSatellites(); // Refresca la lista después de confirmar
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al eliminar el registro",
                    icon: "error"
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {satellites.map((satellite) => (
                                <tr key={satellite._id} id={satellite._id} ref={parentElement }>
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
                                        <button className="button btn-primary">
                                            Editar
                                        </button>
                                        <button className="button  btn-danger" onClick={deleteSatellite}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                )}
            </div>
        </>
    )
}