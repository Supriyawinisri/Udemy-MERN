const express = require('express');
const authRouter = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//get auth user by id
authRouter.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ user });
    } catch (error) {
        return res.status(500).json({ msg: `Server error` });
    }
});

//login user
authRouter.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'User doesnot exist' }] });
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {
                expiresIn: '5 days'
            },
            (err, token) => {
                if (err) throw err;
                res.json({ token })
            }
        );
    } catch (error) {
        return res.status(500).json({ msg: `Server error` });
    }
})


module.exports = authRouter;