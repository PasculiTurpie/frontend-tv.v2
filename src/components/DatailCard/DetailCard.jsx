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
        navigate(-1);
    };
    return (
        <>
            <div className="container__card-detail">
                <div className="card-detail-container">
                    <button
                        className="button-back btn-warning"
                        onClick={handleBackSubmit}
                    >
                        ← Volver
                    </button>

                    <div className="card-detail-header">
                        <img
                            className="card__detail-logo"
                            src={DetailCard.logoChannel}
                            alt="Logo Canal"
                        />
                        <h3 className="card-detail-title">
                            {DetailCard.nameChannel}
                        </h3>
                    </div>

                    <div className="card__detail-numbers">
                        <span>
                            <strong>Norte:</strong>{" "}
                            <span className="card__detail-info">{DetailCard.numberChannelCn}</span>
                        </span>
                        <span>
                            <strong>Sur:</strong>{" "}
                            <span className="card__detail-info">{DetailCard.numberChannelSur}</span>
                        </span>
                    </div>
                    <div className="card__detail-numbers">
                        <span>
                            <strong>Tecnología:</strong>{" "}
                            <span className="card__detail-info">{DetailCard.tipoTecnologia}</span>
                        </span>
                        <span>
                            <strong>Severidad:</strong>{" "}
                            <span className="card__detail-info">{DetailCard.severidadChannel}</span>
                        </span>
                    </div>

                    <div className="card__detail-button">
                        {DetailCard.contact?.length > 0 && (
                            <button
                                className="button btn-success"
                                onClick={openModal}
                            >
                                Contacto
                            </button>
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
                    <h1 className="modal-contact__title">Contacto proveedor</h1>
                    <table className="modal-contact__table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr
                                    key={contact._id}
                                    className="modal-contact__row"
                                >
                                    <td>{contact.nombreContact}</td>
                                    <td>{contact.telefono}</td>
                                    <td>{contact.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            </ModalContact>
        </>
    );
};

export default DetailCard;
