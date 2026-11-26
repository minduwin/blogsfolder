// import { useState, useEffect } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Nav';
import {
    FaLaptopCode,
    FaCoffee,
    FaHeartbeat,
    FaChartLine,
    FaPlane,
    FaFilm,
    FaUtensils,
    FaPalette,
    FaGraduationCap,
    FaBalanceScale,
} from 'react-icons/fa';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = {
        TECHNOLOGY: {label: 'Technology', icon: FaLaptopCode },
        LIFESTYLE: {label: 'Lifestyle', icon: FaCoffee },
        HEALTH_FITNESS: {label: 'Health & Fitness', icon: FaHeartbeat },
        BUSINESS_FINANCE: {label: 'Business & Finance', icon: FaChartLine },
        TRAVEL: {label: 'Travel', icon: FaPlane },
        ENTERTAINMENT: {label: 'Entertainment', icon: FaFilm },
        FOOD_DRINK: {label: 'Food & Drink', icon: FaUtensils },
        ARTS_DESIGN: {label: 'Arts & Design', icon: FaPalette },
        EDUCATION_LEARNING: {label: 'Education & Learning', icon: FaGraduationCap },
        OPINION_POLITICS: {label: 'Opinion & Politics', icon: FaBalanceScale},
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/home')
        .then((res) => {
            if (!res.ok) throw new Error('Network response failed.');
            return res.json();
        })
        .then((result) => {
            setPosts(result);
            setLoading(false);
        })
        .catch((error) => console.error('Error fetching data: ', error));
    }, [])

    if (loading) return <p>Loading articles...</p>
    if (posts.length === 0) return <p>No blog posts found.</p>

    return (
        <div>
            <div className='blogHead'>
                <h1>alterNative</h1>
                <div className='headNav'>
                    <Navbar />
                </div>
            </div>
            <div className='mainContainer'>
                <div className='highlights'>
                    <div className="carousel">
                        {posts.slice(0, 4).map((post) => (
                            <article key={post.id} className='highContainer'>
                                <div className='highDetails'>
                                    <span>{categories[post.category]?.label || post.category}</span>
                                    <h2>{post.title}</h2>
                                    <p>{post.content.substring(0, 150)}...</p>
                                    <Link to={`/postDetails/${post.id}`} className='highLink'>
                                        Read more...
                                    </Link>
                                </div>
                                <div className='highImage'>
                                    <img src={post.imageUrl || "/images/default.jpg"} alt={post.title}/>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
                <div className='underSection'>
                    <div className='allArticles'>
                        {posts.map((post) => (
                            <Link to={`/postDetails/${post.id}`} key={post.id} className='postLink'>
                                <div className='artContainer'>
                                    <img src={post.imageUrl || "/images/default.jpg"} alt={post.title} />
                                    <span>{categories[post.category]?.label || post.category}</span>
                                    <h3>{post.title}</h3>
                                    <p>{post.content.substring(0, 50)}...</p>
                                    <div className='highAccount'>
                                        <img src="../src/assets/account.svg" alt="" />
                                        <p>{post.author.name}</p>
                                    </div>
                                </div>
                            </Link>

                        ))}
                    </div>
                    <div className='topics'>
                        <h3>Topics</h3>
                        {Object.entries(categories).map(([key, { label, icon: Icon }]) => (
                            <span key={key} className='topicItem'>
                                <Icon className='topicIcon'/> 
                                <p>{label}</p>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}