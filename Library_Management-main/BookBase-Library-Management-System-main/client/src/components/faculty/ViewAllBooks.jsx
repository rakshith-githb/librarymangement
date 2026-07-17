import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';

const ViewAllBooks = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage, setBooksPerPage] = useState(15); // Updated to show 15 books per page
    const [searchFilters, setSearchFilters] = useState({
        bookId: '',
        author: '',
        category: '',
        publisher: '',
        status: '', // Added status filter
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state

    useEffect(() => {
        // Fetch books from the backend
        const fetchBooks = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/books`);
                setBooks(response.data);
                setFilteredBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error.response?.data?.message || error.message);
            }
        };
        fetchBooks();
    }, []);

    // Pagination logic
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRowsPerPageChange = (e) => {
        setCurrentPage(1); // Reset to the first page
        setBooksPerPage(Number(e.target.value));
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredBooks.length / booksPerPage)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
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

    // Apply filters to the book list
    useEffect(() => {
        const filtered = books.filter((book) => {
            return (
                (searchFilters.bookId === '' || book.bookId.includes(searchFilters.bookId)) &&
                (searchFilters.author === '' || (book.author && book.author.toLowerCase().includes(searchFilters.author.toLowerCase()))) &&
                (searchFilters.category === '' || book.category.toLowerCase().includes(searchFilters.category.toLowerCase())) &&
                (searchFilters.publisher === '' || (book.publisher && book.publisher.toLowerCase().includes(searchFilters.publisher.toLowerCase()))) &&
                (searchFilters.status === '' || book.status === searchFilters.status)
            );
        });
        setFilteredBooks(filtered);
        setCurrentPage(1); // Reset to the first page after filtering
    }, [searchFilters, books]);

    // Close sidebar when displaying the table
    useEffect(() => {
        setIsSidebarOpen(false);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">📘 View All Books</h1>

            {/* Search Filters */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4"> {/* Updated to 5 columns */}
                <input
                    type="text"
                    name="bookId"
                    value={searchFilters.bookId}
                    onChange={handleSearchChange}
                    placeholder="Search by Book ID"
                    className="p-2 bg-white border border-customRed rounded-lg focus:outline-none focus:ring-2 focus:ring-white-400"
                />
                <input
                    type="text"
                    name="author"
                    value={searchFilters.author}
                    onChange={handleSearchChange}
                    placeholder="Search by Author"
                    className="p-2 bg-white border border-customRed  rounded-lg focus:outline-none focus:ring-2 focus:ring-white-400"
                />
                <input
                    type="text"
                    name="category"
                    value={searchFilters.category}
                    onChange={handleSearchChange}
                    placeholder="Search by Category"
                    className="p-2 bg-white border border-customRed  rounded-lg focus:outline-none focus:ring-2 focus:ring-white-400"
                />
                <input
                    type="text"
                    name="publisher"
                    value={searchFilters.publisher}
                    onChange={handleSearchChange}
                    placeholder="Search by Publisher"
                    className="p-2 bg-white border border-customRed rounded-lg focus:outline-none focus:ring-2 focus:ring-white-400"
                />
                <select
                    name="status"
                    value={searchFilters.status}
                    onChange={handleSearchChange}
                    className="p-2 bg-white border border-customRed  rounded-lg focus:outline-none focus:ring-2 focus:ring-white-400"
                >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="issued">Issued</option>
                </select>
            </div>

            {/* Book List */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-customRed">
                            <th className="border border-gray-300 px-4 py-2">Book ID</th>
                            <th className="border border-gray-300 px-4 py-2">Title</th>
                            <th className="border border-gray-300 px-4 py-2">Author</th>
                            <th className="border border-gray-300 px-4 py-2">Category</th>
                            <th className="border border-gray-300 px-4 py-2">Publisher</th> {/* Added Publisher Column */}
                            <th className="border border-gray-300 px-4 py-2">Availability</th>
                            <th className="border border-gray-300 px-4 py-2">Expected Return</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentBooks.map((book) => (
                            <tr key={book._id} className="bg-white hover:bg-gray-100"> {/* Changed from book.bookId to book._id */}
                                <td className="border border-gray-300 px-4 py-2">{book.bookId}</td>
                                <td className="border border-gray-300 px-4 py-2">{book.title}</td>
                                <td className="border border-gray-300 px-4 py-2">{book.author}</td>
                                <td className="border border-gray-300 px-4 py-2">{book.category}</td>
                                <td className="border border-gray-300 px-4 py-2">{book.publisher || 'N/A'}</td> {/* Display Publisher */}
                                <td className="border border-gray-300 px-4 py-2">
                                    {book.status === 'available' ? (
                                        <span className="text-green-600 font-bold">Available</span>
                                    ) : (
                                        <span className="text-red-600 font-bold">Issued</span>
                                    )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {book.status === 'issued' && book.issuedDate ? (
                                        new Date(new Date(book.issuedDate).setDate(new Date(book.issuedDate).getDate() + 5)).toLocaleDateString()
                                    ) : (
                                        ''
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredBooks.length > 0 && (
                <div className="flex justify-end items-center mt-4">
                    <span className="mr-2">Rows per page:</span>
                    <select
                        value={booksPerPage}
                        onChange={handleRowsPerPageChange}
                        className="border border-gray-300 rounded px-2 py-1"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <span className="mx-4">
                        {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length}
                    </span>
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600'}`}
                    >
                        &lt;
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === Math.ceil(filteredBooks.length / booksPerPage)}
                        className={`px-3 py-1 border rounded ml-2 ${
                            currentPage === Math.ceil(filteredBooks.length / booksPerPage) ? 'text-gray-400' : 'text-blue-600'
                        }`}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ViewAllBooks;