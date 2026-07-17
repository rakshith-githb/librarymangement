import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookInventory = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newBook, setNewBook] = useState({
        bookId: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        status: 'available',
        placeLocated: ''
    });
    const [editingBook, setEditingBook] = useState(null);
    const [searchFilters, setSearchFilters] = useState({
        bookId: '',
        title: '',
        author: '',
        category: '',
        status: ''
    });
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [facultyId, setFacultyId] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books`);
            setBooks(response.data);
            setFilteredBooks(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching books');
            setLoading(false);
        }
    };

    // Handle search filter changes
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // Apply filters whenever search filters change
    useEffect(() => {
        const filtered = books.filter((book) => {
            return (
                (searchFilters.bookId === '' || (book.bookId && book.bookId.toLowerCase().includes(searchFilters.bookId.toLowerCase()))) &&
                (searchFilters.title === '' || (book.title && book.title.toLowerCase().includes(searchFilters.title.toLowerCase()))) &&
                (searchFilters.author === '' || (book.author && book.author.toLowerCase().includes(searchFilters.author.toLowerCase()))) &&
                (searchFilters.category === '' || (book.category && book.category.toLowerCase().includes(searchFilters.category.toLowerCase()))) &&
                (searchFilters.status === '' || book.status === searchFilters.status)
            );
        });
        setFilteredBooks(filtered);
    }, [searchFilters, books]);

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books`, newBook);
            setBooks([...books, response.data]);
            setFilteredBooks([...filteredBooks, response.data]);
            setNewBook({
                bookId: '',
                title: '',
                author: '',
                category: '',
                publisher: '',
                status: 'available',
                placeLocated: ''
            });
            setSuccess('Book added successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error adding book');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books/${editingBook._id}`, 
                editingBook
            );
            
            // Update the books list with the updated book
            const updatedBooks = books.map(book => 
                book._id === editingBook._id ? response.data : book
            );
            setBooks(updatedBooks);
            setFilteredBooks(updatedBooks.filter((book) => {
                return (
                    (searchFilters.bookId === '' || (book.bookId && book.bookId.toLowerCase().includes(searchFilters.bookId.toLowerCase()))) &&
                    (searchFilters.title === '' || (book.title && book.title.toLowerCase().includes(searchFilters.title.toLowerCase()))) &&
                    (searchFilters.author === '' || (book.author && book.author.toLowerCase().includes(searchFilters.author.toLowerCase()))) &&
                    (searchFilters.category === '' || (book.category && book.category.toLowerCase().includes(searchFilters.category.toLowerCase()))) &&
                    (searchFilters.status === '' || book.status === searchFilters.status)
                );
            }));

            // Reset the editing state
            setEditingBook(null);
            setSuccess('Book updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating book:', error);
            setError(error.response?.data?.message || 'Error updating book');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleRemoveBook = async (bookId) => {
        if (window.confirm('Are you sure you want to remove this book?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books/${bookId}`);
                const updatedBooks = books.filter(book => book._id !== bookId);
                setBooks(updatedBooks);
                setFilteredBooks(updatedBooks.filter((book) => {
                    return (
                        (searchFilters.bookId === '' || (book.bookId && book.bookId.toLowerCase().includes(searchFilters.bookId.toLowerCase()))) &&
                        (searchFilters.title === '' || (book.title && book.title.toLowerCase().includes(searchFilters.title.toLowerCase()))) &&
                        (searchFilters.author === '' || (book.author && book.author.toLowerCase().includes(searchFilters.author.toLowerCase()))) &&
                        (searchFilters.category === '' || (book.category && book.category.toLowerCase().includes(searchFilters.category.toLowerCase()))) &&
                        (searchFilters.status === '' || book.status === searchFilters.status)
                    );
                }));
                setSuccess('Book removed successfully');
                setTimeout(() => setSuccess(''), 3000);
            } catch (error) {
                setError('Error removing book');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleSearch = async () => {
        if (!searchFilters.bookId.trim()) {
            setError('Please enter a book ID');
            setTimeout(() => setError(''), 3000);
            return;
        }
    
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books/search?bookId=${searchFilters.bookId}`);
            setFilteredBooks(response.data ? [response.data] : []);
            setError('');
        } catch (error) {
            setFilteredBooks([]);
            setError(error.response?.data?.message || 'Book not found');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBook) {
            handleUpdateBook(e);
        } else {
            handleAddBook(e);
        }
    };

    const handleIssueBook = async () => {
        if (!facultyId.trim()) {
            setError('Please enter a faculty ID');
            return;
        }

        try {
            console.log('Issuing book:', selectedBook._id, 'to faculty:', facultyId); // Debug log
            
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books/issue/${selectedBook._id}`,
                {
                    facultyId: facultyId,
                    issuedDate: new Date()
                }
            );

            if (response.status === 200) {
                setSuccess(`Book "${selectedBook.title}" issued successfully to Faculty ID: ${facultyId}`);
                
                // Update the books list locally
                setBooks(books.map(book => 
                    book._id === selectedBook._id 
                        ? { ...book, status: 'issued', issuedTo: facultyId, issuedDate: new Date() }
                        : book
                ));

                setShowIssueModal(false);
                setSelectedBook(null);
                setFacultyId('');
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (error) {
            console.error('Full error object:', error); // Enhanced debug log
            console.error('Error response data:', error.response?.data); // Enhanced debug log
            
            const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Error issuing book';
            setError(errorMessage);
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleReturnBook = async () => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/admin/books/return/${selectedBook._id}`
            );

            if (response.status === 200) {
                setSuccess(`Book "${selectedBook.title}" returned successfully from Faculty ID: ${selectedBook.issuedTo}`);
                
                // Update the books list locally
                setBooks(books.map(book => 
                    book._id === selectedBook._id 
                        ? { ...book, status: 'available', issuedTo: null, issuedDate: null, returnedDate: new Date() }
                        : book
                ));

                setShowReturnModal(false);
                setSelectedBook(null);
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (error) {
            console.error('Error returning book:', error);
            const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Error returning book';
            setError(errorMessage);
            setTimeout(() => setError(''), 5000);
        }
    };

    const openIssueModal = (book) => {
        setSelectedBook(book);
        setShowIssueModal(true);
    };

    const openReturnModal = (book) => {
        setSelectedBook(book);
        setShowReturnModal(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">📚 Book Inventory</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1V9a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{success}</span>
                    </div>
                </div>
            )}

            {/* Add/Edit Book Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Book ID"
                        value={editingBook ? editingBook.bookId : newBook.bookId}
                        onChange={(e) => editingBook 
                            ? setEditingBook({...editingBook, bookId: e.target.value})
                            : setNewBook({...newBook, bookId: e.target.value})
                        }
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        value={editingBook ? editingBook.title : newBook.title}
                        onChange={(e) => editingBook
                            ? setEditingBook({...editingBook, title: e.target.value})
                            : setNewBook({...newBook, title: e.target.value})
                        }
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Author"
                        value={editingBook ? editingBook.author : newBook.author}
                        onChange={(e) => editingBook
                            ? setEditingBook({...editingBook, author: e.target.value})
                            : setNewBook({...newBook, author: e.target.value})
                        }
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={editingBook ? editingBook.category : newBook.category}
                        onChange={(e) => editingBook
                            ? setEditingBook({...editingBook, category: e.target.value})
                            : setNewBook({...newBook, category: e.target.value})
                        }
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Publisher"
                        value={editingBook ? editingBook.publisher : newBook.publisher}
                        onChange={(e) => editingBook
                            ? setEditingBook({...editingBook, publisher: e.target.value})
                            : setNewBook({...newBook, publisher: e.target.value})
                        }
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Location (Shelf, Room)"
                        value={editingBook ? editingBook.placeLocated : newBook.placeLocated}
                        onChange={(e) => editingBook
                            ? setEditingBook({...editingBook, placeLocated: e.target.value})
                            : setNewBook({...newBook, placeLocated: e.target.value})
                        }
                        className="p-2 border rounded"
                    />
                    <div className="col-span-2 flex justify-end gap-4">
                        {editingBook && (
                            <button
                                type="button"
                                onClick={() => setEditingBook(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {editingBook ? 'Update Book' : 'Add Book'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Search Books */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Search Books</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <input
                        type="text"
                        name="bookId"
                        placeholder="Search by Book ID"
                        value={searchFilters.bookId}
                        onChange={handleSearchChange}
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        name="title"
                        placeholder="Search by Title"
                        value={searchFilters.title}
                        onChange={handleSearchChange}
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        name="author"
                        placeholder="Search by Author"
                        value={searchFilters.author}
                        onChange={handleSearchChange}
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        name="category"
                        placeholder="Search by Category"
                        value={searchFilters.category}
                        onChange={handleSearchChange}
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <select
                        name="status"
                        value={searchFilters.status}
                        onChange={handleSearchChange}
                        className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="issued">Issued</option>
                    </select>
                </div>
            </div>

            {/* Books List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Books List ({filteredBooks.length})</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">Book ID</th>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Author</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Location</th>
                                    <th className="px-4 py-2 text-left">Issued To</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map((book) => (
                                    <tr key={book._id} className="border-t">
                                        <td className="px-4 py-2">{book.bookId}</td>
                                        <td className="px-4 py-2">{book.title}</td>
                                        <td className="px-4 py-2">{book.author}</td>
                                        <td className="px-4 py-2">{book.category}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded ${
                                                book.status === 'available' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{book.placeLocated}</td>
                                        <td className="px-4 py-2">{book.issuedTo || 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingBook(book)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveBook(book._id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                                {book.status === 'available' ? (
                                                    <button
                                                        onClick={() => openIssueModal(book)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Issue
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => openReturnModal(book)}
                                                        className="text-purple-600 hover:text-purple-800"
                                                    >
                                                        Return
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Issue Modal */}
            {showIssueModal && selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Issue Book</h2>
                        <p className="mb-4">Book: <strong>{selectedBook.title}</strong></p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Faculty ID:</label>
                            <input
                                type="text"
                                value={facultyId}
                                onChange={(e) => setFacultyId(e.target.value)}
                                placeholder="Enter Faculty ID"
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowIssueModal(false);
                                    setSelectedBook(null);
                                    setFacultyId('');
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleIssueBook}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Issue Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Book Modal */}
            {showReturnModal && selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Return Book</h2>
                        <p className="mb-4">Book: <strong>{selectedBook.title}</strong></p>
                        <p className="mb-4">Issued To: <strong>{selectedBook.issuedTo}</strong></p>
                        <p className="mb-4">Are you sure you want to return this book?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setSelectedBook(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnBook}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Return Book
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookInventory;