const express = require('express');
const router = express.Router();
const controller = require('../controller/course.control.js');
const verifyToken = require('../middlewares/checktoken.js');
const allowedto  = require('../middlewares/allowedto.js');
const roles = require('../utils/userRoles.js');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) { 
        const filetype = file.mimetype.split('/')[1];
        cb(null, `user-${Date.now()}.${filetype}`);

    }

});
const fileFilter = (req, file, cb) => {
    const filetype = file.mimetype.split('/')[0];
    if (filetype === 'image') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};
const filter = multer({ storage: storage, fileFilter: fileFilter });








router.route('/')
    .get(controller.getcourses)
    .post(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), controller.postcourse);

router.route('/:id')
    .get(controller.getCoursesById)
    .put(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), controller.updateCourse)
    .delete(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), controller.deletecourse);
router.route('/:id/upload-cover')
    .post(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), filter.single('avatar'), controller.uploadCourseCover);
module.exports = router;