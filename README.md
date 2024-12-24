# Secure File Share

A secure file-sharing web application built with React and Django, featuring end-to-end encryption, multi-factor authentication, and role-based access control.

## Features

- 🔐 End-to-end encryption using AES-256
- 👥 Multi-factor authentication (TOTP)
- 🔑 Role-based access control
- 🔄 File versioning system
- 🔍 Advanced file search and filtering
- 🏷️ File tagging system
- 🔗 Secure, expiring share links
- 📱 Responsive design

## Security Features

- AES-256 encryption for files at rest
- Client-side encryption/decryption
- JWT-based authentication with MFA
- HTTPS/TLS encryption in transit
- Password hashing using bcrypt
- Secure session handling
- Input validation and sanitization
- RBAC implementation

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/secure-file-share.git
cd secure-file-share
```

2. Generate SSL certificates (for development):

```bash
chmod +x scripts/generate-certs.sh
./scripts/generate-certs.sh
```

3. Create environment files:

`.env.backend`:

```env
DEBUG=1
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost
ENCRYPTION_MASTER_KEY=your-encryption-key-here
```

`.env.frontend`:

```env
VITE_API_URL=http://localhost:8000
```

4. Start the application:

```bash
docker-compose up --build
```

5. Access the application:

- Frontend: http://localhost (HTTP) or https://localhost (HTTPS)
- Backend API: http://localhost:8000 (HTTP) or https://localhost:8000 (HTTPS)

## Development

### Running Tests

Backend tests:

```bash
docker-compose exec backend python manage.py test
```

Frontend tests:

```bash
docker-compose exec frontend npm test
```

### Development Mode

For development with hot-reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

### Production Mode

For production deployment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register/
```

Request:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login

```http
POST /api/auth/login/
```

Request:

```json
{
  "username": "string",
  "password": "string"
}
```

#### Setup MFA

```http
POST /api/auth/mfa/setup/
```

Response:

```json
{
  "secret": "string",
  "qr_code": "string"
}
```

### Files

#### Upload File

```http
POST /api/files/
Content-Type: multipart/form-data
```

Request:

- `file`: File object

#### List Files

```http
GET /api/files/
```

Query Parameters:

- `search`: Search text
- `type`: File type filter
- `date_range`: Date range filter
- `size`: Size filter
- `sort`: Sort field

#### Share File

```http
POST /api/files/{id}/share/
```

Request:

```json
{
  "expiration_hours": "integer",
  "permissions": ["VIEW", "DOWNLOAD"]
}
```

#### Download File

```http
GET /api/files/{id}/download/
```

### Tags

#### Create Tag

```http
POST /api/tags/
```

Request:

```json
{
  "name": "string",
  "color": "string"
}
```

#### List Tags

```http
GET /api/tags/
```

## Security Considerations

1. File Encryption:

   - Files are encrypted using AES-256 before storage
   - Each file has a unique encryption key
   - Keys are securely stored and encrypted

2. Authentication:

   - JWT tokens with short expiration
   - MFA using TOTP
   - Password hashing with bcrypt

3. Access Control:

   - Role-based permissions
   - File-level access control
   - Share link expiration

4. Network Security:
   - HTTPS/TLS encryption
   - CORS configuration
   - Security headers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
