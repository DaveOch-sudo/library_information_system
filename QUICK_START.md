# Quick Start Guide - LIMS Backend

## 1. Database Setup (Windows/Mac/Linux)

### Option 1: Using Docker

```bash
docker run --name mysql-lims -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:latest
docker exec -i mysql-lims mysql -uroot -proot < schema.sql
```

### Option 2: Manual MySQL Setup

```bash
# Start MySQL service (Mac)
brew services start mysql

# Start MySQL service (Linux)
sudo systemctl start mysql

# Create database and tables
mysql -u root -p < schema.sql
```

## 2. Configure Application

Edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lims_db
    username: root
    password: root # Change this to your MySQL password
```

## 3. Build & Run

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

## 4. Verify Setup

Open browser and navigate to:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/api/auth/me

## 5. Login with Test Credentials

Use these credentials in Swagger UI or Postman:

```json
{
  "email": "admin@library.com",
  "password": "admin123"
}
```

## 6. Test Endpoints

### Register New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@library.com",
    "password": "admin123"
  }'
```

### Get Books

```bash
curl -X GET http://localhost:8080/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
library_information_system/
├── src/
│   ├── main/
│   │   ├── java/com/andali/librarymanager/library_information_system/
│   │   │   ├── config/           (Security, Swagger, Data Init)
│   │   │   ├── security/         (JWT, Auth filters)
│   │   │   ├── auth/             (Auth logic)
│   │   │   ├── user/             (User logic)
│   │   │   ├── book/             (Book logic)
│   │   │   ├── author/           (Author logic)
│   │   │   ├── category/         (Category logic)
│   │   │   ├── shelf/            (Shelf logic)
│   │   │   ├── loan/             (Loan logic)
│   │   │   ├── reservation/      (Reservation logic)
│   │   │   ├── fine/             (Fine logic)
│   │   │   ├── report/           (Report logic)
│   │   │   ├── exception/        (Exception handlers)
│   │   │   ├── common/           (Common responses)
│   │   │   └── LibraryInformationSystemApplication.java
│   │   └── resources/
│   │       └── application.yml   (Configuration)
│   └── test/                      (Test files)
├── pom.xml                        (Dependencies)
├── schema.sql                     (Database schema)
├── LIMS_README.md                (Full documentation)
└── QUICK_START.md                (This file)
```

## Troubleshooting

### Issue: Connection refused to database

**Solution**: Ensure MySQL is running and check credentials in `application.yml`

### Issue: Port 8080 already in use

**Solution**: Change port in `application.yml`:

```yaml
server:
  port: 8081
```

### Issue: JWT token validation fails

**Solution**: Use token from login response directly in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

## Key Features Implemented

✅ User Authentication & Authorization (JWT)
✅ Book Management CRUD
✅ Book Borrowing System with 14-day due dates
✅ Fine Management (₹1000/day for overdue)
✅ Book Reservations
✅ Role-Based Access Control
✅ Global Exception Handling
✅ Swagger/OpenAPI Documentation
✅ Data Validation
✅ Pagination & Sorting Support
✅ Search & Filter Functionality
✅ Seed Data Initialization

## Database Credentials

**MySQL Default:**

- Username: root
- Password: root
- Host: localhost
- Port: 3306
- Database: lims_db

## Test Credentials

| Email                 | Password     | Role      |
| --------------------- | ------------ | --------- |
| admin@library.com     | admin123     | ADMIN     |
| librarian@library.com | librarian123 | LIBRARIAN |
| alice@library.com     | student123   | STUDENT   |
| bob@library.com       | student123   | STUDENT   |

## Additional Commands

```bash
# Run tests
mvn test

# Build JAR
mvn clean package

# Run JAR
java -jar target/library_information_system-0.0.1-SNAPSHOT.jar

# View logs
mvn spring-boot:run -X  # Debug mode

# Clean build
mvn clean install
```

## API Base Path

All API endpoints start with: `http://localhost:8080/api/`

Example:

- Authentication: `http://localhost:8080/api/auth/`
- Books: `http://localhost:8080/api/books/`
- Loans: `http://localhost:8080/api/loans/`

## Next Steps

1. Review LIMS_README.md for comprehensive API documentation
2. Access Swagger UI to test all endpoints
3. Integrate with frontend application
4. Deploy to production server
5. Configure production JWT secret and database

For detailed API documentation, see **LIMS_README.md**
