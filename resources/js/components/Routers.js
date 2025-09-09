import React from 'react';
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Example from "./Example";
import Home from './home';
import Test from './test';
import Rap from './rap';


export default function Routers() {
  return (
    <Router>
        <Routes>
            <Route path="/example" element={<Example/>} />
            <Route path="/home" element={<Home/>} />
            <Route path="/test" element={<Test/>} />
            <Route path="/rap" element={<Rap/>} />
        </Routes>
    </Router>
  )
}

if(document.getElementById("root")) {
  console.log('React mounting Routers into #root');
  ReactDOM.render(<Routers />, document.getElementById("root"));
}