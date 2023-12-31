import React from "react";
import './NavTab.css';

function NavTab () {
    return (
        <nav className="navigation">
            <a className="navigation__link" href='#about-project'>О проекте</a>
            <a className="navigation__link" href='#techs'>Технологии</a>
            <a className="navigation__link" href='#about-me'>Студент</a>
        </nav>
    )
}

export default NavTab;