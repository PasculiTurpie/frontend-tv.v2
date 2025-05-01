import { Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import NotFound from "./pages/NotFound/NotFound";
import SatelliteForm from "./pages/Satellite/SatelliteForm";
import { SatelliteList } from "./pages/Satellite/SatelliteList";
import IrdForm from "./pages/Ird/IrdForm";
import IrdListar from "./pages/Ird/IrdListar";
import { useContext } from "react";
import { UserContext } from "./components/context/UserContext";
import RegisterUser from "./components/User/RegisterUser";
import ListarUsers from "./components/User/ListarUsers";
import Login from "./components/Login/Login";

const App = () => {
    const { isAuth } = useContext(UserContext);

    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/satelite"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <SatelliteForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/listar-satelite"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <SatelliteList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ird"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <IrdForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/listar-ird"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <IrdListar />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/registrar-user"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <RegisterUser />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/listar-user"
                        element={
                            <ProtectedRoute isAuth={isAuth}>
                                <ListarUsers />
                            </ProtectedRoute>
                        }
                    />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};
export default App;
