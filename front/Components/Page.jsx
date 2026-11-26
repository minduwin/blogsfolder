import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../Components/Home';
import PostDetails from '../Components/PostDetail';
import BlogDash from '../Components/Dashboard';
import LoggingIn from '../Components/Login';

export default function FrontPage() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Home />}/>
                    <Route path='/postDetails/:id' element={<PostDetails />}/>
                    <Route path='/login' element={<LoggingIn />} />
                    <Route path='/dashboard' element={<BlogDash />}/>
                </Routes>
            </BrowserRouter>
        </div>
    )
}