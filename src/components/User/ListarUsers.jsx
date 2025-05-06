import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader/Loader";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ModalForm from "../../components/ModalForm/ModalForm";

const ListarUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemId, setItemId] = useState('')

    const getAllUsers = () => {
        axios
            .get(`http://localhost:3000/api/v2/user`, { withCredentials: true })
            .then((response) => {
                console.log(response.data);
                setUsers(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(`${error}`);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `${error.response.data.message}`,
                    footer: '<a href="#">Contactar a administrador</a>',
                });
                setIsLoading(false);
            });
    };

    useEffect(() => {
        refreshList();
    }, []);

    const refreshList = () => {
        getAllUsers();
    };

    const deleteUser = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro de eliminar el registro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(
                    `http://localhost:3000/api/v2/user/${id}`, { withCredentials: true }
                );
                getAllUsers(); // Refresca la lista después de confirmar
                await Swal.fire({
                    title: "¡Eliminado!",
                    text: "El registro ha sido eliminado",
                    icon: "success",
                });
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire({
                    title: "Error",
                    text: "Hubo un problema al eliminar el registro",
                    icon: "error",
                });
            }
        }
    };



    const showModal = (id) => {
        console.log(id);
        setItemId(id);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Registro actualizado",
            showConfirmButton: false,
            timer: 1500,
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="outlet-main">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/registrar-user">Registrar Usuario</Link>
                        </li>
                        <li
                            className="breadcrumb-item active"
                            aria-current="page"
                        >
                            Listar
                        </li>
                    </ol>
                </nav>
                <p className="">
                    <span className="total-list">Total items: </span>
                    {users.length}
                </p>
                {isLoading ? (
                    <div className="loader__spinner">
                        <Loader />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Correo electrónico</th>
                                <th className="action">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} id={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td className="button-action">
                                        <button
                                            className="button btn-primary"
                                            onClick={() => {
                                                showModal(user._id);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="button btn-danger"
                                            onClick={() =>
                                                deleteUser(user._id)
                                            }
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {isModalOpen && (
                <ModalForm
                    isModalOpen={isModalOpen}
                    itemId={itemId}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                    refreshList={refreshList}
                />
            )}
        </>
    );
};

export default ListarUsers;
