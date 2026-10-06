# Design Decisions

This document explains important architectural and security decisions made during the development of the Task Management API.

## Authentication & Security

### JWT Token-Based Authentication
**Decision**: Used JWT (JSON Web Tokens) for authentication instead of session-based authentication.

**Rationale**:
- Stateless authentication scales better for REST APIs
- No server-side session storage required
- Easy to implement across multiple services
- Tokens can be stored client-side (localStorage, cookies)
- Built-in expiration mechanism

**Implementation**: Tokens are signed with a secret key from environment variables and have a configurable expiration time (default 7 days).

### Password Hashing with bcryptjs
**Decision**: All passwords are hashed using bcryptjs before storage in the database.

**Rationale**:
- bcrypt is a industry-standard hashing algorithm designed specifically for passwords
- Automatically handles salt generation and management
- Computationally intensive, making brute-force attacks impractical
- Built-in work factor can be adjusted as hardware improves

**Implementation**: Passwords are hashed with a salt factor of 10 in a pre-save middleware hook on the User model.

### Rate Limiting on Login
**Decision**: Implemented rate limiting specifically on the login endpoint (5 attempts per 15 minutes).

**Rationale**:
- Prevents brute-force password attacks
- Reduces risk of credential stuffing
- Limits impact of automated attack tools
- Doesn't affect other endpoints that don't have the same risk profile

**Implementation**: Using express-rate-limit middleware with a sliding window counter.

### Security Headers with Helmet
**Decision**: Integrated Helmet middleware to set security-related HTTP headers.

**Rationale**:
- Automatically sets various security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Protects against well-known web vulnerabilities
- Minimal configuration required for basic protection
- Industry best practice for Express applications

### Password Exclusion from API Responses
**Decision**: Password field is always excluded from API responses using Mongoose schema options.

**Rationale**:
- Never expose sensitive data in API responses
- Even hashed passwords could be used in offline attacks
- Reduces attack surface significantly
- Follows principle of least privilege

**Implementation**: Used `select: false` in User schema and custom `toJSON()` method to ensure password is never serialized.

## Database Design

### MongoDB with Mongoose
**Decision**: Used MongoDB as the database with Mongoose ODM.

**Rationale**:
- Flexible schema design for evolving requirements
- Built-in support for nested documents and arrays
- Excellent scalability and performance
- Mongoose provides validation, middleware, and type safety
- Natural fit for JavaScript/Node.js applications

### Task Ownership via User Reference
**Decision**: Each task has a required `user` field that references the User who created it.

**Rationale**:
- Enables proper data isolation between users
- Simple and efficient querying of user-specific tasks
- Prevents unauthorized access through database-level filtering
- Supports future features like task sharing or collaboration

**Implementation**: All task queries include `{ user: req.user.id }` filter to ensure users only access their own tasks.

### Database Indexes
**Decision**: Added compound indexes on `user + status` and `user + createdAt`.

**Rationale**:
- Optimizes common query patterns (filtering by user and status)
- Improves pagination performance (sorting by createdAt)
- Reduces query response time as data grows
- Minimal storage overhead for significant performance gain

## API Design

### Consistent JSON Response Format
**Decision**: All API responses follow a consistent structure with `success`, `message`, and `data` fields.

**Rationale**:
- Predictable response structure for frontend developers
- Easy to handle success/error states uniformly
- Clear separation of metadata and actual data
- Industry standard for REST APIs
- Simplifies error handling in client applications

### RESTful Routing
**Decision**: Followed REST principles for route design and HTTP method usage.

**Rationale**:
- Industry-standard approach for API design
- Intuitive and self-documenting
- Leverages HTTP semantics (GET for read, POST for create, etc.)
- Easy to understand and use
- Works well with HTTP caching and proxies

**Implementation**:
- POST /api/auth/register - Create user
- POST /api/auth/login - Authenticate
- GET /api/auth/me - Get profile
- POST /api/tasks - Create task
- GET /api/tasks - List tasks
- GET /api/tasks/:id - Get specific task
- PUT/PATCH /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Pagination for Task Listing
**Decision**: Implemented pagination with `page` and `limit` query parameters.

**Rationale**:
- Prevents large response payloads
- Improves API performance
- Better user experience with manageable data sets
- Standard practice for list endpoints
- Supports infinite scroll and other UI patterns

**Implementation**: Uses MongoDB `skip()` and `limit()` with total count for pagination metadata.

### Search and Filter Support
**Decision**: Added optional `status` filter and `search` parameter for task listing.

**Rationale**:
- Enhances usability without complexity
- Common requirement for task management applications
- Flexible filtering without additional endpoints
- Uses MongoDB query capabilities efficiently

**Implementation**: Regex search on title field and direct equality check on status field.

## Code Architecture

