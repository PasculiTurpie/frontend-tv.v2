import React, { useEffect, useState } from "react";
import "./Card.css";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../../utils/api'
import Loader from '../../components/Loader/Loader';

const Card = () => {
    const navigate = useNavigate();
    const location = useLocation()


    const [signalTv, setSignalTv] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const getAllSignal = async () => {
        try {
            const response = await api.getSignal();
            if (response.data.length > 0) {
                setSignalTv(response.data);
                setHasError(false);
            } else {
                setHasError(true); // No se encontraron datos
            }
        } catch (error) {
            console.error("Error al obtener las señales:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshList()
    }, []);

    const refreshList = () =>{
        getAllSignal()
    }

    const handleclick = (e) => {
        const card = e.target.closest(".card__container"); // busca el contenedor más cercano
        const id = card?.dataset.id;
        if (id) {
            navigate(`/signal/${id}`); // redirige a otra vista
        }
    };

    return (
        <>
            {isLoading ? (
                <Loader message="Cargando y conectando con el servidor..." />
            ) : hasError ? (
                <p className="error__data">
                    No se encuentran datos. Comuníquese con el administrador.
                </p>
            ) : (
                signalTv.map((signalItem, index) => (
                    <div
                        className="card__container"
                        key={index}
                        data-id={signalItem._id}
                        onClick={handleclick}
                    >
                        <div className="card__group-item">
                            <h4 className="card__title">
                                {signalItem.nameChannel}
                            </h4>
                            <div className="card__number">
                                <h5 className="card__number-item">{`Norte: ${signalItem.numberChannelCn}`}</h5>
                                <h5 className="card__number-item">{`Sur: ${signalItem.numberChannelSur}`}</h5>
                            </div>
                        </div>
                        <img
                            className="card__logo"
                            src={signalItem.logoChannel}
                            alt="Logo del canal"
                        />
                        <div className="card__severidad">
                            <span>{signalItem.tipoTecnologia}</span><br />
                            <span>{`Severidad: ${signalItem.severidadChannel}`}</span>
                        </div>
                    </div>
                ))
            )}
        </>
    );
};

export default Card;
