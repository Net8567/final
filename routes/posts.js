// File: routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { isAdmin, isUser } = require('../middleware/roles');

// Create a Post (Users and Admins)
router.post('/', isUser, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            createdBy: req.user._id
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Error creating post', error: err });
    }
});

// Read All Posts (Admins Only)
router.get('/', isAdmin, async (req, res) => {
    try {
        const posts = await Post.find().populate('createdBy', 'name email');
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts', error: err });
    }
});

// Update a Post (Admins Only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Error updating post', error: err });
    }
});

// Delete a Post (Admins Only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting post', error: err });
    }
});

module.exports = router;