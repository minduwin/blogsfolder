import { useState } from "react";
import { authService } from "../src/services/authServices";
import Navbar from './Nav';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';

const CardBackground = ({ activeView }) => (
    <div className={`card-bg ${
        activeView === 'login' ? 'login' : ''}`}>
            <img src="./src/assets/hero.jpg" alt="" />
        </div>
);

const SocialButtons = () => (
    <div className="sso">
        <a className="fa-brands fa-facebook" title="Facebook"><FaFacebook /></a>
        <a className="fa-brands fa-twitter" title="Google"><FaGoogle /></a>
        <a className="fa-brands fa-linkedin" title="Apple"><FaApple /></a>
    </div>
);

const HeroPanel = ({ type, activeView, title, text, 
    buttonText, onToggle }) => (
    <div className={`hero ${type} ${activeView === type ? 'active' : ''}`}>
        <h2>{title}</h2>
        <p>{text}</p>
        <button type="button" onClick={onToggle}>
            {buttonText}
        </button>
    </div>
);

const RegisterForm = ({ activeView, handleRegister, name, setName,
    email, setEmail, password, setPassword
 }) => (
    <div className={`form register 
            ${activeView === 'register' ? 'active' : ''}`}>
        <h2>Sign up</h2>
        <SocialButtons />
        <p>Or use your email</p>
        <form onSubmit={handleRegister}>
            <input 
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input 
                type="email" 
                placeholder="Email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <button type="submit">Sign up</button>
        </form>
    </div>
);

const LoginForm = ({ activeView, handleLogin, name, 
        setName, password, setPassword }) => (
    <div className={`form login 
            ${activeView === 'login' ? 'active' : ''}`}>
        <h2>Login</h2>
        <SocialButtons />
        <p>Or use your email</p>
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="password" 
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required  
            />
            <a>Forgot password?</a>
            <button type="submit">Login</button>
        </form>
    </div>
);

export default function LoggingIn() {
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
    const [activeView, setActiveView] = useState('login');

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const toggleView = () => {
        setActiveView(activeView === 'login' ? 'register' : 'login');
        setPassword('');
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await authService.register(name, email, password);
            alert('Registration successful! Please log in.');
            setActiveView('login');
            setPassword('');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await authService.login(name, password);
            setIsLoggedIn(true);
            alert('Logged in successfully!');
        } catch (error) {
            alert(error.message);
        }
    }

    const handleLogoutClick = () => {
        authService.logout();
        setIsLoggedIn(false);
        setActiveView('login');
    };

    // 🔒 Logged In View
    if (isLoggedIn) {
        return (
            <div>
                <div className='blogHead'>
                    <h1>alterNative</h1>
                    <div className='headNav'>
                        <Navbar />
                    </div>
                </div>
                <div className="logInfo">
                    <h2>🎉 Connection Successful!</h2>
                    <p>You are authenticated using a Passport JWT strategy.</p>
                    <button onClick={handleLogoutClick}>
                        Log Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='blogHead'>
                <h1>alterNative</h1>
                <div className='headNav'>
                    <Navbar />
                </div>
            </div>
            <div className="card">
                <CardBackground activeView={activeView} />
                <HeroPanel 
                    type='register'
                    activeView={activeView}
                    title='Welcome back'
                    text='Login to post'
                    buttonText='Login'
                    onToggle={toggleView}
                />
                <RegisterForm 
                    activeView={activeView}
                    handleRegister={handleRegister}
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                />
                <HeroPanel 
                    type='login'
                    activeView={activeView}
                    title='Hello there'
                    text='Start to post'
                    buttonText='Sign up'
                    onToggle={toggleView}
                />
                <LoginForm 
                    activeView={activeView} 
                    handleLogin={handleLogin}
                    name={name}
                    setName={setName}
                    password={password}
                    setPassword={setPassword}
                />
            </div>
        </div>
        
    )
}