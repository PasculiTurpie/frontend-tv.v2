import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Layout.css";

const Layout = () => {
    const userRole = localStorage.getItem("isLogin");
    console.log(userRole);

    return (
        <>
            <Header />
            <Nav />
            <div className="outlet__main">
                {userRole && <Sidebar />}

                <Outlet />
            </div>
            <Footer />
        </>
    );
};

export default Layout;
