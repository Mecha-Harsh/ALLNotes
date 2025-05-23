import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home.tsx';
import Login from './Pages/Login/Login.tsx';
import SignUp from './Pages/SignUp/SignUp.tsx';
import { Editor } from './Pages/Home/Editor.tsx';
import { TestPage } from './Pages/Test/test.tsx';
import './App.css';

// Fixed closing tag in Routes
const routes = (
  <Router>
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path="/edit/:id" element={<Editor />} /> Changed :Id to lowercase :id
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/test' element={<TestPage />} />
    </Routes> {/* Added closing slash */}
  </Router>
);

export const App = () => {
  return (
    <div>
      {routes}
    </div>
  );
};

export default App;