import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import "../../components/Card/Card.css";

const SearchFilter = () => {
    const [querySearch] = useSearchParams();
    const keyword = querySearch.get("keyword");
    const [dataSearch, setDataSearch] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const navigate = useNavigate()

    console.log(keyword)
    const dataSearchInfo = async () => {
        try {
            const response = await api.searchFilter(keyword);
            if (response.data.length > 0) {
                console.log(response.data)
                setDataSearch(response.data);
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
        dataSearchInfo();
    }, [querySearch]);

    const handleclick = (e) => {
        const card = e.target.closest(".card__container"); // busca el contenedor más cercano
        const id = card?.dataset.id;
        if (id) {
            navigate(`/signal/${id}`); // redirige a otra vista
        }
    };

    return (
        <>
        <p>Coincidencias: {dataSearch.length} </p>
        <div className="container__cards">

            {isLoading ? (
                <Loader message="Cargando y conectando con el servidor..." />
            ) : hasError ? (
                <p className="error__data">
                    No se encuentran datos. Comuníquese con el administrador.
                </p>
            ) : (
                dataSearch.map((signalItem, index) => (
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
                            <span>{signalItem.tipoTecnologia}</span>
                            <br />
                            <span>{`Severidad: ${signalItem.severidadChannel}`}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
        </>
    );
};
export default SearchFilter;
