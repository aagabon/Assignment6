/******************************************************************************** *
WEB700 – Assignment 06
*
* I declare that this assignment is my own work in accordance with Seneca's * Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Alexa Agabon Student ID: 151904232 Date: August 10, 2024
*
* Published URL: ___________________________________________________________
*
********************************************************************************/

const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const data = require('./collegeData'); // Import data using `data` instead of `collegeData`

// Set up Handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to set the active route
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Add the express.urlencoded middleware
app.use(express.urlencoded({ extended: true }));

// Route to serve addStudent.html
app.get('/students/add', async (req, res) => {
    try {
        const courses = await data.getCourses(); // Use `data` to get courses
        res.render('addStudent', { courses: courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.render('addStudent', { courses: [] });
    }
});

// Route to handle adding a new student
app.post('/students/add', async (req, res) => {
    try {
        await data.addStudent(req.body); 
        res.redirect('/students'); // Redirect to list of students after adding
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Error adding student');
    }
});

// Route to render the home view
app.get('/', (req, res) => {
    res.render('home', { title: 'Home Page' });
});

// Route to render the about view
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Route to render the htmlDemo view
app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo', { title: 'HTML Demo' });
});

// Route to render the students view
app.get('/students', async (req, res) => {
    try {
        let students;
        if (req.query.course) {
            const course = parseInt(req.query.course);
            if (isNaN(course) || course < 1 || course > 7) {
                return res.render('students', { message: "Invalid course number. Must be between 1 and 7." });
            }
            students = await data.getStudentsByCourse(course); // Use `data` to get students by course
        } else {
            students = await data.getAllStudents(); // Use `data` to get all students
        }

        if (students.length === 0) {
            res.render('students', { message: "No results" });
        } else {
            res.render('students', { students: students });
        }
    } catch (error) {
        console.error(error);
        res.render('students', { message: "Internal server error" });
    }
});

// Route to render a single student's details view
app.get("/student/:studentNum", (req, res) => {
    // Initialize an empty object to store the values
    let viewData = {};

    // Fetch the student data by student number
    data.getStudentByNum(req.params.studentNum) // Use `data` to get student by number
        .then(studentData => {
            if (studentData) {
                viewData.student = studentData; // Store student data in the "viewData" object
            } else {
                viewData.student = null; // Set student to null if none were returned
            }
            // Proceed to get courses regardless of student data
            return data.getCourses(); // Use `data` to get courses
        })
        .then(courseData => {
            viewData.courses = courseData; // Store course data in the "viewData" object

            // Loop through viewData.courses and mark the selected course
            if (viewData.student) {
                viewData.courses.forEach(course => {
                    if (course.courseId == viewData.student.course) {
                        course.selected = true; // Mark the selected course
                    }
                });
            }
        })
        .catch(err => {
            // Handle errors
            console.error(err);
            viewData.courses = []; // Set courses to empty if there was an error
        })
        .then(() => {
            // Check if the student was found
            if (viewData.student == null) {
                res.status(404).send("Student Not Found"); // Return an error if no student was found
            } else {
                // Render the student view with the data
                res.render("student", { viewData: viewData });
            }
        });
});

// Route to render the courses view
app.get('/courses', async (req, res) => {
    try {
        const courses = await data.getCourses(); // Use `data` to get courses
        if (courses.length === 0) {
            res.render('courses', { message: 'No results' });
        } else {
            res.render('courses', { courses: courses });
        }
    } catch (error) {
        console.error(error);
        res.render('courses', { message: 'Internal server error' });
    }
});

// Route to render the addCourse view
app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

// Route to handle adding a new course
app.post('/courses/add', async (req, res) => {
    try {
        await data.addCourse(req.body); // Use `data` to add a course
        res.redirect('/courses');
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).send('Error adding course');
    }
});

// Route to render a single course details view
app.get('/course/:id', (req, res) => {
    const courseId = Number(req.params.id);
    data.getCourseById(courseId) // Use `data` to get course by ID
        .then((course) => {
            if (course) {
                res.render('course', { course });
            } else {
                res.status(404).send("Course not found");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Unable to retrieve course details");
        });
});

// Route to handle updating a course
app.post('/course/update', async (req, res) => {
    try {
        await data.updateCourse(req.body); // Use `data` to update a course
        res.redirect('/courses');
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).send('Error updating course');
    }
});

// Route to delete a course by ID
app.get('/course/delete/:id', async (req, res) => {
    try {
        await data.deleteCourseById(req.params.id); // Use `data` to delete a course by ID
        res.redirect('/courses');
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send('Unable to Remove Course / Course not found');
    }
});

// Route to handle deleting a student by number
app.get('/student/delete/:studentNum', async (req, res) => {
    try {
        await data.deleteStudentByNum(req.params.studentNum); // Use `data` to delete a student by number
        res.redirect('/students');
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).send('Unable to Remove Student / Student not found');
    }
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize data and start server
data.initialize().then(() => {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to initialize data:", err);
});
