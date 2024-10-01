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
