import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../src/services/authServices';

export default function PostDetails() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // Comment section variables
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');

    const categories = {
        TECHNOLOGY: {label: 'Technology'},
        LIFESTYLE: {label: 'Lifestyle'},
        HEALTH_FITNESS: {label: 'Health & Fitness'},
        BUSINESS_FINANCE: {label: 'Business & Finance'},
        TRAVEL: {label: 'Travel'},
        ENTERTAINMENT: {label: 'Entertainment'},
        FOOD_DRINK: {label: 'Food & Drink'},
        ARTS_DESIGN: {label: 'Arts & Design'},
        EDUCATION_LEARNING: {label: 'Education & Learning' },
        OPINION_POLITICS: {label: 'Opinion & Politics'},
    };

    const fetchPost = () => {
        fetch(`http://localhost:5000/api/home/${id}`)
        .then((res) => {
            if (!res.ok) throw new Error('Network response failed.');
            return res.json();
        })
        .then((result) => {
            setPost(result);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching data: ', error);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handlePostingComment = async (e) => {
        e.preventDefault();

        try {
            await authService.postingComments(name, comment, id)
            alert('Comment posted susccesfully!');
            
            // Refresh form
            setName('');
            setComment('');
        } catch (error) {
            alert(error.message)
        }
    }

    if (loading) return <p>Loading article...</p>;
    if (!post) return <p>Post not found.</p>

    return (
        <div>
            {/* No .map() needed because 'post' is a single object */}
            <article className='postDetail'>
                <span>{categories[post.category]?.label || post.category}</span>
                <h1>{post.title}</h1>
                <div className='postInfo'>
                    <div className='authorInfo'>
                        <img src="../src/assets/account.svg" alt="" />
                        <p>{post.author?.name}</p>
                    </div>
                    <div className='commentInfo' title='Comments'>
                        <img src="../src/assets/comment.svg" alt="" />
                        <p>{post.comment?.length || 0}</p>
                    </div>
                </div>
                <p>{post.content}</p>

                <div className='commentContainer'>
                    <h4>Comments ({post.comment?.length || 0})</h4>
                    <form onSubmit={handlePostingComment} className='commentForm'>
                        <input 
                            type="text" 
                            placeholder='Name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <textarea 
                            name="comment" 
                            id="comment" 
                            placeholder='Add your comment'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        ></textarea>
                        <button type='submit'>Post Comment</button>
                    </form>
                    <div className='commentPosted'>
                        {post.comment && post.comment.length > 0 ? (
                            post.comment.map((anon) => (
                                <div key={anon.id} className='message'>
                                    <div className='anonInfo'>
                                        <img src="../src/assets/account.svg" alt="" />
                                        <p>{anon.name}</p>
                                    </div>
                                    <p>{anon.comment}</p>
                                    <div className='divider'></div>
                                </div>
                            ))
                        ) : (
                            <div className='noComment'>
                                <p>No comments yet. Be the first!</p>
                                <div className='divider'></div>
                            </div>
                        )}
                    </div>
                </div>
            </article>
            <Link to={'/'} className='backButton'>Home</Link>
        </div>
    )
}