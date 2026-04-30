## Library Information Management System (LIMS)

A complete production-ready backend for a Library Information Management System built with Java 21, Spring Boot 3+, and JWT authentication.

### Tech Stack

- **Java 21**
- **Spring Boot 3.0+**
- **Spring Security with JWT**
- **Spring Data JPA / Hibernate**
- **MySQL**
- **Maven**
- **Lombok**
- **SpringDoc OpenAPI (Swagger)**
- **Validation API**

### Features

#### Authentication & Authorization

- User registration and login with JWT tokens
- Role-based access control (ADMIN, LIBRARIAN, STUDENT)
- Password hashing using BCrypt
- JWT token generation and validation

#### Core Features

- **Book Management**: Create, read, update, delete books with author, category, and shelf association
- **Borrow/Return System**: Manage book borrowing with automatic due dates (14 days)
- **Fine Management**: Automatic fine calculation for overdue books (₹1000 per day)
- **Reservations**: Reserve unavailable books with multiple book support
- **Reports & Analytics**: Dashboard statistics and activity tracking
- **User Management**: Admin controls for user accounts

### Database Schema

**Tables:**

- `users` - User accounts with roles
- `authors` - Book authors
- `categories` - Book categories
- `shelves` - Library shelf locations
- `books` - Book inventory with availability tracking
- `loans` - Borrowing records
- `reservations` - Book reservations
- `reserved_books` - Reservation details
- `fines` - Overdue book fines

### Setup Instructions

#### Prerequisites

- Java 21 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

#### Step 1: Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Execute the schema
source schema.sql
```

#### Step 2: Configure Application

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lims_db
    username: root
    password: your_password

jwt:
  secret: your-secret-key-change-this-in-production-make-it-at-least-256-bits-long
```

#### Step 3: Build & Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### API Documentation

#### Interactive API Docs

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### Authentication Endpoints

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "STUDENT",
  "contact": "+1234567890"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "createdAt": "2024-01-01T10:00:00"
    }
  }
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer {token}
```

### Book Endpoints

#### Create Book (ADMIN/LIBRARIAN)

```
POST /api/books
Authorization: Bearer {token}
Content-Type: application/json

