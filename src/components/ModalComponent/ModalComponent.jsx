import "./ModalComponent.css";
import Close from '../../../public/images/close.svg'

const ModalComponent = ({modal, setModal}) => {

    const handleCloseModal = () =>{
        setModal(false)
    }


    return (
        <>
            <div className={modal ? 'container__modal-component' : 'container__modal-component-close'}>
            
                <form className="form__modal-component">
                <img className="modal__close" src={Close} alt="close" onClick={handleCloseModal} />

                <h4>Titulo</h4>
                    <div className="form__group">
                        <label
                            htmlFor="satelliteName"
                            className="form__group-label"
                        >
                            Nombre de Satélite
                            <br />
                            <input
                                type="text"
                                className="form__group-input"
                                placeholder="Nombre"
                                name="satelliteName"
                            />
                        </label>
                        <div className="form__group-error"></div>
                    </div>
                    <div className="form__group">
                        <label
                            htmlFor="satelliteName"
                            className="form__group-label"
                        >
                            Nombre de Satélite
                            <br />
                            <input
                                type="text"
                                className="form__group-input"
                                placeholder="Nombre"
                                name="satelliteName"
                            />
                        </label>
                        <div className="form__group-error"></div>
                    </div>
                     <button
                                type="submit"
                                className="button btn-primary"
                            >
                                Enviar
                            </button>
                </form>
            </div>
        </>
    );
};

export default ModalComponent;
