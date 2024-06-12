import './App.css';
import React, {createContext, useEffect, useState} from 'react';
import {Nav, Navbar, Container, Row, Col} from 'react-bootstrap';
import {BrowserRouter as Router, Routes, Route, Switch, Redirect, Link, Navigate, useNavigate} from 'react-router-dom';
import {About,Contact} from './Components/Info/Info';
import {NavBar, Home, MyItems} from './Components/Home/Home';
import {AllUsageActivity, MyUsageActivity, AllAdminActivity, MyAdminActivity} from './Components/Activity/Activity';
import { Register, LogIn, LogOut, ResetPassword } from './Components/User/User';
import {CheckIn, CheckOut, SetClean} from './Components/Update/Update';
import {AddItem, DeleteItemScan, DeleteItemSelect, AddRoom, DeleteRoom, AddUser, DeleteUser} from './Components/AddDelete/AddDelete';
import {getRoom, getMissingItems} from './DB/DB.js';
import logo from './Components/images/logo.png';

function App() {
  useEffect(() => {
    getRoom().then((room) => {
      localStorage.setItem("Room",room);
    })
    getMissingItems();
  });

  return (
    <Router>
    <div>
      <Container className="App">  
        <NavBar className="navbar"/>
        <div style={{ marginTop: '60px' }}> </div>
      </Container> 
    <div>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/check-in" element={<CheckIn/>}/>
      <Route path="/check-out" element={<CheckOut/>}/>
      <Route path="/add-item" element={<AddItem/>}/>
      <Route path="/delete-item-scan" element={<DeleteItemScan/>}/>
      <Route path="/delete-item-select" element={<DeleteItemSelect/>}/>
      <Route path="/add-room" element={<AddRoom/>}/>
      <Route path="/delete-room" element={<DeleteRoom/>}/>
      <Route path="/add-user" element={<AddUser/>}/>
      <Route path="/delete-user" element={<DeleteUser/>}/>
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/login" element={<LogIn/>}/>
      <Route path="/log-out" element={<LogOut/>}/>
      <Route path="/reset-pass" element={<ResetPassword/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/set-clean" element={<SetClean/>}/>
      <Route path="/my-items" element={<MyItems/>}/>
      <Route path="/my-usage" element={<MyUsageActivity/>}/>
      <Route path="/all-usage" element={<AllUsageActivity/>}/>
      <Route path="/my-admin" element={<MyAdminActivity/>}/>
      <Route path="/all-admin" element={<AllAdminActivity/>}/>
    </Routes>
    </div>
    </div>
    </Router>
  );
}

export default App;
