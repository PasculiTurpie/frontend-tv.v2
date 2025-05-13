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
import RegisterUser from "./components/User/RegisterUser";
import ListarUsers from "./components/User/ListarUsers";
import Login from "./components/Login/Login";
import AddSignal from "./pages/AddSignal/AddSignal";
import DetailCard from "./components/DatailCard/DetailCard";

const App = () => {


    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Login />} />

                    <Route
                        path="/satelite"
                        element={
                            <ProtectedRoute >
                                <SatelliteForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/listar-satelite"
                        element={
                            <ProtectedRoute >
                                <SatelliteList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ird"
                        element={
                            <ProtectedRoute >
                                <IrdForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/listar-ird"
                        element={
                            <ProtectedRoute >
                                <IrdListar />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/registrar-user"
                        element={
                            <ProtectedRoute >
                                <RegisterUser />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/listar-user"
                        element={
                            <ProtectedRoute >
                                <ListarUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/signal"
                        element={
                            
                                <AddSignal />
                            
                        }
                    />
                    <Route
                        path="/signal/:id"
                        element={

                            <DetailCard />

                        }
                    />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};
export default App;
