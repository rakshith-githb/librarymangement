const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const facultySchema = new mongoose.Schema({
    facultyname: {
        type: String,
        required: true, // Make facultyname a required field
        trim: true, // Remove extra spaces
    },
    facultyId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: false, // Optional field
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'], // Validation for 10-digit number
    },
    profileImage: {
        type: String, // Path to the uploaded image
        required: false,
    },
    
    role: { type: String, enum: ['admin', 'faculty'], default: 'faculty' },
    password: { type: String }, // Optional password field
    currentlyIssuedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    totalBooksIssued: { type: Number, default: 0 },
    resetPasswordToken: { type: String }, // Token for password reset
    resetPasswordExpires: { type: Date }, // Expiration time for the reset token
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to hash the password before saving
facultySchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
facultySchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'rishithagaddam79@gmail.com', // Replace with your Gmail address
        pass: 'zxnj pjun qhtp nlhn'    // Replace with the App Password
    }
});

module.exports = mongoose.model('Faculty', facultySchema);