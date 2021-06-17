const express = require('express');
const db = require('./db/models');
const csrf  = require('csurf');
const { response } = require('express');
const { check, validationResult } = require('express-validator');



const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

const bookValidators = [
  check('title')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Title')
    .isLength({ max: 255 })
    .withMessage('Title must not be more than 255 characters long'),
  check('author')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Author')
    .isLength({ max: 100 })
    .withMessage('Author must not be more than 100 characters long'),
  check('releaseDate')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Release Date')
    .isISO8601()
    .withMessage('Please provide a valid date for Release Date'),
  check('pageCount')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Page Count')
    .isInt({ min: 0 })
    .withMessage('Please provide a valid integer for Page Count'),
  check('publisher')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Publisher')
    .isLength({ max: 100 })
    .withMessage('Publisher must not be more than 100 characters long'),
];

const csrfProtection = csrf({ cookie: true })


// using asynchandler middleware so I aint gotta type try/catch for every route
// router.get('/', async (req, res, next) => {

//   try{
//     const books = await db.Book.findAll({
//       order: [['title', 'ASC']]
//     });
//     res.render('book-list', {
//       title: 'Books', books
//     })
//   } catch (err) {
//     next(err)
//   }
// });


router.get('/', asyncHandler( async (req, res, next) => {

  const books = await db.Book.findAll({
    order: [['title', 'ASC']]
  })

  res.render('book-list', {
    title: 'Book', books
  })

}))



router.get('/book/add', csrfProtection, (req, res, next) => {

  const book = db.Book.build() 
  res.render('book-add', {
    title: 'Add Book',
    book,
    csrfToken: req.csrfToken()
  })

})

router.post('/book/add', bookValidators, csrfProtection, asyncHandler(async (req, res, next) => {

  const {  
    title, 
    author, 
    releaseDate, 
    pageCount, 
    publisher
  } = req.body

  const book = db.Book.build({
    title, 
    author, 
    releaseDate, 
    pageCount, 
    publisher
  }) 
  
  try{
    await book.save();
    res.redirect('/')
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map((error) => error.message)
      res.render('book-add',{
        title: 'Add Book',
        book, 
        errors,
        csrfToken: req.csrfToken()
      })
    }else {
      next(err)
    }
  }
}))


module.exports = router;


