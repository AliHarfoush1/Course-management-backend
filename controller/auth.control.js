const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const status = require('../utils/status.js');
const asyncwrapper = require('../middlewares/middlewares.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/apperror.js');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/generateJWT.js');



const postuser = asyncwrapper(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return next(new AppError("All fields are required", 400));
    }
    if (password.length < 8) {
        return next(new AppError("Password must be at least 8 characters long", 400));
    }
    const oldUser = await User.findOne({ email });

    if (oldUser) {
        const error = new Error("Email already exists");
        error.statusCode = 400;
        return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "STUDENT",
        avatar: req.file ? `/uploads/${req.file.filename}` : "/uploads/profile.jpg"
    });

    const payload = {
    id: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role
};

const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);

    newUser.refreshToken = refreshToken;

    await newUser.save();

    res.status(201).json({
        status: status.SUCCESS,
        data: {
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar
            },
            accessToken,
            refreshToken
        }
    });
});

const loginuser = asyncwrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Email and password are required", 400));
    }
   
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("Invalid email or password", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
   
    if (!isPasswordValid) {
        return next(new AppError("Invalid email or password", 401));
    }

  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
};

const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000
});

res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
        status: status.SUCCESS,
        message: "Login successful",
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
           
        }
    });
});

const refreshAccessToken = asyncwrapper(async (req, res, next) => {
    const { refreshToken } = req.cookies.refreshToken ? req.cookies : req.body;

    if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.refreshToken !== refreshToken) {
        return next(new AppError("Invalid refresh token", 401));
    }

    const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    };

    const newAccessToken = generateAccessToken(payload);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000
    });
    res.status(200).json({
        status: status.SUCCESS,
        message: "Access token refreshed successfully"
        
    });
});
const logoutUser = asyncwrapper(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const user = await User.findOne({ refreshToken });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    }

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.status(200).json({
        status: status.SUCCESS,
        message: "Logged out successfully"
    });
});
const updateUserRole = asyncwrapper(async (req, res, next) => {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError("User not found", 404));
    }
const allowedRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];

if (!allowedRoles.includes(role)) {
    return next(new AppError("Invalid role", 400));
}
    user.role = role;
    await user.save();

    res.status(200).json({
        status: status.SUCCESS,
        message: "User role updated successfully",
        data: {
            user
        }
    });
});
module.exports = {
    postuser,
    loginuser,
    refreshAccessToken,
    logoutUser,
    updateUserRole
};