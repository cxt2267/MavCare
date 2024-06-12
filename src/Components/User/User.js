import React, {useState, useEffect} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import { FaUser,FaLock} from "react-icons/fa";
import './User.css';
import { login, register, resetPass, getScannedUser, getEpcs } from '../../DB/DB.js';
import Cookies from 'js-cookie';

const checkPass = (pswd) => {
      const length = pswd.length >= 8;
      const uppercase = /[A-Z]/.test(pswd);
      const lowercase = /[a-z]/.test(pswd);
      const digit = /[0-9]/.test(pswd);
      const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pswd);
      var message = "Password must contain at least 8 characters, an uppercase letter, " 
      + "a lowercase letter, a digit, and a special character.";

      if(!length || !uppercase || !lowercase || !digit || !specialChar) {
        return message;
      }
      return 'ok';
}

export const Register = () => {
    const [fname, setFirstname] = useState('');
    const [lname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [admin, setAdmin] = useState('0');
    const [epc, setEpc] = useState('');
    const [err, setErr] = useState(false);
    const [errMessage, setErrMessage] = useState("Unable to complete registration.");
    const navigate = useNavigate();

    useEffect(() => {
        const scanEpc = async () => {
            getEpcs()
            .then(epcs => {
                epcs = JSON.parse(epcs);
                epcs = epcs.EPC;
                if(epcs[0] !== '' && epcs[0] !== undefined && epcs[0] !== null) {
                    setEpc(epcs[0]);
                }
            })
        }

        if(epc === '') {
            scanEpc();
            const scanInterval = setInterval(scanEpc, 1000);
            return () => clearInterval(scanInterval);
        }
    });

    useEffect(() => {
        if(errMessage === "Please scan key card." && epc !== '') {
            setErr(false);
            setErrMessage('');
        }
    },[epc])

    const submitReg = (event) => {
        event.preventDefault();
        if(epc === '') {
            setErr(true);
            setErrMessage("Please scan key card.");
            return;
        }
        else if(checkPass(password) !== 'ok') {
            setErr(true);
            setErrMessage(checkPass(password));
            return;
        }
        register(username.trim(), password, fname.trim(), lname.trim(), epc, admin).then(user => {
            if(user === "email already in use.") {
                setErr(true);
                setErrMessage("Email already in use.");
            } else {
                Cookies.set("User", user, { expires: 1, path: '/', secure: true, sameSite: 'Strict'});
                navigate("/");
                window.location.reload();
            }
        });
    }

    const setFname = (event) => {
        setFirstname(event.target.value);
    }

    const setLname = (event) => {
        setLastname(event.target.value);
    }

    const setUser = (event) => {
        setUsername(event.target.value);
    }

    const setPass = (event) => {
        setPassword(event.target.value);
    }

    const setRequestAdmin = (event) => {
        if(event.target.checked) {
            setAdmin('2');
        } else {
            setAdmin('0');
        }
    }

    return (
        <div className="login-box">
            <form action="" onSubmit={submitReg}>
            <h1>Register</h1>
            <div className="key-card-info">
                {epc === '' && <span>Scan Key Card</span>}
                {epc !== '' && <span>Key Card #{epc}
                <button className="scan-again" onClick={()=>setEpc('')}>Scan Again</button></span>}
            </div>
            <div className="user-info">
                <input type="text" value={fname} onChange={setFname} placeholder="First Name" required/>
            </div>
            <div className="user-info">
                <input type="text" value={lname} onChange={setLname} placeholder="Last Name" required/>
            </div>
            <div className="user-info">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
            </div>
            <div className="user-info">
                <input type="password" value={password} onChange={setPass} placeholder="Password" required/>
            </div>
            <div className="request-admin">
                Request Admin Access
                <input className="check-box" type="checkbox" onChange={(e) => setRequestAdmin(e)}/>
            </div>
            <button type="submit">Register</button>
            <div className="register-link">
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

export const LogIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(false);
    const [errMessage, setErrMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            getScannedUser().then(user => {
                if(user !== "no user scanned") {
                    Cookies.set("User", user, { expires: 1, path: '/', secure: true, sameSite: 'Strict'});
                    navigate("/");
                    window.location.reload();
                }
            })
        },400)

        return () => clearInterval(interval);
    });
    
    const submitLogin = (event) => {
        event.preventDefault();
        login(username.trim(), password).then(user => {
            if(user === "no user found") {
                setErr(true);
                setErrMessage("invalid login credentials");
            } else {
                Cookies.set("User", user, { expires: 1, path: '/', secure: true, sameSite: 'Strict'});
                navigate("/");
                window.location.reload();
            }
        });
    }

    const setUser = (event) => {
        setUsername(event.target.value);
    }

    const setPass = (event) => {
        setPassword(event.target.value);
    }

    return (
        <div className="login-box">
            <form action="" onSubmit={submitLogin}>
            <h2 className="scan-key">Scan Keycard</h2>
            <h3>or</h3>
            <h1>Login</h1>
            <div className="user-input">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
                <FaUser className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={password} onChange={setPass} placeholder="Password" required/>
                <FaLock className="icon"/>
            </div>
            <div className="resetPass">
                <a href="/reset-pass">Reset Password</a>
            </div>
            <button type="submit">Login</button>
            <div className="register-link">
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

export const LogOut = () => {
    const navigate = useNavigate();
    useEffect(() => {
        if(Cookies.get("User") === undefined) {
          navigate("/login");
          window.location.reload();
        } 
    },[]);
    useEffect(() => {
        Cookies.remove("User", { path: '/' });
        window.location.reload();
        navigate("/login");
    },[])
    return (
        <div>
        </div>
    )
}

export const ResetPassword = () => {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPass] = useState('');
    const [newPassword, setNewPass] = useState('');
    const [err, setErr] = useState(false);
    const [errMessage, setErrMessage] = useState('');

    const navigate = useNavigate();

    const submitReset = (event) => {
        event.preventDefault();
        login(username.trim(), oldPassword).then(user => {
            if(user === "no user found") {
                setErr(true);
                setErrMessage("invalid username and current password.");
            } 
            else if(checkPass(newPassword) !== 'ok') {
                setErr(true);
                setErrMessage(checkPass(newPassword));
            }
            else {
                resetPass(username.trim(), newPassword).then(user => {
                    Cookies.set("User", user, { expires: 1, path: '/', secure: true, sameSite: 'Strict'});
                    navigate("/");
                }).then(() => {
                    window.location.reload();
                });;
            }
        })          
    }
    
    const setUser = (event) => {
        setUsername(event.target.value);
    }
    const setOld = (event) => {
        setOldPass(event.target.value);
    }
    const setNew = (event) => {
        setNewPass(event.target.value);
    }

    return (
        <div className="login-box">
            <form action="" onSubmit={submitReset}>
            <h1>Reset Password</h1>
            <div className="user-input">
                <input type="email" value={username} onChange={setUser} placeholder="Username/Email" required/>
                <FaUser className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={oldPassword} onChange={setOld} placeholder="Current Password" required/>
                <FaLock className="icon"/>
            </div>
            <div className="user-input">
                <input type="password" value={newPassword} onChange={setNew} placeholder="New Password" required/>
                <FaLock className="icon"/>
            </div>
            <button type="submit">Reset Password</button>
            <div className="register-link">
                <p>Back to <Link to="/login">Login</Link> or <Link to="/register">Register</Link></p>
            </div>
            <div className="error-message">{err && errMessage}</div>
            </form>
        </div>
    )
}

