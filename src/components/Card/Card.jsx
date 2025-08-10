import React, { useEffect, useState } from "react";
import "./Card.css";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Loader from "../../components/Loader/Loader";

const Card = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [signalTv, setSignalTv] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageLoading, setImageLoading] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    
    const cardsPerPage = 12;

    const getChannels = () => {
        api.getChannelDiagram()
            .then((res) => {
                const data = res.data
                const signalsArray = data.map(item => item.signal);
            
        })
    }

    const getAllSignal = async () => {
        try {
            const res = await api.getChannelDiagram();
            const data = res.data
            const signalsArray = data.map(item => item.signal);
            if (signalsArray.length > 0) {
                const sortedData = signalsArray.sort((a, b) => {
                    const numA = Number(a.numberChannelSur);
                    const numB = Number(b.numberChannelSur);
                    return numA - numB;
                });

                setSignalTv(sortedData);
                setHasError(false);
            } else {
                setHasError(true);
            }
        } catch (error) {
            console.error("Error al obtener las señales:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAllSignal();
        getChannels()
    }, []);

    const handleClick = (e) => {
        const card = e.target.closest(".card__container");
        console.log(card?.dataset.id)
        const id = card?.dataset.id;
        console.log(id)
        if (id) {
            navigate(`/signal/${id}`);
        }
    };

    const handleImageLoad = (id) => {
        setImageLoading((prev) => ({ ...prev, [id]: false }));
    };

    const handleImageStartLoading = (id) => {
        setImageLoading((prev) => ({ ...prev, [id]: true }));
    };

    // Paginación
    const totalCards = signalTv.length;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = signalTv.slice(indexOfFirstCard, indexOfLastCard);
    

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    const tipoTv = signalTv.filter(currentCard => currentCard.tipoServicio === 'TV').length
    const tipoRadio = signalTv.filter(currentCard => currentCard.tipoServicio === 'Radio').length
    const element = signalTv.filter(current => current.tipoServicio === '')
    

    return (
        <>
            {isLoading ? (
                <div className="loader__charge">
                    <Loader message="Cargando y conectando con el servidor..." />
                </div>
            ) : hasError ? (
                <p className="error__data">
                    No se encuentran datos. Comuníquese con el administrador.
                </p>
            ) : (
                <div className="card__layout">
                            <h3>{totalCards} señales en total, {tipoTv} TV y {tipoRadio} Radios</h3>

                    <div className="card__grid">
                        {currentCards.map((signalItem) => {
                            const isImgLoading = imageLoading[signalItem._id];
                            return (
                                <div
                                    className="card__container"
                                    key={signalItem._id}
                                    data-id={signalItem._id}
                                    onClick={handleClick}
                                >
                                    <div className="card__group-item">
                                        <h4 className="card__title">{signalItem.nameChannel}</h4>
                                        <div className="card__number">
                                            <h5 className="card__number-item">{`Norte: ${signalItem.numberChannelCn}`}</h5>
                                            <h5 className="card__number-item">{`Sur: ${signalItem.numberChannelSur}`}</h5>
                                        </div>
                                    </div>

                                    <div className="card__image-wrapper">
                                        {isImgLoading && <div className="card__spinner" />}
                                        <img
                                            className="card__logo"
                                            src={signalItem.logoChannel}
                                            alt="Logo del canal"
                                            onLoad={() => handleImageLoad(signalItem._id)}
                                            onLoadStart={() => handleImageStartLoading(signalItem._id)}
                                            style={{ display: isImgLoading ? "none" : "block" }}
                                        />
                                    </div>

                                    <div className="card__severidad">
                                        <span>{signalItem.tipoTecnologia}</span>
                                        <br />
                                        <span>{`Severidad: ${signalItem.severidadChannel}`}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pagination">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            &laquo; Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(Math.max(0, currentPage - 3), currentPage + 2)
                            .map((page) => (
                                <button
                                    key={page}
                                    className={page === currentPage ? "active" : ""}
                                    onClick={() => paginate(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        <button onClick={nextPage} disabled={currentPage === totalPages}>
                            Siguiente &raquo;
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Card;
