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
git clone https://github.com/devansareen01/Faculty-Rating-System-Api-
```

### Backend Setup

Install dependencies:

```bash
npm install
```

Create a .env file in the backend directory with the following content:

```bash
SECRET_KEY=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

Start the server:

```bash
npm start
```

## API Endpoints

### Student Routes

#### 1. Student Login

- **Endpoint:** `POST /login`  
  **Description:** Log in a student.  
  **Request Body:**  
  ```json
  {
      "studentId": "string",
      "password": "string"
  }
  ```  
  **Response:** JSON object containing the success message and JWT token.

#### 2. Student Logout

- **Endpoint:** `POST /logout`  
  **Description:** Log out a student by invalidating the token.  
  **Response:** JSON object containing the success message.

#### 3. Get Courses for Student

- **Endpoint:** `GET /getCourses`  
  **Description:** Retrieve courses for the logged-in student.  
  **Response:** Array of course objects matching the student's semester and branch.

#### 4. Submit Feedback

- **Endpoint:** `POST /submitFeedback/`  
  **Description:** Submit feedback for a specific course.  
  **Request Body:**  
  ```json
  {
      "ratings": "number",
      "comments": "string"
  }
  ```  
  **Response:** JSON object containing the success message and the submitted feedback.

#### 5. Change Password

- **Endpoint:** `POST /changePassword`  
  **Description:** Change the student’s password.  
  **Request Body:**  
  ```json
  {
      "oldPassword": "string",
      "newPassword": "string"
  }
  ```  
  **Response:** JSON object containing the success message.


### Admin Routes

#### 1. Register Admin

- **Endpoint:** `POST /admin/register`  
  **Description:** Registers a new admin user.  
  **Request Body:**  
  ```json
  {
      "adminId": "string",
      "email": "string",
      "name": "string"
  }
  ```

#### 2. Admin Login

- **Endpoint:** `POST /admin/login`  
  **Description:** Authenticates an admin user and generates a token.  
  **Request Body:**  
  ```json
  {
      "adminId": "string"
  }
  ```

#### 3. Admin Logout

- **Endpoint:** `POST /admin/logout`  
  **Description:** Logs out an admin user by invalidating the token.  
  **Authorization:** Bearer token required.

#### 4. Register Faculty

