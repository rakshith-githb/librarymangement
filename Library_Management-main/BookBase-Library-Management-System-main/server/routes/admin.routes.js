const express = require('express');
const mongoose = require('mongoose'); // Add this line
const router = express.Router();
const Faculty = require('../models/faculty');
const Book = require('../models/book');
const Feedback = require('../models/feedback');

const { Settings } = require('../models/settings');
const { Holiday } = require('../models/settings');

// Get all holidays
router.get('/settings/holidays', async (req, res) => {
    try {
        const holidays = await Holiday.find();
        res.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a holiday
router.post('/settings/holidays', async (req, res) => {
    try {
        const { date, description } = req.body;
        const newHoliday = new Holiday({ date, description });
        await newHoliday.save();
        res.status(201).json(newHoliday);
    } catch (error) {
        console.error('Error adding holiday:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a holiday
router.delete('/settings/holidays/:id', async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json({ message: 'Holiday removed successfully' });
    } catch (error) {
        console.error('Error removing holiday:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to check if user is admin
// const isAdmin = async (req, res, next) => {
//     try {
//         const faculty = await Faculty.findOne({ facultyId: req.user.facultyId });
//         if (!faculty || faculty.role !== 'admin') {
//             return res.status(403).json({ message: 'Access denied. Admin only.' });
//         }
//         next();
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [totalFaculty, totalBooks, availableBooks, issuedBooks, pendingFeedbacks] = await Promise.all([
            Faculty.countDocuments(),
            Book.countDocuments(),
            Book.countDocuments({ status: 'available' }),
            Book.countDocuments({ status: 'issued' }),
            Feedback.countDocuments({ status: 'Pending' })
        ]);

        res.json({
            totalFaculty,
            totalBooks,
            availableBooks,
            issuedBooks,
            pendingFeedbacks
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all faculty members
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await Faculty.find()
            .select('-__v')
            .populate('currentlyIssuedBooks');
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new faculty
router.post('/faculty', async (req, res) => {
    try {
        const { facultyId, facultyname, email, role, password = 'vnrvjiet@123' } = req.body;

        // Check for required fields
        if (!facultyId || !facultyname || !email) {
            return res.status(400).json({ message: 'Faculty ID, Name and Email are required' });
        }

        const existingFaculty = await Faculty.findOne({ $or: [{ facultyId }, { email }] });
        if (existingFaculty) {
            return res.status(400).json({ 
                message: existingFaculty.facultyId === facultyId 
                    ? 'Faculty ID already exists' 
                    : 'Email already exists'
            });
        }

        const faculty = new Faculty({
            facultyId,
            facultyname,
            email,
            password,
            role: role || 'faculty',
            currentlyIssuedBooks: [],
            totalBooksIssued: 0
        });

        const savedFaculty = await faculty.save();
        res.status(201).json(savedFaculty);
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ message: 'Error adding faculty', error: error.message });
    }
});

// Remove faculty by facultyId (not _id)
router.delete('/faculty', async (req, res) => {
    try {
        const facultyIds = req.body.facultyIds; // Array of faculty IDs to delete

        if (!Array.isArray(facultyIds) || facultyIds.length === 0) {
            return res.status(400).json({ message: 'No faculty IDs provided' });
        }

        // Loop through faculty IDs to check and delete each one
        for (const facultyId of facultyIds) {
            const faculty = await Faculty.findOne({ facultyId });

            if (!faculty) {
                return res.status(404).json({ message: `Faculty with ID ${facultyId} not found` });
            }

            // Check if the faculty has any currently issued books
            if (Array.isArray(faculty.currentlyIssuedBooks) && faculty.currentlyIssuedBooks.length > 0) {
                return res.status(400).json({ message: `Cannot remove faculty with ID ${facultyId} as they have issued books` });
            }

            // Delete faculty and user associated with the facultyId
            await Promise.all([
                Faculty.deleteOne({ facultyId }),
                // User.deleteOne({ facultyId })
            ]);
        }

        res.status(200).json({ message: 'Faculties removed successfully from all tables' });
    } catch (error) {
        console.error('Error removing faculty:', error.stack); // Log error stack for better debugging
        res.status(500).json({ message: 'Error removing faculty', error: error.message });
    }
});


router.patch('/faculty/:facultyId/status', async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.facultyId);
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        if (req.body.status === 'inactive' && faculty.currentlyIssuedBooks?.length > 0) {
            return res.status(400).json({ message: 'Cannot deactivate faculty with issued books' });
        }

        faculty.status = req.body.status;
        await faculty.save();
        
        res.status(200).json({ message: 'Faculty status updated successfully', faculty });
    } catch (error) {
        console.error('Error updating faculty status:', error);
        res.status(500).json({ message: 'Error updating faculty status', error: error.message });
    }
});

// Get all feedbacks with filters
router.get('/feedbacks', async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        const query = status !== 'all' ? { status } : {};
        
        const feedbacks = await Feedback.find(query)
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update feedback status
router.put('/feedbacks/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add admin response to feedback
router.put('/feedbacks/:id/respond', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { 
                adminResponse: req.body.adminResponse,
                status: 'Resolved'
            },
            { new: true }
        );
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get working hours
router.get('/settings/working-hours', async (req, res) => {
    try {
        const settings = await Settings.findOne();
        if (settings) {
            res.json(settings.workingHours);
        } else {
            res.json({ start: '09:00', end: '17:00' }); // Default working hours
        }
    } catch (error) {
        console.error('Error fetching working hours:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update working hours
router.post('/settings/working-hours', async (req, res) => {
    try {
        const { start, end } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({ workingHours: { start, end } });
        } else {
            settings.workingHours = { start, end };
        }
        await settings.save();
        res.json(settings.workingHours);
    } catch (error) {
        console.error('Error updating working hours:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Search book by ID
router.get('/books/search', async (req, res) => {
    try {
        const { bookId } = req.query;
        const book = await Book.findOne({ bookId });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        console.error('Error searching book:', error);
        res.status(500).json({ message: 'Error searching book' });
    }
});

// Add new book
router.post('/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Error adding book' });
    }
});

// Update book
router.put('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        res.json(book);
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Error updating book' });
    }
});

// Remove book
router.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book removed successfully' });
    } catch (error) {
        console.error('Error removing book:', error);
        res.status(500).json({ message: 'Error removing book' });
    }
});

// Issue book to faculty - SIMPLIFIED VERSION
router.put('/books/issue/:id', async (req, res) => {
    try {
        const { facultyId, issuedDate } = req.body;
        const bookId = req.params.id;

        console.log('Issue book request:', { bookId, facultyId, issuedDate });

        // Check if faculty exists
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Find and update the book
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Book current status:', book.status, 'issuedTo:', book.issuedTo);

        // Check for inconsistent data and fix it
        if (book.status === 'issued' && !book.issuedTo) {
            console.log('Fixing inconsistent book data - status is issued but no issuedTo field');
            book.status = 'available';
            book.issuedDate = null;
            book.dueDate = null;
            await book.save();
        }

        if (book.status !== 'available') {
            return res.status(400).json({ 
                message: `Book is not available for issue. Current status: ${book.status}${book.issuedTo ? `, issued to: ${book.issuedTo}` : ''}` 
            });
        }

        // Calculate due date (30 days from issue date)
        const dueDate = new Date(issuedDate);
        dueDate.setDate(dueDate.getDate() + 30);

        // Update book status first
        book.status = 'issued';
        book.issuedTo = facultyId;
        book.issuedDate = new Date(issuedDate);
        book.dueDate = dueDate;
        await book.save();

        // Use MongoDB's atomic operation to update faculty
        const updateResult = await Faculty.updateOne(
            { facultyId: facultyId },
            { 
                $addToSet: { currentlyIssuedBooks: book._id }, // Use $addToSet to avoid duplicates
                $inc: { totalBooksIssued: 1 }
            }
        );

        console.log('Faculty update result:', updateResult);

        if (updateResult.matchedCount === 0) {
            // If faculty update failed, revert book changes
            book.status = 'available';
            book.issuedTo = null;
            book.issuedDate = null;
            book.dueDate = null;
            await book.save();
            return res.status(500).json({ message: 'Failed to update faculty record' });
        }

        console.log('Book issued successfully:', book._id);

        res.status(200).json({ 
            message: 'Book issued successfully', 
            book,
            faculty: {
                facultyId: faculty.facultyId,
                facultyName: faculty.facultyName
            }
        });
    } catch (error) {
        console.error('Error issuing book:', error);
        res.status(500).json({ message: 'Error issuing book', error: error.message });
    }
});

// Return book from faculty - SIMPLIFIED VERSION
router.put('/books/return/:id', async (req, res) => {
    try {
        const bookId = req.params.id;

        console.log('Return book request:', { bookId });

        // Find the book
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.status !== 'issued') {
            return res.status(400).json({ message: 'Book is not currently issued' });
        }

        const facultyId = book.issuedTo;

        // Update book status
        book.status = 'available';
        book.returnedDate = new Date();
        book.issuedTo = null;
        book.issuedDate = null;
        book.dueDate = null;
        await book.save();

        // Use MongoDB's atomic operation to update faculty
        await Faculty.updateOne(
            { facultyId: facultyId },
            { $pull: { currentlyIssuedBooks: bookId } }
        );

        console.log('Book returned successfully:', book._id);

        res.status(200).json({ 
            message: 'Book returned successfully', 
            book,
            returnedBy: facultyId
        });
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
});

// Clean up faculty data (add this route temporarily)
router.post('/cleanup-faculty-data', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        
        for (let faculty of faculties) {
            if (faculty.currentlyIssuedBooks) {
                // Clean up currentlyIssuedBooks to ensure they are all valid ObjectIds
                faculty.currentlyIssuedBooks = faculty.currentlyIssuedBooks.filter(item => {
                    // Check if it's a valid ObjectId
                    try {
                        return mongoose.Types.ObjectId.isValid(item);
                    } catch (error) {
                        return false;
                    }
                });
                await faculty.save();
            }
        }
        
        res.json({ message: 'Faculty data cleaned up successfully' });
    } catch (error) {
        console.error('Error cleaning up faculty data:', error);
        res.status(500).json({ message: 'Error cleaning up data', error: error.message });
    }
});

// Debug route to fix data inconsistencies
router.post('/fix-book-data', async (req, res) => {
    try {
        const books = await Book.find({});
        let fixedBooks = 0;
        
        for (let book of books) {
            // Fix books that are marked as issued but have no issuedTo
            if (book.status === 'issued' && (!book.issuedTo || book.issuedTo.trim() === '')) {
                book.status = 'available';
                book.issuedTo = null;
                book.issuedDate = null;
                book.dueDate = null;
                await book.save();
                fixedBooks++;
                console.log(`Fixed book ${book.bookId} - was marked as issued but had no faculty assigned`);
            }
        }
        
        res.json({ 
            message: `Data consistency check completed. Fixed ${fixedBooks} books.`,
            fixedBooks: fixedBooks
        });
    } catch (error) {
        console.error('Error fixing book data:', error);
        res.status(500).json({ message: 'Error fixing book data', error: error.message });
    }
});

module.exports = router;