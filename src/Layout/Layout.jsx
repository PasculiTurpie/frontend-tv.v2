import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Layout.css";
import { UserContext } from "../components/context/UserContext";

const Layout = () => {
    const { isAuth  } = useContext(UserContext);


    return (
        <>
            <Header />
            <Nav />
            <div className="outlet__main">
                {/* {isAuth  && <Sidebar />} */}
                <Sidebar />

                <Outlet />
            </div>
            <Footer />
        </>
    );
};

export default Layout;
