# Secure Coding Guidelines for DevOps Fraud Shield

## Overview
This document outlines secure coding practices that must be followed when developing the DevOps Fraud Shield application. These guidelines help prevent common security vulnerabilities and ensure the system remains secure.

## 1. Input Validation and Sanitization

### Always validate and sanitize user inputs
```python
# Good
def validate_project_id(project_id: str) -> bool:
    if not project_id or not isinstance(project_id, str):
        return False
    return bool(re.match(r'^(\d+|[\w\-/%]+)$', project_id))

# Bad - No validation
def process_project(project_id):
    query = f"SELECT * FROM projects WHERE id = {project_id}"
```

### Use parameterized queries
```python
# Good
cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))

# Bad - SQL injection vulnerable
cursor.execute(f"SELECT * FROM projects WHERE id = {project_id}")
```

## 2. Authentication and Authorization

### Never store passwords in plain text
```python
# Good - Use proper hashing
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# Bad
user.password = password
```

### Implement proper session management
- Use secure session cookies
- Implement session timeout
- Validate session tokens on each request

## 3. Secure Communication

### Use HTTPS for all external communications
```python
# Good
response = requests.get('https://api.example.com', verify=True)

# Bad
response = requests.get('http://api.example.com', verify=False)
```

### Validate SSL certificates
- Always verify SSL certificates
- Use certificate pinning for critical communications
- Keep certificates updated

## 4. Error Handling and Logging

### Never expose sensitive information in errors
```python
# Good
try:
    result = process_data(data)
except Exception as e:
    logger.error(f"Error processing data: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")

# Bad
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

### Log security events appropriately
```python
# Log security-relevant events
logger.warning(f"Failed login attempt for user: {username}")
logger.error(f"Potential security breach detected: {details}")
```

## 5. File and Resource Handling

### Validate file uploads
```python
# Good
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Bad - No validation
def upload_file(file):
    file.save('/uploads/' + file.filename)
```

### Prevent directory traversal
```python
# Good
from pathlib import Path
safe_path = Path(base_dir) / filename
safe_path = safe_path.resolve()
if not str(safe_path).startswith(str(base_dir)):
    raise ValueError("Invalid path")

# Bad
open(f"/uploads/{filename}", 'w')
```

## 6. Secure Configuration

### Never commit secrets to version control
```bash
# .env file (not committed)
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/db

# .env.example (committed)
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost/db
```

### Use environment variables for configuration
```python
# Good
import os
secret_key = os.getenv('SECRET_KEY')
if not secret_key:
    raise ValueError("SECRET_KEY environment variable not set")

# Bad - Hardcoded secrets
secret_key = "hardcoded-secret"
```

## 7. Dependency Management

### Keep dependencies updated
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use tools like `safety` for Python, `npm audit` for Node.js

### Audit third-party code
- Review third-party libraries for security issues
- Use reputable libraries with active maintenance
- Check dependency licenses

## 8. API Security

### Implement rate limiting
```python
# Use middleware or decorators for rate limiting
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    # Implement rate limiting logic
    pass
```

### Validate API inputs
```python
# Good
from pydantic import BaseModel

class ProjectRequest(BaseModel):
    project_id: str
    name: str

@app.post("/projects")
async def create_project(request: ProjectRequest):
    # Data is automatically validated
    pass
```

## 9. Code Review Checklist

Before committing code, ensure:

- [ ] All user inputs are validated and sanitized
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling without information leakage
- [ ] SQL queries use parameterized statements
- [ ] File operations prevent directory traversal
- [ ] HTTPS is used for external communications
- [ ] Dependencies are up to date and secure
- [ ] Code follows the principle of least privilege

## 10. Security Testing

### Automated Testing
- Implement unit tests for security functions
- Use static analysis tools (bandit, eslint security plugins)
- Run dependency vulnerability scans

### Manual Testing
- Test for common vulnerabilities (OWASP Top 10)
- Perform penetration testing
- Code review by security team

## 11. Incident Response

### Have an incident response plan
1. Identify security incidents
2. Contain the breach
3. Assess damage
4. Recover systems
5. Learn from incident

### Monitor and alert
- Set up monitoring for security events
- Configure alerts for suspicious activities
- Regular security audits

## 12. Compliance

### Follow relevant standards
- OWASP guidelines
- NIST cybersecurity framework
- Industry-specific regulations (if applicable)

### Documentation
- Document security measures
- Keep threat models updated
- Maintain security incident logs

## Conclusion

Security is an ongoing process, not a one-time implementation. Regularly review and update these guidelines based on new threats and lessons learned from incidents. All team members should be trained on these practices and security should be considered in all development decisions.