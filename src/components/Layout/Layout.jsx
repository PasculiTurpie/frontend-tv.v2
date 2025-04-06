import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Nav from "../Nav/Nav";
import './Layout.css'
import SideBarLeft from "../SideBarLeft/SideBarLeft";

const Layout = () => {
    return (
        <>
            <Header />
            <Nav />
            <div className='container-main'>

            <SideBarLeft />
            <Outlet />
            </div>
            <Footer />
        </>
    );
};

export default Layout;
