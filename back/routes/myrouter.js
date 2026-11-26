import { Router } from 'express';
import passport from 'passport';
import ourControl from '../Controllers/ourController.js' 

const myRouter = Router();

myRouter.get('/api', ourControl.indexPage);

myRouter.get('/dashboard', 
    passport.authenticate('jwt', { session: false }), ourControl.dashPage);

myRouter.get('/home', ourControl.getAllPostsPublic);
myRouter.get('/blog', 
    passport.authenticate('jwt', { session: false }), 
    ourControl.getAllPostsToUser);
myRouter.get('/home/:id', ourControl.readPost);

// Testing login page


myRouter.post('/register', ourControl.registerUser);
myRouter.post('/login', ourControl.userLogin);
myRouter.post('/blog', 
    passport.authenticate('jwt', { session: false }), 
    ourControl.createPost);
myRouter.post('/dashboard', 
    passport.authenticate('jwt', { session: false }), 
    ourControl.createPost);
myRouter.post('/logout', ourControl.userLogout);

myRouter.post('/blog/:id', ourControl.postComment);
myRouter.post('/dashboard/:id', ourControl.postComment);

myRouter.put('/blog/:id', 
    passport.authenticate('jwt', { session: false }),
    ourControl.updateStatusPost);
myRouter.put('/blog/:id', 
    passport.authenticate('jwt', { session: false }),
    ourControl.editPost);

myRouter.put('/dashboard/:id', 
    passport.authenticate('jwt', { session: false }),
    ourControl.updateStatusPost);
myRouter.put('/dashboard/:id', 
    passport.authenticate('jwt', { session: false }),
    ourControl.editPost);

myRouter.delete('/blog/:id',
    passport.authenticate('jwt', { session: false }),
    ourControl.deletePost);

myRouter.delete('/dashboard/:id',
    passport.authenticate('jwt', { session: false }),
    ourControl.deletePost);

myRouter.delete('/blog/:postId/comments/:commentId', 
    passport.authenticate('jwt', { session: false }),
    ourControl.deleteComment);

myRouter.delete('/dashboard/:postId/comments/:commentId', 
    passport.authenticate('jwt', { session: false }),
    ourControl.deleteComment);


export default myRouter;