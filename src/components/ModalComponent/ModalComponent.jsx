import "./ModalComponent.css";
import Close from "../../../public/images/close.svg";
import { Form } from "formik";

const ModalComponent = ({
    modalOpen,
    title,
    setModalOpen,
    handleOk,
    handleCancel,
    children,
}) => {
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <>
            <div
                className={
                    modalOpen
                        ? "container__modal-component show__modal"
                        : "container__modal-component close__modal"
                }
            >
                <div className="form__modal-component">

                <div className="modal__title">
                    <h4>{title}</h4>
                </div>
                <img
                    className="modal__close"
                    src={Close}
                    alt="close"
                    onClick={handleCloseModal}
                />
                {children}

                </div>

                </div>
        </>
    );
};

export default ModalComponent;
