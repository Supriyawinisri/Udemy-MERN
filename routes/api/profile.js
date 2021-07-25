const express = require('express');
const profileRouter = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../model/Profile');
const User = require('../../model/User');
const { check, validationResult } = require('express-validator');

//get my profile - Private
profileRouter.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: `Profile not found` });
        }
        res.json(profile);
    } catch (error) {
        console.error(err.message);
        return res.status(500).json({ msg: `Server error` });
    }
})

//create or update profile - Private
profileRouter.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty(),
]],async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).json({ error: errors.array() });
    else{
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
         profileFields.social = {};
         if(youtube) profileFields.social.youtube = youtube;
         if(facebook) profileFields.social.facebook = facebook;
         if(twitter) profileFields.social.twitter = twitter;
         if(instagram) profileFields.social.instagram = instagram;
         if(linkedin) profileFields.social.linkedin = linkedin;
        
         try {
             let profile = await Profile.findOne({ user : req.user.id});
             //update
             if(profile){
                profile = await Profile.findOneAndUpdate(
                    {user : req.user.id},
                    {$set : profileFields},
                    { new : true}
                );
                return res.json(profile);
             }
             //create
             profile = new Profile(profileFields);
             await profile.save();
             res.json(profile);
         } catch (error) {
             console.log(error.message);
             res.status(500).send('Server Error');
         }
    }
})

//get all profile - public
profileRouter.get('/',async (req,res) => {
    try {
        const profile = await Profile.find().populate('user',['name','avatar']);
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ msg: `Server error` });
    }
})

//get user prifile by id - public
profileRouter.get('/user/:user_id',async (req,res) => {
    try{
        const profile = await Profile.findOne({ user : req.params.user_id }).populate('user',['name','avatar']);
        if(!profile) 
            return res.status(400).json({ msg: `Profile not found` });
        return res.json(profile);
    }
    catch(err){
        console.log(err.message);
        if(err.kind == 'ObjectId')
            return res.status(400).json({ msg: `Profile not found` });
        return res.status(500).json({ msg: `Server error` });
    }
})

//delete user by id  - private
profileRouter.delete('/',auth,async (req,res) => {
    try {
        //remove profile
        await Profile.findOneAndRemove({ user : req.user.id});
        //remove user
        await User.findOneAndRemove({ _id : req.user.id});
        res.json({
            msg : 'User deleted successfully'
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ msg: `Server error` });
    }
})

module.exports = profileRouter;