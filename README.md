# Feedback Portal

## Overview

The **Feedback Portal** is a web application designed to automate the process of collecting, analyzing, and presenting student feedback on teachers. It supports three types of user logins: Admin, Faculty, and Student, each with specific functionalities. The system allows for adding and managing faculty and students, course assignments, and anonymous feedback collection. It also provides visual and analytical insights into feedback data.

## Features

- **User Authentication**: Secure login for Admin, Faculty, and Students using JWT.
- **Course Management**: Admin can add and manage courses and assign faculty.
- **Feedback Collection**: Students can submit feedback for courses they are enrolled in.
- **Feedback Analysis**: Visual representation of feedback data for better insights.
- **Password Management**: Students can change their passwords securely.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: JWT
- **Styling**: Tailwind CSS (for any HTML responses)

## Installation

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Clone the Repository

```bash
git clone https://github.com/yourusername/feedback-portal.git
cd feedback-portal
Backend Setup
Navigate to the backend directory:

bash
Copy code
cd backend
Install dependencies:

bash
Copy code
npm install
Create a .env file in the backend directory with the following content:

plaintext
Copy code
SECRET_KEY=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
Start the server:

bash
Copy code
npm start
API Endpoints
Student Routes
POST /login

Description: Log in a student.
Request Body: { "studentId": "string", "password": "string" }
Response: JSON object containing the success message and JWT token.
POST /logout

Description: Log out a student by invalidating the token.
Response: JSON object containing the success message.
GET /getCourses

Description: Retrieve courses for the logged-in student.
Response: Array of course objects matching the student's semester and branch.
POST /submitFeedback/

Description: Submit feedback for a specific course.
Request Body: { "ratings": "number", "comments": "string" }
Response: JSON object containing the success message and the submitted feedback.
POST /changePassword

Description: Change the student’s password.
Request Body: { "oldPassword": "string", "newPassword": "string" }
Response: JSON object containing the success message.
Admin Routes
POST /login

Description: Log in as an admin.
Request Body: { "adminId": "string", "password": "string" }
Response: JSON object containing the success message and JWT token.
GET /students

Description: Retrieve a list of all students.
Response: Array of student objects.
POST /addStudent

Description: Add a new student to the system.
Request Body: { "studentId": "string", "name": "string", "password": "string", "branch": "string", "semester": "string" }
Response: JSON object containing the success message and the newly created student.
DELETE /deleteStudent/

Description: Delete a student from the system by their ID.
Response: JSON object containing the success message.
Database Models
Student Model
Fields:
studentId: String, unique identifier for the student.
name: String, name of the student.
password: String, hashed password for authentication.
branch: String, branch of study.
semester: String, current semester of the student.
token: String, used for storing JWT token during the session.
Course Model
Fields:
CourseId: String, unique identifier for the course.
CourseName: String, name of the course.
facultyId: Number, identifier for the assigned faculty.
department: String, department offering the course.
branch: String, branch associated with the course.
semester: String, semester during which the course is offered.
Feedback Model
Fields:
courseId: String, ID of the course being evaluated.
ratings: Number, rating given by the student.
comments: String, additional comments by the student.
studentId: String, ID of the student providing the feedback.
Faculty Model
Fields:
facultyId: String, unique identifier for the faculty member.
name: String, name of the faculty.
department: String, department of the faculty.
courses: Array of CourseId references for courses taught.
Contributing
If you want to contribute to this project, feel free to create a pull request or open an issue to discuss your suggestions.

License
This project is licensed under the MIT License.

Acknowledgments
Thank you to the open-source community for the libraries and tools that make development easier.

markdown
Copy code

### Notes:
- Ensure to replace `yourusername` with your actual GitHub username or the relevant URL for the repository.
- You can customize any sections to better fit your project specifics as needed.