{
  "isbn": "978-0451524935",
  "title": "The Shining",
  "description": "A horror novel",
  "quantity": 5,
  "availableCopies": 5,
  "authorId": 1,
  "categoryId": 1,
  "shelfId": 1
}
```

#### Get All Books

```
GET /api/books?page=0&size=10
```

#### Search Books

```
GET /api/books/search?query=Harry
```

#### Filter Books

```
GET /api/books/filter?categoryId=1&authorId=1&status=AVAILABLE&page=0&size=10
```

### Loan Endpoints

#### Borrow Book

```
POST /api/loans/borrow
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "bookId": 2
}
```

#### Return Book

```
POST /api/loans/return/{loanId}
Authorization: Bearer {token}
```

#### Get User Loans

```
GET /api/loans/user/{userId}?page=0&size=10
```

#### Get Overdue Loans (ADMIN/LIBRARIAN)

```
GET /api/loans/overdue
Authorization: Bearer {token}
```

### Reservation Endpoints

#### Create Reservation

```
POST /api/reservations
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "bookIds": [1, 2, 3]
}
```

#### Get User Reservations

```
GET /api/reservations/user/{userId}?page=0&size=10
```

#### Cancel Reservation

```
DELETE /api/reservations/{reservationId}
Authorization: Bearer {token}
```

### Fine Endpoints

#### Get User Fines

```
GET /api/fines/user/{userId}?page=0&size=10
```

#### Pay Fine (ADMIN/LIBRARIAN)

```
PUT /api/fines/pay/{fineId}
Authorization: Bearer {token}
```

### Report Endpoints

#### Get Dashboard

```
GET /api/reports/dashboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalBooks": 15,
    "borrowedBooks": 4,
    "availableBooks": 11,
    "overdueBooks": 2,
    "totalUsers": 20,
    "totalFines": 5
  }
}
```

#### Get Borrowed Books Report

```
GET /api/reports/borrowed-books
Authorization: Bearer {token}
```

#### Get Overdue Books Report

```
GET /api/reports/overdue-books
Authorization: Bearer {token}
```

#### Get User Activity

```
GET /api/reports/user-activity/{userId}
Authorization: Bearer {token}
```

### Default Test Credentials

After running the application with seed data:

| Email                 | Password     | Role      |
| --------------------- | ------------ | --------- |
| admin@library.com     | admin123     | ADMIN     |
| librarian@library.com | librarian123 | LIBRARIAN |
| alice@library.com     | student123   | STUDENT   |
| bob@library.com       | student123   | STUDENT   |

### Business Rules

#### Books

- Books can only be borrowed if available copies > 0
- Borrowing decreases available copies
- Returning increases available copies
- Status changes to OUT_OF_STOCK when availability = 0

#### Loans

- Due date automatically set to borrowDate + 14 days
- Overdue fines calculated at ₹1000 per day
- Automatic fine creation on late return

#### Fines

- Created automatically for overdue books
- Can be marked as paid by admin/librarian
- Visible to users in their account

### Security Features

- **JWT Authentication**: Stateless token-based authentication
- **Role-Based Authorization**: @PreAuthorize annotations on all endpoints
- **Password Hashing**: BCrypt encryption for passwords
- **CORS Support**: Configured for cross-origin requests
- **Global Exception Handling**: Standardized error responses

### Project Structure

```
src/main/java/com/andali/librarymanager/library_information_system/
├── config/
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── DataInitializer.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── auth/
│   ├── AuthService.java
│   ├── AuthController.java
│   ├── RegisterRequest.java
│   ├── LoginRequest.java
│   └── AuthResponse.java
├── user/
│   ├── User.java
│   ├── UserRepository.java
│   ├── UserService.java
│   └── UserController.java
├── book/
│   ├── Book.java
│   ├── BookRepository.java
│   ├── BookService.java
│   ├── BookController.java
│   └── BookDTO.java
├── loan/
│   ├── Loan.java
│   ├── LoanRepository.java
│   ├── LoanService.java
│   ├── LoanController.java
│   ├── LoanDTO.java
│   └── BorrowRequest.java
├── reservation/
│   ├── Reservation.java
│   ├── ReservedBook.java
│   ├── ReservationRepository.java
│   ├── ReservedBookRepository.java
│   ├── ReservationService.java
│   ├── ReservationController.java
│   ├── ReservationRequest.java
│   ├── ReservationDTO.java
│   └── ReservedBookDTO.java
├── fine/
│   ├── Fine.java
│   ├── FineRepository.java
│   ├── FineService.java
│   ├── FineController.java
│   └── FineDTO.java
├── report/
│   ├── ReportService.java
│   ├── ReportController.java
│   ├── DashboardDTO.java
│   └── LoanDTO.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BookNotAvailableException.java
│   └── DuplicateResourceException.java
├── common/
│   └── ApiResponse.java
└── LibraryInformationSystemApplication.java
```

### Building for Production

1. **Update JWT Secret**: Change the JWT secret in application.yml to a strong, random value (at least 256 bits)
2. **Update Database Configuration**: Set production database credentials
3. **Enable HTTPS**: Configure SSL/TLS certificates
4. **Set Appropriate Logging**: Change logging.level in application.yml to INFO
5. **Build JAR**:
   ```bash
   mvn clean package -DskipTests
   ```
6. **Deploy**:
   ```bash
   java -jar target/library_information_system-0.0.1-SNAPSHOT.jar
   ```

### Future Enhancements

- Email notifications for due dates and fines
- Book reviews and ratings
- Wishlist functionality
- Advanced search with filters
- Report generation (PDF export)
- SMS notifications
- Mobile app integration
- Analytics dashboard

### Support

For issues or questions, contact the library management team.

---

**Version**: 1.0.0  
**Last Updated**: 2024