- **Endpoint:** `POST /admin/register-faculty`  
  **Description:** Registers a new faculty member.  
  **Request Body:**  
  ```json
  {
      "facultyId": "string",
      "name": "string",
      "email": "string",
      "department": "string",
      "password": "string",
      "branch": "string",
      "semester": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 5. Get Faculty by Department

- **Endpoint:** `POST /admin/get-faculty`  
  **Description:** Retrieves all faculties in a specified department.  
  **Request Body:**  
  ```json
  {
      "department": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 6. Add Course

- **Endpoint:** `POST /admin/addCourse`  
  **Description:** Adds a new course to the system.  
  **Request Body:** (Refer to the Course model).  
  **Authorization:** Bearer token required.

#### 7. Get Courses and Feedbacks for Faculty

- **Endpoint:** `GET /admin/faculty/courses-and-feedbacks`  
  **Description:** Retrieves courses and feedbacks for a specified faculty.  
  **Authorization:** Bearer token required.

#### 8. Get Average Ratings for a Faculty's Course

- **Endpoint:** `GET /admin/faculty/:facultyId/course/:courseId/average-ratings`  
  **Description:** Retrieves average ratings for a specific course taught by a faculty member.  
  **Authorization:** Bearer token required.

#### 9. Delete Faculty by ID

- **Endpoint:** `DELETE /admin/delete_faculty`  
  **Description:** Deletes a faculty member by their ID.  
  **Request Body:**  
  ```json
  {
      "facultyId": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 10. Get All Faculty

- **Endpoint:** `GET /admin/get_all_faculty`  
  **Description:** Retrieves all faculty members in the system.  
  **Authorization:** Bearer token required.

#### 11. Get Courses by Department

- **Endpoint:** `POST /admin/get-courses`  
  **Description:** Retrieves all courses associated with a specified department.  
  **Request Body:**  
  ```json
  {
      "department": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 12. Delete Course

- **Endpoint:** `DELETE /admin/delete-course`  
  **Description:** Deletes a course by its ID.  
  **Request Body:**  
  ```json
  {
      "courseId": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 13. Update Faculty

- **Endpoint:** `PUT /admin/update-faculty`  
  **Description:** Updates the details of a faculty member.  
  **Request Body:**  
  ```json
  {
      "facultyId": "string",
      "name": "string",
      "email": "string",
      "department": "string"
  }
  ```
- **Authorization:** Bearer token required.

#### 14. Import Faculty from Excel

- **Endpoint:** `POST /admin/import-faculty`  
  **Description:** Imports faculty data from an Excel file.  
  **Authorization:** Bearer token required.  
  **File Upload:** The file should be attached as file.

#### 15. Import Courses from Excel

- **Endpoint:** `POST /admin/import-courses`  
  **Description:** Imports course data from an Excel file.  
  **Authorization:** Bearer token required.  
  **File Upload:** The file should be attached as file.

#### 16. Update Course

- **Endpoint:** `PUT /admin/update-course`  
  **Description:** Updates the details of a course.  
  **Request Body:**  
  ```json
  {
      "courseId": "string",
      "facultyId": "string"
  }
  ```
- **Authorization:** Bearer token required.

### Authentication Middleware

The following endpoints require a valid JWT token in the Authorization header:  
All admin routes except `/admin/register` and `/admin/login`.

### Faculty Routes

#### 1. Faculty Login

- **Endpoint:** `POST /login`  
  **Description:** Log in a faculty member.  
  **Request Body:**  
  ```json
  {
      "facultyId": "string",
      "password": "string"
  }
  ```  
  **Response:** JSON object containing a success message, JWT token, and faculty name.

#### 2. Faculty Logout

- **Endpoint:** `POST /logout`  
  **Description:** Log out a faculty member by invalidating the token.  
  **Response:** JSON object containing a success message.

#### 3. Student Registration

- **Endpoint:** `POST /student-register`  
  **Description:** Register a new student.  
  **Request Body:**  
  ```json
  {
      "studentId": "string",
      "email": "string",
      "name": "string",
      "branch": "string",
      "semester": "string",
      "password": "string",
      "incharge_id": "string"
  }
  ```  
  **Response:** JSON object containing a success message and the newly registered student.

#### 4. Import Students

- **Endpoint:** `POST /import-students`  
  **Description:** Import multiple students from an Excel file.  
  **Request Body:** Form-data with a file field.  
  **Response:** JSON object containing a success message.

#### 5. Get Students

- **Endpoint:** `POST /getStudents`  
  **Description:** Retrieve all students under the logged-in faculty member.  
  **Response:** Array of student objects.

#### 6. Change Password

- **Endpoint:** `POST /changePassword`  
  **Description:** Change the faculty member’s password.  
  **Request Body:**  
  ```json
  {
      "oldPassword": "string",
      "newPassword": "string"
  }
  ```  
  **Response:** JSON object containing a success message.

#### 7. Delete Student

- **Endpoint:** `DELETE /delete_student`  
  **Description:** Delete a student by their student ID.  
  **Request Body:**  
  ```json
  {
      "studentId": "string"
  }
  ```  
  **Response:** JSON object containing a success message.

#### 8. Update Student

- **Endpoint:** `PUT /update_student`  
  **Description:** Update student details.  
  **Request Body:**  
  ```json
  {
      "studentId": "string",
      "name": "string",
      "email": "string",
      "branch": "string",
      "semester": "string"
  }
  ```  
  **Response:** JSON object containing a success message and the updated student details.


## Database Models

### Student Model

**Fields**:
- `studentId`: String, unique identifier for the student.
- `name`: String, name of the student.
- `password`: String, hashed password for authentication.
- `branch`: String, branch of study.
- `semester`: String, current semester of the student.
- `token`: String, used for storing JWT token during the session.

### Course Model

**Fields**:
- `CourseId`: String, unique identifier for the course.
- `CourseName`: String, name of the course.
- `facultyId`: Number, identifier for the assigned faculty.
- `department`: String, department offering the course.
- `branch`: String, branch associated with the course.
- `semester`: String, semester during which the course is offered.

### Feedback Model

**Fields**:
- `courseId`: String, ID of the course being evaluated.
- `ratings`: Number, rating given by the student.
- `comments`: String, additional comments by the student.
- `studentId`: String, ID of the student providing the feedback.

### Faculty Model

**Fields**:
- `facultyId`: String, unique identifier for the faculty member.
- `name`: String, name of the faculty.
- `department`: String, department of the faculty.
- `courses`: Array of CourseId references for courses taught.

## Contributing

If you want to contribute to this project, feel free to create a pull request or open an issue to discuss your suggestions.

## Contact

For any inquiries or feedback, you can reach me at:  
**Email**: [devansareen6@gmail.com](mailto:devansareen6@gmail.com)
