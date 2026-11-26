import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function indexPage(req, res) {
    res.render({
        title: 'Home Page'
    })
};

async function dashPage(req, res) {
    res.render({
        title: 'Dashboard'
    })
};

async function registerUser(req, res) {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        return res.status(201).json({ message: 'User registered successfully.'});
    } catch (error) {
        console.error('Prisma register error: ', error);
        return res.status(400).json({ error: error.message || 'Email or user already exists.'})
    }
};

async function userLogin(req, res) {
    const { name, password } = req.body;

    try {
        const user = await prisma.user.findFirst({ where: { name }});
        if (!user) return res.status(400).json({ message: 'Invalid credentials '});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Issue JWT
        const payload = { id: user.id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d'});

        return res.json({ success: true, token: `Bearer ${token}` });
    } catch (error) {
        console.error('LOGIN ERROR DETAILED: ', error);
        return res.status(500).json({ error: error.message });
    }
}

async function blogPage(req, res) {
    res.render({
        title: 'Blog Edit'
    })
};

async function createPost(req, res) {
    const { title, content, category, published } = req.body;

    if (!category) {
        return res.status(400).json({error: 'Category is required.'});
    }

    try {
        // req.user is automatically provided by the Passport JWT middleware
        const newPost = await prisma.blogPost.create({
            data: {
                title,
                content,
                category,
                published: published || false,
                authorId: req.user.id,
            },
        });
        return res.status(201).json(newPost);
    } catch (error) {
        console.error('Create Post Error: ', error);
        return res.status(500).json({ error: 'Failed to create post.'})
    }
}

async function postComment(req, res) {
    const postId = req.params.id;

    if (!postId) {
        return res.status(400).json({ error: 'Invalid post ID.' });
    }
    const { name, comment } = req.body;

    try {
        const newComment = await prisma.comments.create({
            data: {
                name,
                comment,
                postId: postId,
            },
        });
        
        return res.status(201).json(newComment);
    } catch(error) {
        console.error('Create Comment error: ', error);
        return res.status(500).json({ error: 'Failed to post a comment.'});
    }
}

async function getAllPostsPublic(req, res) {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { published: true},
            include: {
                author: { select: { name: true }},
                comment: true,
            },
            orderBy: { id: 'desc' }
        });
        return res.json(posts);
    } catch (error) {
        console.error('Get Posts error: ', error);
        return res.status(500).json({ error: 'Failed to fetch posts.' });
    }
}

async function getAllPostsToUser(req, res) {
    try {
        const posts = await prisma.blogPost.findMany({
            include: {
                author: { select: { name: true }},
                comment: true,
            },
            orderBy: { id: 'desc' }
        });
        return res.json(posts);
    } catch (error) {
        console.error('Get Posts error: ', error);
        return res.status(500).json({ error: 'Failed to fetch posts.' });
    }
}

async function readPost(req, res) {
    // Grab ID from URL parameters, NOT req.body
    const postID = req.params.id;

    if (!postID) {
        return res.status(400).json({ error: 'Invalid post ID.' });
    }

    try {
        const post = await prisma.blogPost.findFirst({
            where: {
                id: postID,
                published: true     // Make sure it's public
            },
            include: {
                author: true,
                comment: true,
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found...' });
        }

        return res.json(post);
    } catch(error) {
        console.error('Error accessing post: ', error);
        return res.status(500).json({ error: 'Failed to fetch post.'});
    }
}

async function updateStatusPost(req, res) {
    try {
        const postId = req.params.id;
        const { published, title, content } = req.body;

        // Security check: make sure the logged in user owns the post
        const existingPost = await prisma.blogPost.findUnique({
            where: { id: postId },
            include: { author: true }
        });

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // If the check is ok, execute the update
        const updatePost = await prisma.blogPost.update({
            where: { id: postId },
            data: {
                ...(published !== undefined && { published }),
                ...(title !== undefined && { title }),
                ...(content !== undefined && {content }),
            },
        });

        return res.status(200).json({ success: true, post: updatePost });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function editPost(req, res) {
    try {
        const postId = req.params.id;
        const { published, title, content, category } = req.body;

        // Security check: make sure the logged in user owns the post
        const existingPost = await prisma.blogPost.findUnique({
            where: { id: postId },
            include: { 
                author: true,
                comment: true,  
            }
        });

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const editingArticle = await prisma.blogPost.update({
            where: { id: postId },
            data: {
                ...(published !== undefined && { published }),
                ...(title !== undefined && { title }),
                ...(content !== undefined && {content }),
                ...(category !== undefined && {category}),
            },
        });

        return res.status(200).json({ success: true, post: editingArticle });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function deletePost(req, res) {
    try {
        const postId = req.params.id;
        
        // Security check: make sure the logged in user owns the post
        const existingPost = await prisma.blogPost.findUnique({
            where: { id: postId }
        });

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        await prisma.blogPost.delete({
            where: {
                id: postId, 
            }
        });

        return res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function deleteComment(req, res) {
    try {
        const { postId, commentId } = req.params;

        await prisma.comments.delete({
            where: {
                id: commentId,
            }
        });

        return res.json({ success: true, message: 'Comment deleted successfully...'});
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function userLogout(req, res) {
    return res.json({ message: 'Logged out successfully...' });
}

export default {
    indexPage,
    dashPage,
    registerUser,
    userLogin,
    blogPage,
    createPost,
    postComment,
    getAllPostsPublic,
    getAllPostsToUser,
    readPost,
    updateStatusPost,
    editPost,
    deletePost,
    deleteComment,
    userLogout,
}