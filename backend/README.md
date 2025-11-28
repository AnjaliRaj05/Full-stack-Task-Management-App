### Backend API is hosted on [https://book-management-backend-api.onrender.com]
#  Library Management System API

This API is built with **Node.js + Express** and provides full CRUD functionality for managing users, books, authors, loans, reviews, and file uploads in a library system.

---

## Book Module

Handles all operations related to books.

| Method | Endpoint            | Description                        |
|--------|---------------------|------------------------------------|
| GET    | /api/books          | Fetch all books                    |
| GET    | /api/books/:id      | Fetch a book by ID                 |
| POST   | /api/books          | Create a new book                  |
| PUT    | /api/books/:id      | Update a book by ID                |
| DELETE | /api/books/:id      | Delete a book by ID                |

---
