/*********************************************************************************
* WEB700 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Alexa Agabon Student ID: 151904232 Date: August 10, 2024
*
********************************************************************************/

const Sequelize = require('sequelize');

// Create a new Sequelize instance with your DB credentials
const sequelize = new Sequelize('AlexaDB', 'AlexaDB_owner', 'ENtLMOTF2r9V', {
    host: 'ep-fancy-hill-a53p3ewa.us-east-2.aws.neon.tech',
    dialect: 'postgres', 
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    addressStreet: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    addressCity: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    addressProvince: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    TA: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    courseId: { // Ensure courseId is defined in Student model
        type: Sequelize.INTEGER,
        references: {
            model: 'Courses',
            key: 'courseId'
        },
        allowNull: false
    }
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    courseCode: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    courseDescription: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

// Establish relationship: A Course has many Students
Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

// Initialize the database and sync models
module.exports.initialize = function () {
    return sequelize.sync()
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("unable to sync the database: " + err));
};

// Get all students
module.exports.getAllStudents = function () {
    return Student.findAll()
        .then((students) => Promise.resolve(students))
        .catch((err) => Promise.reject("no results returned: " + err));
};

// Get students by course ID
module.exports.getStudentsByCourse = function (courseId) {
    return Student.findAll({ where: { courseId: courseId } })
        .then((students) => {
            if (students.length > 0) {
                return Promise.resolve(students);
            } else {
                return Promise.reject("no results returned");
            }
        })
        .catch((err) => Promise.reject("no results returned: " + err));
};

// Get student by number
module.exports.getStudentByNum = function (num) {
    return Student.findAll({ where: { studentNum: num } })
        .then((students) => {
            if (students.length > 0) {
                return Promise.resolve(students[0]);
            } else {
                return Promise.reject("no results returned");
            }
        })
        .catch((err) => Promise.reject("no results returned: " + err));
};

// Get all courses
module.exports.getCourses = function () {
    return Course.findAll()
        .then((courses) => Promise.resolve(courses))
        .catch((err) => Promise.reject("no results returned: " + err));
};

// Get course by ID
module.exports.getCourseById = function (id) {
    return Course.findAll({ where: { courseId: id } }) 
        .then((courses) => {
            if (courses.length > 0) {
                return Promise.resolve(courses[0]);
            } else {
                return Promise.reject("no results returned");
            }
        })
        .catch((err) => Promise.reject("no results returned: " + err));
};

// Add a student
module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA === 'true'); // Ensure TA is true/false

    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.create(studentData)
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("unable to create student: " + err));
};

// Update a student
module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA === 'true'); // Ensure TA is true/false

    for (let key in studentData) {
        if (studentData[key] === "") {
            studentData[key] = null;
        }
    }

    return Student.update(studentData, { where: { studentNum: studentData.studentNum } })
        .then((result) => {
            if (result[0] > 0) {
                return Promise.resolve();
            } else {
                return Promise.reject("no results returned");
            }
        })
        .catch((err) => Promise.reject("unable to update student: " + err));
};

// Add a course
module.exports.addCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return Course.create(courseData)
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject("unable to create course: " + err));
};

// Update a course
module.exports.updateCourse = function (courseData) {
    for (let key in courseData) {
        if (courseData[key] === "") {
            courseData[key] = null;
        }
    }

    return Course.update(courseData, { where: { courseId: courseData.courseId } })
        .then((result) => {
            if (result[0] > 0) {
                return Promise.resolve();
            } else {
                return Promise.reject("no results returned");
            }
        })
        .catch((err) => Promise.reject("unable to update course: " + err));
};

// Delete a course by ID
module.exports.deleteCourseById = function (id) {
    return Course.destroy({ where: { courseId: id } })
        .then((result) => {
            if (result > 0) {
                return Promise.resolve();
            } else {
                return Promise.reject("course not found");
            }
        })
        .catch((err) => Promise.reject("unable to delete course: " + err));
};

// Delete a student by number
module.exports.deleteStudentByNum = function (studentNum) {
    return Student.destroy({ where: { studentNum: studentNum } })
        .then((result) => {
            if (result > 0) {
                return Promise.resolve();
            } else {
                return Promise.reject("student not found");
            }
        })
        .catch((err) => Promise.reject("unable to delete student: " + err));
};