### Separation of Concerns
**Decision**: Organized code into distinct layers: routes, controllers, models, middlewares, validators.

**Rationale**:
- Each module has a single responsibility
- Easy to test individual components
- Simplifies maintenance and debugging
- Follows MVC-like pattern
- Makes code more readable and understandable

**Structure**:
- Routes: Handle HTTP routing and middleware chain
- Controllers: Contain business logic
- Models: Define data structure and database operations
- Middlewares: Cross-cutting concerns (auth, error handling)
- Validators: Input validation logic

### Centralized Error Handling
**Decision**: Implemented a global error handler middleware to catch and format all errors.

**Rationale**:
- Consistent error responses across all endpoints
- No stack traces exposed in production
- Single place to modify error handling logic
- Handles different error types appropriately
- Simplifies controller code

**Implementation**: Error handler middleware catches Mongoose errors, JWT errors, and generic errors, returning appropriate HTTP status codes and messages.

### Input Validation with Joi
**Decision**: Used Joi library for request validation in dedicated validator modules.

**Rationale**:
- Declarative validation schemas
- Clear and readable validation rules
- Custom error messages for better UX
- Separates validation from business logic
- Type safety and schema validation

**Implementation**: Separate validator files for auth and task operations with middleware that validates before controller execution.

### Environment-Based Configuration
**Decision**: All sensitive configuration loaded from environment variables using dotenv.

**Rationale**:
- Security: Secrets never committed to code
- Flexibility: Easy to change config without code changes
- Best Practice: Industry standard for configuration management
- Deployment: Different configs for dev/staging/production
- Security: Prevents accidental exposure of secrets

**Implementation**: Central config module loads all environment variables with sensible defaults.

## Authorization

### JWT-Based Authorization
**Decision**: Used JWT tokens stored in Authorization header for protected routes.

**Rationale**:
- Stateless and scalable
- No server-side session storage
- Easy to implement across services
- Built-in expiration
- Industry standard for REST APIs

**Implementation**: `protect` middleware extracts and verifies JWT token, attaches user to request object.

### User Identity from JWT, Not Request Body
**Decision**: User identity is always extracted from JWT token, never from request body.

**Rationale**:
- Security: Prevents privilege escalation attacks
- Trust: JWT is trusted source, request body is not
- Consistency: Single source of truth for user identity
- Best Practice: Never trust client-provided user IDs

**Implementation**: All task operations use `req.user.id` from JWT, not any user field from request body.

### Ownership Verification
**Decision**: Explicit ownership check before allowing access/update/delete of tasks.

**Rationale**:
- Security: Prevents unauthorized access to other users' data
- Defense in Depth: Multiple layers of security
- Clear Error Messages: Users know why access is denied
- Audit Trail: Can track unauthorized access attempts

**Implementation**: Each task operation checks `task.user.toString() === req.user.id` before proceeding.

## Error Handling

### Meaningful Error Messages
**Decision**: All validation and business logic errors return clear, actionable error messages.

**Rationale**:
- Better developer experience
- Easier debugging
- Improved user experience
- Reduces support burden
- Industry best practice

**Implementation**: Custom error messages in Joi schemas and controller logic.

### Proper HTTP Status Codes
**Decision**: Used appropriate HTTP status codes for different error scenarios.

**Rationale**:
- Semantic correctness
- Better API client handling
- Industry standard compliance
- Enables proper error handling on client side

**Implementation**:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (access denied)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (unexpected errors)

### Invalid ObjectId Handling
**Decision**: Proper handling of invalid MongoDB ObjectId values in route parameters.

**Rationale**:
- Prevents server crashes from invalid input
- Returns appropriate 400/404 responses
- Better error messages for API consumers
- Robust error handling

**Implementation**: Error handler catches CastError from Mongoose and returns 404 for invalid ObjectIds.

## Future Considerations

### Refresh Tokens
**Decision**: Not implemented in current version, but architecture supports easy addition.

**Rationale**: Current implementation is sufficient for the requirements. Refresh tokens add complexity but improve security by allowing shorter-lived access tokens.

### Role-Based Access Control
**Decision**: Added role field to User schema (user/admin) but not implemented RBAC.

**Rationale**: Schema prepared for future expansion. Current requirements don't need admin functionality.

### Task Sorting
**Decision**: Default sorting by createdAt (newest first), but architecture supports additional sort options.

**Rationale**: Most common use case. Can easily add sort parameter to query string if needed.

### Automated Testing
**Decision**: Not implemented in current version due to time constraints.

**Rationale**: Postman collection provides manual testing. Jest/Supertest can be added for automated tests in future iterations.

## Summary

This API follows industry best practices for security, architecture, and API design. All decisions prioritize security, maintainability, and developer experience while meeting the specified requirements. The modular architecture makes it easy to extend with additional features in the future.
