import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Satellite.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

export const SatelliteList = () => {
    const [satellites, setSatellites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`http://localhost:3000/api/v2/satellite`)
            .then((response) => {
                setSatellites(response.data);
                setIsLoading(false); // <- mover aquí
            })
        /* .catch((error) => {
            console.log("Error al obtener los satélites:", error);
            setIsLoading(false); // también en caso de error
        }); */
    }, []);

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
                                <tr key={satellite._id}>
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
                                            rel="noopener noreferrer"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                    <td className="button-action">
                                        <button className="button btn-primary">
                                            Editar
                                        </button>
                                        <button className="button  btn-danger">
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