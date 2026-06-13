# MyYardify Reviews

## Description

MyYardify Reviews is a full-stack web application that allows homeowners to review contractors, follow contractors, like contractor profiles, and view reviews through a feed system.

The purpose of the project is to help homeowners share experiences and discover local contractors through community feedback.

---

## Features

* Homeowner registration and login
* Contractor profiles
* Follow and unfollow contractors
* Like contractor profiles
* Leave reviews and ratings
* Edit reviews
* Review feed
* MySQL database storage

---

## Technologies Used

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express

### Database

* MySQL

### Development Tools

* Git
* GitHub
* GitHub Actions
* ESLint
* AWS EC2

---

## How to Run

### Backend

Open a terminal:

cd server

npm install

npm start

Backend runs on:

http://localhost:3001

### Frontend

Open a second terminal:

cd client

npm install

npm run dev

Frontend runs on:

http://localhost:5173

---

## Testing

GitHub Actions workflows:

* React Build Check
* JavaScript Syntax Check
* ESLint Code Quality Check

To run ESLint locally:

npx eslint .

---

## Security

Sensitive information is stored using environment variables.

Files such as:

.env

are excluded from version control using .gitignore.

---

## Deployment

The project was deployed and tested using AWS EC2.

---

## Future Improvements

* Stronger authentication
* Profile images
* Contractor verification
* Improved mobile responsiveness
* Enhanced search and filtering
* Production deployment automation
