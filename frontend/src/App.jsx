import './App.css'
import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { ToastProvider } from './components/common/Toast';

import TopNav from "./components/common/top/TopNav.jsx"
import ScrollLine from './components/common/top/ScrollLine.jsx';

import Home from "./pages/Home"
import About from "./pages/About"
import Archive from "./pages/Archive"
import Board from "./pages/Board"
import Post from "./pages/Post.jsx";
import PostList from "./pages/PostList.jsx";

import { checkLogin } from './api/auth';
import Footer from "./components/common/Footer.jsx";

function App() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkLogin().then(setIsAdmin);
    }, []);

    return (
        <ToastProvider>
            <div className="app-layout">
                <ScrollLine/>
                <TopNav isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
                <div className="app-content">
                    <Routes>
                        <Route path='/' element={<Home/>}/>
                        <Route path='/about' element={<About/>}/>
                        <Route path='/archive' element={<Archive/>}/>

                        <Route path='/post' element={<PostList isAdmin={isAdmin} />}/>
                        <Route path='/post/write' element={<Post/>}/>
                        <Route path='/board' element={<Board isAdmin={isAdmin} />}/>
                    </Routes>
                </div>
                <Footer/>
            </div>
        </ToastProvider>
    )
}

export default App
