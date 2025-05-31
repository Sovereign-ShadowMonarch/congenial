// imports
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { LandingPage, Login, Register, Dashboard, About, Coin } from "./pages";

// export the router
export default (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/:coin" element={<Coin />} />
    </Routes>
  </Router>
);
