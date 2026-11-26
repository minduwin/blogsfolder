import { useState, useEffect } from "react";
import { authService } from "../src/services/authServices";
import Navbar from './Nav';

export default function BlogDash() {
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
    
    // Switch admin dashboard to create post - Default to
    const [dashMode, setDashMode] = useState(true);

    // Grab the user data decoded from the token!
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

    // Grab all posts (published: true and false)
    const [ posts, setPosts ] = useState([]);
    const [ loading, setLoading ] = useState(true)

    // Form fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('TECHNOLOGY')
    const [published, setPublished] = useState(false);

    // Filter dashboard posts
    const [selectedCategory, setSelectedCategory] = useState('');

    // Editing variables
    const [editingPostId, setEditingPostId] = useState(null);

    const category_labels = {
        TECHNOLOGY: 'Technology',
        LIFESTYLE: 'Lifestyle',
        HEALTH_FITNESS: 'Health & Fitness',
        BUSINESS_FINANCE: 'Business & Finance',
        TRAVEL: 'Travel',
        ENTERTAINMENT: 'Entertainment',
        FOOD_DRINK: 'Food & Drink',
        ARTS_DESIGN: 'Arts & Design',
        EDUCATION_LEARNING: 'Education & Learning',
        OPINION_POLITICS: 'Opinion & Politics',
    };

    // Reusable fetch function
    const fetchPosts = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/blog`, {
                headers: {
                    ...authService.getAuthHeader()
                }
            })
            if (!res.ok) throw new Error('Network response failed.');
            const result = await res.json();
            setPosts(result);
        } catch (error) {
            console.error('Error fetching data: ', error);
        } finally {
            setLoading(false);
        }
    }

    // Call fetch function on initial page load
    useEffect(() => {
        fetchPosts();
    }, []);

    const handleStartEditing = (post) => {
        setEditingPostId(post.id);
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category || 'TECHNOLOGY');
        setPublished(post.published);
        setDashMode(false);
    };

    const handleSubmitPost = async (e) => {
        e.preventDefault();
        try {
            if (editingPostId) {
                // Update existing post
                await authService.editArticle(editingPostId, title, content, category, published);
                alert('Article edited successfully!');
                setEditingPostId(null);  // Clear editing mode
            } else {
                await authService.posting(title, content, category, published);
                alert('Article posted successfully!')
            }

            // Reset form and refresh data
            setTitle('');
            setContent('');
            setCategory('TECHNOLOGY');
            setPublished(false);
            setDashMode(true);
            fetchPosts();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleTogglePublishing = async (e, post) => {
        e.preventDefault();
        
        // If it's currently published, make it false (unpublish).
        // If it's a draft, make it true (publish)
        const newStatus = !post.published;
        
        try {
            await authService.updatePostStatus(post.id, newStatus);
            alert(`Article ${newStatus ? 'published' : 'unpublished'} successfully!`);
            fetchPosts();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeletePost = async(e, post) => {
        e.preventDefault();

        try {
            await authService.deleteArticle(post.id);
            alert('Post deleted successfully!');
            fetchPosts();
        } catch (error) {
            alert(error.message)
        }
    }

    const handleDeleteComment = async (e, postId, commentId) => {
        e.preventDefault();

        try {
            await authService.deleteComments(postId, commentId);
            alert('Comment deleted successfully!');
            fetchPosts();
        } catch (error) {
            alert(error.message);
        }
    }

    if(!isLoggedIn) {
        return (
            <div>
                <div className='blogHead'>
                    <h1>alterNative</h1>
                    <div className='headNav'>
                        <Navbar />
                    </div>
                </div>
                <div className="logInfo">
                    <h3>You need to login to access this area!</h3>
                </div>
            </div>
        )
    }

    if (loading) return <p>Loading articles...</p>
    if (posts.length === 0) return <p>No blog posts found.</p>

    // Filter by matching the author's name from the API to the user in the token
    const userPosts = posts.filter((post) => post.author.name === currentUser?.name);
    
    return (
        <div>
            <div className='blogHead'>
                <h1>alterNative</h1>
                <div className='headNav'>
                    <Navbar />
                </div>
            </div>
            <div className="mainDash">
                <div className="navButton">
                    <button onClick={() => setDashMode(!dashMode)}>
                        {dashMode ? 'Editor' : 'Dashboard'}
                    </button>
                </div>

                <h2>{dashMode ? 'All Posts' : 'Editor'}</h2>
                <div>
                    {dashMode ? (
                        <div className="blogArticles">
                            {userPosts.length === 0 ? (
                                <p>You don't have posts.</p>
                            ) : (
                                userPosts.map((post) => (
                                    <article key={post.id} className="postContainer">
                                        <div className="firstSec">
                                            <img src="../src/assets/check.svg" alt="" />
                                            <span style={{ color: post.published ? 'green' : 'red' }}>
                                                {post.published === false ? 'Draft' : 'Published'}
                                            </span>
                                        </div>
                                        <span>{category_labels[post.category] || post.category}</span>
                                        <h5>{post.title}</h5>
                                        <p>{post.content.substring(0, 35)}...</p>
                                        <span>Comments ({post.comment?.length || 0})</span>
                                        <div className='controlBtn'>
                                            <button
                                                type='button'
                                                onClick={(e) => handleTogglePublishing(e, post)}
                                            >
                                                {post.published === false ? 'Published' : 'Draft'}
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => handleStartEditing(post)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type='button'
                                                onClick={(e) => handleDeletePost(e, post)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>  
                                ))
                            )}
                        </div>
                    ) : (
                        <div className='blogForm'>
                            <form onSubmit={handleSubmitPost}>
                                <div className="formHeader">
                                    <input 
                                        type="text"
                                        placeholder='Title'
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                    <select 
                                        name="category" 
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)} 
                                        required
                                    >
                                        <option value="">Categories</option>
                                        {Object.entries(category_labels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <textarea 
                                    name="content" 
                                    id="content"
                                    placeholder="What's in your mind?"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                ></textarea>
                                <div className="statusCheck">
                                    <label htmlFor="opt1">
                                        <input 
                                            type="radio"
                                            id="opt1"
                                            name="statusCheck"
                                            checked={published === true}
                                            onChange={() => setPublished(true)}
                                        />
                                        Publish
                                    </label>
                                    <label htmlFor="opt2">
                                        <input 
                                            type="radio"
                                            id="opt2"
                                            name="statusCheck"
                                            checked={published === false}
                                            onChange={() => setPublished(false)}
                                        />
                                        Save as Draft
                                    </label>
                                </div>
                                <button type="submit">
                                    Submit
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}