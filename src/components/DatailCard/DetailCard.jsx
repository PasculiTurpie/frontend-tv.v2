import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./DetailCard.css";
import api from "../../utils/api";
import ModalContact from "./ModalContact";

const DetailCard = () => {
    const { id } = useParams();
    const [DetailCard, setDetailCard] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const [contacts, setContacts] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        api.getIdSignal(id).then((response) => {
            setDetailCard(response.data);
            console.log(response.data);
            setContacts(response.data.contact);
        });
    }, []);

    console.log(contacts);

    const handleClickDiagram = () => {
        navigate(`/diagrama/${id}`);
    };
    const handleBackSubmit = () => {
        navigate(`/`);
    };
    return (
        <>
            <div className="container__card-detail">
                <div className="card-detail-container">
                    <button
                        className="button-back button btn-warning"
                        onClick={handleBackSubmit}
                    >
                        Volver
                    </button>
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
                        {!DetailCard.contact?.length == 0 ? (
                            <button
                                className="button btn-success"
                                onClick={openModal}
                            >
                                Contacto
                            </button>
                        ) : (
                            ""
                        )}

                        <button
                            onClick={handleClickDiagram}
                            className="button btn-primary"
                        >
                            Ver mapa
                        </button>
                    </div>
                </div>
            </div>
            <ModalContact isOpen={isModalOpen} onClose={closeModal}>
                <>
                    <h1 className="form__titulo">Contacto proveedor</h1>
                    <table>
                        <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Telefono</th>
                                        <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                    {contacts.map((contact) => {
                        return (
                           
                                
                                    <tr className="background__tr">
                                        <td>{contact.nombreContact}</td>
                                        <td>{contact.telefono}</td>
                                        <td>{contact.email}</td>
                                    </tr>
                              
                            
                        );
                    })}
                        </tbody>
                        </table>
                        </>
            </ModalContact>
        </>
    );
};

export default DetailCard;
