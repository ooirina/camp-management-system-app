import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🏕️ CampManager</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/tabere">Tabere</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/activitati">Activități</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/participanti">Participanți</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inscrieri">Înscrieri</Link>
            </li>
            <li className="nav-item ms-lg-3">
              <Link className="btn btn-primary btn-sm mt-1" to="/inscrieri/nou">
                ➕ Înscriere Nouă
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;