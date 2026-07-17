const express = require('express');
const router = express.Router();
const Faculty = require('../models/faculty');
const Book = require('../models/book');
const Feedback = require('../models/feedback');
const Wishlist = require('../models/wishlist');
const ForumPost = require('../models/forumPost');

// Get faculty dashboard data
router.get('/dashboard/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        if (!facultyId) {
            return res.status(400).json({ message: 'Invalid user data: facultyId is missing' });
        }

        const faculty = await Faculty.findOne({ facultyId }).populate('currentlyIssuedBooks');
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.json({
            facultyId: faculty.facultyId,
            facultyname: faculty.facultyname,
            totalBooksIssued: faculty.totalBooksIssued,
            currentlyIssuedBooks: faculty.currentlyIssuedBooks,
        });
    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get available books
router.get('/books/available', async (req, res) => {
    try {
        const availableBooks = await Book.find({ status: 'available' });
        res.json(availableBooks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all books
router.get('/books', async (req, res) => {
    try {
        const allBooks = await Book.find();
        res.json(allBooks);
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Feedback routes
router.post('/feedback', async (req, res) => {
    try {
        const { facultyId, title, description, category } = req.body;
        const feedback = new Feedback({
            facultyId,
            title,
            description,
            category
        });
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/feedbacks', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const feedbacks = await Feedback.find({ facultyId }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Wishlist routes
router.post('/wishlist', async (req, res) => {
    try {
        const { facultyId, title, author, category, reason } = req.body;
        const wishlistItem = new Wishlist({
            facultyId,
            title,
            author,
            category,
            reason
        });
        await wishlistItem.save();
        res.status(201).json({ message: 'Book suggestion submitted successfully', wishlistItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/wishlist', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const wishlistItems = await Wishlist.find({ facultyId }).sort({ createdAt: -1 });
        res.json(wishlistItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Forum routes
router.post('/forum/posts', async (req, res) => {
    try {
        const { title, category, content, tags, facultyId } = req.body;

        // Find the faculty document using facultyId
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const post = new ForumPost({
            title,
            category,
            content,
            tags: tags.filter(tag => tag), // Remove empty tags
            postedBy: faculty._id // Use the faculty's MongoDB _id
        });

        await post.save();

        // Populate the postedBy field before sending response
        const populatedPost = await ForumPost.findById(post._id)
            .populate('postedBy', 'facultyname facultyId');

        res.status(201).json({ 
            message: 'Post created successfully', 
            post: populatedPost 
        });
    } catch (error) {
        console.error('Error creating forum post:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/forum/posts', async (req, res) => {
    try {
        const { category, search, sort = 'newest' } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            mostLiked: { likes: -1 }
        };

        const posts = await ForumPost.find(query)
            .populate('postedBy', 'facultyname facultyId')
            .sort(sortOptions[sort])
            .lean();

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/forum/replies', async (req, res) => {
    try {
        const { postId, content, taggedFaculty, parentReplyId } = req.body;
        const facultyId = req.body.facultyId;

        const reply = new ForumReply({
            postId,
            content,
            repliedBy: facultyId,
            taggedFaculty,
            parentReplyId
        });

        await reply.save();

        // Send notifications to tagged faculty
        if (taggedFaculty && taggedFaculty.length > 0) {
            // Implement notification logic here
        }

        res.status(201).json({ message: 'Reply added successfully', reply });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update the like route to handle MongoDB ObjectIds
router.put('/forum/posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { facultyId } = req.body;

        // Find the faculty to get their MongoDB _id
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        const post = await ForumPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the faculty has already liked the post
        const likeIndex = post.likes.findIndex(id => id.toString() === faculty._id.toString());
        
        if (likeIndex > -1) {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        } else {
            // Like the post
            post.likes.push(faculty._id);
        }

        await post.save();

        // Return the updated post with populated likes
        const updatedPost = await ForumPost.findById(postId)
            .populate('postedBy', 'facultyname facultyId')
            .populate('likes', 'facultyname facultyId');

        res.json({
            message: likeIndex > -1 ? 'Post unliked successfully' : 'Post liked successfully',
            likes: updatedPost.likes,
            likesCount: updatedPost.likes.length
        });
    } catch (error) {
        console.error('Error updating like:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;