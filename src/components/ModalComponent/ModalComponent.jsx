import "./ModalComponent.css";
import Close from '../../../public/images/close.svg'

const ModalComponent = ({ isModalOpen, title, setIsModalOpen, handleOk, handleCancel, children }) => {

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }


    return (
        <>
            <div className={isModalOpen ? 'container__modal-component' : 'container__modal-component-close'}>
                <form className="form__modal-component">
                    
                    <div className="modal__title">
                        <h4>{ title }</h4>
                </div>
                    <img className="modal__close" src={Close} alt="close" onClick={handleCloseModal} />
                    {children}
                    <button
                        type="submit"
                        className="button btn-primary btn-adjust"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </>
    );
};

export default ModalComponent;
