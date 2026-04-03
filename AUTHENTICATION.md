# Authentication Guide (Theory + Implementation)

This guide explains all major API authentication models and how to implement them in this Spring Boot project.

## 1) Authentication models

Authentication answers: "Who are you?"
Authorization answers: "What can you access?"

### A. Credential-based authentication

The client sends username/password to prove identity.

#### Basic Authentication
- Header format: `Authorization: Basic base64(username:password)`
- Credentials are sent on every request.
- No server session by default.
- Must always use HTTPS.

#### Session-based authentication
- Login once with username/password.
- Server creates session and sends cookie (for example `JSESSIONID`).
- Browser sends cookie on each next request.
- Server maps `sessionId -> user`.

Properties:
- Stateful: Yes
- Server-side storage: Required
- Horizontal scaling: Medium without shared session store
- Best for: Traditional server-rendered web apps

### B. Token-based authentication

The client logs in once and receives token(s), then sends token in request headers.

#### API key
- Header example: `x-api-key: <key>`
- Good for service-to-service or simple internal integrations.
- Usually identifies an application, not an end-user.

#### Bearer token (opaque)
- Header: `Authorization: Bearer <token>`
- Token meaning is known by auth server/introspection endpoint.

#### JWT (JSON Web Token)
- Format: `header.payload.signature`
- Signed token with claims, for example user, roles, expiry.
- Server validates signature and expiry, usually without DB lookup.

Example payload:

```json
{
  "sub": "uttam",
  "roles": ["ROLE_USER"],
  "exp": 1712345678
}
```

Properties:
- Stateful: No (for access-token validation path)
- Server-side storage: Not required for access token validation
- Horizontal scaling: High
- Best for: REST APIs, mobile clients, microservices

### C. Delegated/Federated authentication

Authentication is done by an external provider (Google, Okta, Azure AD, Keycloak).

#### OAuth2
- Delegation protocol.
- Lets your app access protected resources without handling user password directly.

#### OpenID Connect (OIDC)
- Identity layer on top of OAuth2.
- Adds ID token and standard user identity claims.

#### SSO
- Single Sign-On: one login across multiple apps.
- Often implemented with OIDC/SAML.

Properties:
- Stateful/stateless: Usually token-based and stateless in APIs
- External dependency: Yes
- Security: High when configured correctly
- Complexity: High

---

## 2) Correct comparison table

| Category | Example | Stateful | Scalable | Typical use case |
|---|---|---|---|---|
| Credential-based | Session/Cookie | Yes | Medium (needs shared session store at scale) | Traditional web apps |
| Token-based | JWT Bearer | No | High | Modern APIs, mobile |
| Delegated | OAuth2/OIDC | Mostly No (API side) | High | Social login, enterprise SSO |

Note: Basic Auth is not session-based, but still credential-based.

---

## 3) Which model should this project use?

For this `task-manager` REST backend, recommended default:
- JWT-based authentication for API clients
- Role-based authorization (`ROLE_USER`, `ROLE_ADMIN`)
- Optional OAuth2/OIDC login later for enterprise/social login

A practical stack:
- `JWT access token` (short expiry)
- `Refresh token` (longer expiry, revocable)
- `Spring Security` + method/endpoint role checks

---

## 4) Endpoint protection blueprint for current API

Current endpoints:
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `PATCH /api/tasks/{id}/complete`
- `PATCH /api/tasks/{id}/pending`
- `GET /api/tasks/search?keyword={keyword}`
- `GET /api/tasks?status={status}`
- `GET /api/tasks/stats`

Suggested access policy:

| Endpoint | Role |
|---|---|
| `GET /api/tasks`, `GET /api/tasks/{id}`, `GET /api/tasks/search`, `GET /api/tasks?status`, `GET /api/tasks/stats` | `ROLE_USER` or `ROLE_ADMIN` |
| `POST /api/tasks`, `PUT /api/tasks/{id}`, `PATCH /api/tasks/{id}/complete`, `PATCH /api/tasks/{id}/pending` | `ROLE_USER` or `ROLE_ADMIN` |
| `DELETE /api/tasks/{id}` | `ROLE_ADMIN` |

