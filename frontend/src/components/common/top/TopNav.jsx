import { NavLink } from "react-router-dom";
import { useState } from "react";
import LoginPopup from "./LoginPopup.jsx";
import "./TopNav.css";
import {logout} from "../../../api/auth.js";

const TopNav = ({ isAdmin, setIsAdmin }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const togglePopup = () => setIsPopupOpen(prev => !prev);
    const closePopup = () => setIsPopupOpen(false);

    const handleLogout = async () => {
        try {
            await logout();
            setIsAdmin(false);
        } catch (err) {
            console.error("로그아웃 실패", err);
            alert("로그아웃 실패");
        }
    };

    return (
        <>
            <nav className="top-nav-container crimson-text-regular">
                <div className="top-nav">
                    <div className="top-nav__logo" tabIndex={0}>Logo</div>
                    <ul className="top-nav__menu">
                        <li className="top-nav__item">
                            <NavLink to="/" className={({isActive}) => `top-nav__link ${isActive ? "active" : ""}`}>
                                Home
                            </NavLink>
                        </li>
                        {/* <li className="top-nav__item">
                            <NavLink to="/about" className={({isActive}) => `top-nav__link ${isActive ? "active" : ""}`}>
                                About
                            </NavLink>
                        </li> */}
                        <li className="top-nav__item">
                            <NavLink to="/post" className={({isActive}) => `top-nav__link ${isActive ? "active" : ""}`}>
                                Post
                            </NavLink>
                        </li>
                        {/* <li className="top-nav__item">
                            <NavLink to="/archive" className={({isActive}) => `top-nav__link ${isActive ? "active" : ""}`}>
                                Archive
                            </NavLink>
                        </li> */}
                        <li className="top-nav__item">
                            <NavLink to="/board" className={({isActive}) => `top-nav__link ${isActive ? "active" : ""}`}>
                                Board
                            </NavLink>
                        </li>
                    </ul>

                    {isAdmin ? (
                        <button onClick={handleLogout} className="top-nav__admin-btn">
                            <span className={'noto-sans-kr-regular'} style={{ fontSize: '0.7em' }}>로그아웃</span>
                        </button>
                    ) : (
                        <button
                            className={`top-nav__admin-btn ${isPopupOpen ? "open" : ""}`}
                            aria-label="Admin menu"
                            aria-expanded={isPopupOpen}
                            onClick={togglePopup}
                        >
                            <i className="bi bi-asterisk" aria-hidden="true"></i>
                        </button>
                    )}
                </div>
            </nav>

            <LoginPopup isOpen={isPopupOpen} onClose={closePopup}
                onLoginSuccess={() => {
                    setIsAdmin(true);
                    closePopup();
                }}
            />
        </>
    );
};

export default TopNav;
