import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Layout from "./Layout/Layout";

const App = () => {
    return (
        <>
            
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />
                </Route>
            </Routes>
            
        </>
    );
};

export default App;