Public endpoints to allow without token:
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/register` (optional)
- `/actuator/health` (optional)

---

## 5) Spring Boot implementation patterns

## A) Basic Authentication (quick internal setup)

1. Add dependency in `backend/pom.xml`:
- `spring-boot-starter-security`

2. Configure users (in-memory for demo, DB for real use).

3. Security config (HTTP Basic):

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/tasks/**").authenticated()
            .anyRequest().permitAll())
        .httpBasic(Customizer.withDefaults())
        .build();
}
```

When to use:
- Internal tools only
- Short-term setup

Not recommended for public APIs.

## B) Session Authentication (form login/web app)

1. Add `spring-boot-starter-security`.
2. Enable form login and session policy.
3. If frontend is browser-based, protect against CSRF.
4. For clustered deployment, use Redis-backed Spring Session.

```java
.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
.formLogin(Customizer.withDefaults())
```

When to use:
- Server-rendered MVC apps
- Intranet apps with browser sessions

## C) JWT Authentication (recommended for this API)

### Required dependencies (`backend/pom.xml`)
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (or use Nimbus/JOSE)

### Typical components
- `AuthController` (`/api/auth/login`, `/api/auth/refresh`)
- `JwtService` (create/validate tokens)
- `JwtAuthFilter` (reads bearer token, sets SecurityContext)
- `CustomUserDetailsService`
- `SecurityConfig` with stateless session policy
- `User` and `Role` persistence models

### SecurityFilterChain (JWT)

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasRole("ADMIN")
            .requestMatchers("/api/tasks/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

### Login flow
1. Client sends username/password to `/api/auth/login`.
2. Server authenticates credentials.
3. Server returns access token (+ refresh token if used).
4. Client sends `Authorization: Bearer <accessToken>` on API calls.
5. On expiry, client calls `/api/auth/refresh`.

### JWT best practices
- Access token TTL: 10-20 minutes
- Refresh token TTL: 7-30 days
- Keep signing key in env var, not in Git
- Use key rotation strategy
- Include minimal claims (`sub`, `roles`, `iat`, `exp`, `jti`)
- Revoke refresh tokens on logout/password change

## D) OAuth2/OIDC (delegated login)

### Dependencies
- `spring-boot-starter-oauth2-client` (if your app handles login)
- `spring-boot-starter-oauth2-resource-server` (if your API validates external JWTs)

### Two common patterns
1. **Login app pattern (oauth2-client):** browser redirects to provider and logs in.
2. **Resource server pattern:** API accepts JWT issued by IdP.

### Resource server config example

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/tasks/**").authenticated()
            .anyRequest().permitAll())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
}
```

### `application.properties` example

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://<issuer>/realms/<realm>
```

Use this for enterprise SSO and external identity providers.

---

## 6) Implementation roadmap (recommended order)

1. Add Spring Security and protect all `/api/tasks/**` endpoints.
2. Implement local users + BCrypt password hashing.
3. Implement JWT login and bearer validation.
4. Add role-based endpoint restrictions.
5. Add refresh token and logout/revocation.
6. Add OAuth2/OIDC integration only if required.
7. Add security tests and negative tests.

---

## 7) Testing each auth type quickly

### Basic auth

```bash
curl -u user:password http://localhost:8080/api/tasks
```

### JWT bearer

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"uttam","password":"secret"}'

curl http://localhost:8080/api/tasks \
  -H 'Authorization: Bearer <access_token>'
```

### OAuth2 resource server token

```bash
curl http://localhost:8080/api/tasks \
  -H 'Authorization: Bearer <idp_issued_access_token>'
```

---

## 8) Security checklist (must-have)

- Enforce HTTPS in all non-local environments.
- Hash passwords with BCrypt/Argon2, never store plain text.
- Add brute-force protection/rate limiting on login.
- Add CORS policy for frontend origin(s) only.
- Keep JWT secret/keys in env or secret manager.
- Add audit logs for login failures and privilege changes.
- Validate and sanitize all request inputs.
- Keep dependencies patched (security updates).

---

## 9) Common mistakes to avoid

- Using long-lived access tokens without refresh strategy.
- Putting sensitive data inside JWT payload.
- Forgetting timezone/clock skew handling for expiry.
- Allowing broad CORS (`*`) in production.
- Treating OAuth2 as authentication without OIDC identity checks.

---

## 10) Final recommendation for this repo

Implement JWT first, then role-based authorization, then optional OAuth2/OIDC.

Target state:
- `JWT + RBAC` for current Task API
- Optional SSO support via OAuth2 resource server when needed
- Consistent integration tests for `401`, `403`, and happy-path access

