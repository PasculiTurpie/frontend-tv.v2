import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Nav from "../Nav/Nav";
import './Layout.css'
import SideBarLeft from "../SideBarLeft/SideBarLeft";

const Layout = () => {
    return (
        <div className="layout-wrapper">
            <Header />
            <Nav />
            <div className="layout-content">
                <div className='container-main'>
                    <SideBarLeft />
                    <div className="outlet-container">
                        <Outlet />
                    </div>
                </div>
            <Footer />
            </div>
        </div>
    );
};

export default Layout;
