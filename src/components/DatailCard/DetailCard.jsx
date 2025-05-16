import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./DetailCard.css";

const DetailCard = () => {
    const { id } = useParams();
    const [DetailCard, setDetailCard] = useState({});
    const navigate = useNavigate()
     const location = useLocation()


    useEffect(() => {
        axios
            .get(`http://localhost:3000/api/v2/signal/${id}`)
            .then((response) => {

                setDetailCard(response.data);
            });
    }, []);

    const handleClickDiagram = ()=>{
       navigate(`/diagrama/${id}`)
    }
    const handleBackSubmit = () => {
        navigate(`/`);
    }
    return (
        <>
            <div className="container__card-detail">
                <div className="card-detail-container">
                    <button className="button-back button btn-warning" onClick={handleBackSubmit}>Volver</button>
                    <div className="card-detail-header">
                        <img
                            className="card__detail-logo"
                            src={DetailCard.logoChannel}
                        ></img>
                        <h3 className="card-detail-title">
                            {DetailCard.nameChannel}
                        </h3>
                    </div>
                    <div className="card__detail-numbers">
                        <span>Número Cn: {DetailCard.numberChannelCn}</span>
                        <span>Número Sur: {DetailCard.numberChannelSur}</span>
                    </div>
                    <p>{DetailCard.tipoTecnologia}</p>
                    <p>Severidad: {DetailCard.severidadChannel}</p>
                    <div className="card__detail-button">
                        <button className="button btn-success">Contacto</button>
                        <button onClick={handleClickDiagram} className="button btn-primary">Ver mapa</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetailCard;
