import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import Message from '../messages/pages/Home';
import SidebarNav from "./SidebarNav";

const ChatOfUser = (props) => {

    return (
        <>
            <style>{`
                .eco-page-bg {
                    background-color: #F8FAFC;
                    min-height: calc(100vh - 70px);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    display: flex;
                    flex-direction: column;
                }

                .wrapper { display: flex; align-items: stretch; width: 100%; flex-grow: 1; }
                
                #sidebar.sidebar {
                    background-color: #ffffff !important; position: relative !important; align-self: stretch !important; 
                    min-height: 100% !important; width: 260px !important; min-width: 260px !important; max-width: 260px !important;
                    border-right: 1px solid #EEF2FF; z-index: 1000; top: auto !important; bottom: auto !important; height: auto !important; margin: 0 !important; transform: none !important;
                }

                .sidebar-content {
                    position: sticky !important; top: 70px !important; height: calc(100vh - 70px) !important;
                    overflow-y: auto !important; background-color: #ffffff !important; display: flex; flex-direction: column;
                }
                
                .sidebar-content::-webkit-scrollbar { width: 4px; }
                .sidebar-content::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; }

                .main { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
            `}</style>

            <Header authenticated={props.authenticated} currentUser={props.currentUser} onLogout={props.onLogout} />
            
            <div style={{ marginTop: "90px" }}></div>
            
            <main id="main" className="eco-page-bg">
                <div className="wrapper">
                    
                    <nav id="sidebar" className="sidebar js-sidebar">
                        <div className="sidebar-content js-simplebar">
                            <SidebarNav />
                        </div>
                    </nav>
                    
                    <div className="main">
                        <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                            
                            <Message authenticated={props.authenticated} currentUser={props.currentUser} onLogout={props.onLogout} />

                        </div>
                    </div>
                    
                </div>
            </main>
            
            <Footer />
        </>
    );
};

export default ChatOfUser;