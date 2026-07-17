const bcrypt = require('bcryptjs');
const Faculty = require('../models/faculty');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    try {
        const { facultyId, password } = req.body;

        // Find faculty
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Send response with role for redirection
        res.status(200).json({
            message: "Login successful",
            role: faculty.role,
            facultyId: faculty.facultyId,
            email: faculty.email,
            facultyname: faculty.facultyname,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received forgot password request for:', email);
        
        // 1. Check if faculty exists with this email
        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            console.log('No account found with email:', email);
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email address' 
            });
        }

        // 2. Generate reset token - use crypto in a safer way
        let resetToken;
        try {
            resetToken = crypto.randomBytes(20).toString('hex');
            console.log('Generated reset token successfully');
        } catch (err) {
            console.error('Error generating token:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error generating reset token' 
            });
        }
        
        // 3. Save reset token to database (expires in 1 hour)
        faculty.resetPasswordToken = resetToken;
        faculty.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
        try {
            await faculty.save();
            console.log('Reset token saved to faculty record');
        } catch (err) {
            console.error('Error saving token to faculty:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error saving reset token' 
            });
        }

        // 4. Create transporter with proper configuration
        // Update to use a more reliable service configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rishithagaddam79@gmail.com',
                pass: 'zxnj pjun qhtp nlhn'  // Keep your app password
            },
            tls: {
                rejectUnauthorized: false // For development only - remove in production
            }
        });

        // 5. Send email with reset link (use localhost during development)
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        
        const mailOptions = {
            from: '"BookBase Library" <rishithagaddam79@gmail.com>',
            to: email,
            subject: 'Password Reset Request - BookBase Library',
            html: `
                <h2>Password Reset Request</h2>
                <p>Dear ${faculty.facultyname},</p>
                <p>You have requested to reset your password for BookBase Library Management System.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this reset, please ignore this email.</p>
                <br>
                <p>Best regards,<br>BookBase Library Team</p>
            `
        };

        // Send the email and handle response properly
        try {
            await transporter.sendMail(mailOptions);
            console.log('Password reset email sent to:', email);
            
            res.status(200).json({ 
                success: true, 
                message: 'Password reset email sent' 
            });
        } catch (err) {
            console.error('Error sending email:', err);
            res.status(500).json({ 
                success: false, 
                message: 'Error sending reset email. Please try again.',
                error: err.message
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending reset email. Please try again.',
            error: error.message 
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log('Reset password request for token:', token);

        // 1. Validate input
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // 2. Find faculty with valid reset token and not expired
        const faculty = await Faculty.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!faculty) {
            console.log('Invalid or expired token');
            return res.status(400).json({
                success: false,
                message: 'Password reset token is invalid or has expired'
            });
        }

        console.log('Found faculty with valid token:', faculty.facultyname);

        // 3. Update password (the pre-save hook will hash it)
        faculty.password = password;
        faculty.resetPasswordToken = undefined;
        faculty.resetPasswordExpires = undefined;
        
        await faculty.save();

        console.log('Password reset successful for:', faculty.facultyname);

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password. Please try again.',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    const { facultyId } = req.params;

    try {
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        res.status(200).json({
            facultyname: faculty.facultyname,
            facultyId: faculty.facultyId,
            email: faculty.email,
            phone: faculty.phone || '',
            mobile: faculty.mobile || '', // Include mobile in the response
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { facultyId } = req.params;
    const { facultyname, email, phone, mobile } = req.body;

    try {
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        faculty.facultyname = facultyname || faculty.facultyname;
        faculty.email = email || faculty.email;
        faculty.phone = phone || faculty.phone;
        faculty.mobile = mobile || faculty.mobile; // Update mobile

        await faculty.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const { facultyId } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Find faculty by facultyId
        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, faculty.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update with new password (will be hashed by pre-save hook)
        faculty.password = newPassword;
        await faculty.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};