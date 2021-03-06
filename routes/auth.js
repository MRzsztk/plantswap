const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    passReqToCallback: true
  })
)

router.post('/signup', (req, res, next) => {
  const { username, password} = req.body;

  if (password.length < 8) {
    res.render('auth/signup', {
      message: 'Your password must have at least 8 characters.'
    });
    return;
  }
  if (username === '') {
    res.render('auth/signup', { message: 'Please define a username.' });
    return;
  }

  User.findOne({ username: username }).then(found => {
    if (found !== null) {
      res.render('auth/signup', { message: 'username taken' });
    } else {
      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);

      User.create({ 
        username: username, 
        password: hash,
        // country: country,
        // zip: zip

       })
        .then(dbUser => {
          req.login(dbUser, err => {
            if (err) next(err);
            else res.redirect('/');
          });
          // redirect to login
          res.redirect('login');
        })
        .catch(err => {
          next(err);
        });
    }
  });
});


router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;