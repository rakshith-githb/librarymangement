import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyForum = () => {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [newPost, setNewPost] = useState({
        title: '',
        category: 'Queries',
        content: '',
        tags: ''
    });
    const [replies, setReplies] = useState({});
    const [newReply, setNewReply] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [likedPosts, setLikedPosts] = useState(new Set());

    const categories = ['Events', 'Tech', 'Resources', 'Queries'];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                
                const params = new URLSearchParams({
                    ...(selectedCategory && { category: selectedCategory }),
                    ...(searchQuery && { search: searchQuery }),
                    sort: sortBy
                });

                console.log('Fetching posts with params:', params.toString());
                
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/forum/posts?${params}`
                );
                
                console.log('Posts received:', response.data);
                
                // Filter out any posts with null postedBy field or add a default value
                const validPosts = response.data.map(post => {
                    if (!post.postedBy) {
                        // Add a default postedBy object
                        return {
                            ...post,
                            postedBy: { facultyname: 'Unknown User', facultyId: 'unknown' }
                        };
                    }
                    return post;
                });
                
                setPosts(validPosts || []);

                // Set initial liked posts safely
                if (user) {
                    const initialLikedPosts = new Set(
                        validPosts
                            .filter(post => 
                                post.likes && 
                                Array.isArray(post.likes) &&
                                post.likes.some(like => 
                                    like && 
                                    ((typeof like === 'object' && like.facultyId === user.facultyId) || 
                                    like === user.facultyId)
                                )
                            )
                            .map(post => post._id)
                    );
                    setLikedPosts(initialLikedPosts);
                }
                
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Failed to fetch posts: ' + (error.message || 'Unknown error'));
            }
        };

        fetchPosts();
    }, [selectedCategory, searchQuery, sortBy]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.facultyId) {
                setError('User not authenticated');
                return;
            }

            // Format tags from comma-separated string to array
            const formattedTags = newPost.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag); // Remove empty tags

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/forum/posts`,
                {
                    ...newPost,
                    tags: formattedTags,
                    facultyId: user.facultyId
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.post) {
                // Add the new post to the posts array
                setPosts(prevPosts => [response.data.post, ...prevPosts]);
                // Clear the form
                setNewPost({
                    title: '',
                    category: 'Queries',
                    content: '',
                    tags: ''
                });
                setSuccess('Post created successfully!');
            }
        } catch (error) {
            console.error('Error creating post:', error.response?.data?.message || error.message);
            setError(error.response?.data?.message || 'Failed to create post');
        }
    };

    const handleReplySubmit = async (postId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/forum/replies`, {
                postId,
                content: newReply[postId],
                facultyId: user.facultyId
            });

            setReplies({
                ...replies,
                [postId]: [...(replies[postId] || []), response.data.reply]
            });
            setNewReply({ ...newReply, [postId]: '' });
        } catch (error) {
            setError('Failed to add reply');
        }
    };

    const handleLike = async (postId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setError('User not authenticated');
                return;
            }

            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/forum/posts/${postId}/like`,
                {
                    facultyId: user.facultyId
                }
            );

            // Update the posts state to reflect the new like count
            setPosts(prevPosts => 
                prevPosts.map(post => {
                    if (post._id === postId) {
                        const newLikes = new Set(post.likes);
                        if (newLikes.has(user.facultyId)) {
                            newLikes.delete(user.facultyId);
                        } else {
                            newLikes.add(user.facultyId);
                        }
                        return {
                            ...post,
                            likes: Array.from(newLikes)
                        };
                    }
                    return post;
                })
            );

            // Toggle the liked state for this post
            setLikedPosts(prevLikedPosts => {
                const newLikedPosts = new Set(prevLikedPosts);
                if (newLikedPosts.has(postId)) {
                    newLikedPosts.delete(postId);
                } else {
                    newLikedPosts.add(postId);
                }
                return newLikedPosts;
            });
        } catch (error) {
            console.error('Error updating like:', error);
            setError('Failed to update like');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">📢 Faculty Forum</h1>

            {/* Error and Success Messages */}
            {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded-lg w-64"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border rounded-lg"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mostLiked">Most Liked</option>
                </select>
            </div>

            {/* New Post Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Post Title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <select
                            value={newPost.category}
                            onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <textarea
                            placeholder="Post Content"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            rows="4"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Tags (comma-separated)"
                            value={newPost.tags}
                            onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Post
                    </button>
                </form>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map(post => (
                    <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
                        {post.isPinned && (
                            <div className="text-yellow-600 mb-2">📌 Pinned Post</div>
                        )}
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <div className="text-sm text-gray-600 mb-2">
                            Posted by {post.postedBy ? post.postedBy.facultyname : 'Unknown User'} in {post.category}
                        </div>
                        <p className="mb-4">{post.content}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => handleLike(post._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                    likedPosts.has(post._id)
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <span className="text-xl">
                                    {likedPosts.has(post._id) ? '❤️' : '🤍'}
                                </span>
                                <span>{post.likes.length} Likes</span>
                            </button>
                            <span className="text-gray-600">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Replies Section */}
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold mb-2">Replies</h4>
                            {replies[post._id]?.map(reply => (
                                <div key={reply._id} className="bg-gray-50 p-3 rounded mb-2">
                                    <p>{reply.content}</p>
                                    <div className="text-sm text-gray-600">
                                        Replied by {reply.repliedBy && reply.repliedBy.facultyname ? 
                                            reply.repliedBy.facultyname : 'Unknown User'}
                                    </div>
                                </div>
                            ))}
                            <div className="mt-2">
                                <textarea
                                    placeholder="Write a reply..."
                                    value={newReply[post._id] || ''}
                                    onChange={(e) => setNewReply({
                                        ...newReply,
                                        [post._id]: e.target.value
                                    })}
                                    className="w-full p-2 border rounded-lg"
                                    rows="2"
                                />
                                <button
                                    onClick={() => handleReplySubmit(post._id)}
                                    className="mt-2 bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacultyForum;