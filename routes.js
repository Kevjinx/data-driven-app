const express = require('express');
const db = require('./db/models');
const csrf  = require('csurf');
const { response } = require('express');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

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

router.post('/book/add', csrfProtection, asyncHandler(async (req, res, next) => {

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
    res.render('book-add',{
      title: 'Add Book',
      book, 
      error: err,
      csrfToken: req.csrfToken()
    })
  }
}))


module.exports = router;


