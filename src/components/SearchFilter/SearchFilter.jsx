import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import "../../components/Card/Card.css";
import "./SearchFilter.css";

const SearchFilter = () => {
  const [querySearch] = useSearchParams();
  const keyword = querySearch.get("keyword");

  const [dataSearch, setDataSearch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const navigate = useNavigate();

  const dataSearchInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.searchFilter(keyword);

      if (response.data.length > 0) {
        setDataSearch(response.data);
        setNoResults(false);
        setHasError(false);
      } else {
        setDataSearch([]);
        setNoResults(true);
        setHasError(false);
      }
    } catch (error) {
      console.error("Error al obtener las señales:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (keyword && keyword.trim() !== "") {
      dataSearchInfo();
    } else {
      setDataSearch([]);
      setNoResults(true);
      setIsLoading(false);
    }
  }, [querySearch]);

  const handleClick = (e) => {
    const card = e.target.closest(".card__container");
    const id = card?.dataset.id;
    if (id) {
      navigate(`/signal/${id}`);
    }
  };

  return (
      <div className="container">
        {isLoading ? (
          <Loader message="Cargando y conectando con el servidor..." />
        ) : hasError ? (
          <p className="error__data">
            Error al conectar. Comuníquese con el administrador.
          </p>
        ) : noResults ? (
          <p className="error__data">
            No se encontraron resultados para: <strong>{keyword}</strong>
          </p>
        ) : (
          <>
   <div className="container__search">

            <span className="search__register">
              {dataSearch.length > 1
                ? `Se encontraron ${dataSearch.length} registros`
                : `Se encontró ${dataSearch.length} registro`}
            </span>
            <div className="card__list">

            {dataSearch.map((signalItem) => (
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
            ))}
            </div>

   </div>
            
      
          </>
        )}
    </div>
  );
};

export default SearchFilter;
