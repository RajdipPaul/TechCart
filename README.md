# TechCart – AI-Powered Electronics Shopping Assistant

TechCart is an AI-powered electronics e-commerce platform that makes online shopping more personalized and interactive. It combines conversational AI with a product shopping experience, helping customers discover, compare, and choose electronics based on their individual needs, preferences, and budget.

Instead of simply browsing through hundreds of products, customers can interact with an AI shopping assistant that understands their requirements and provides relevant recommendations throughout their shopping journey.

## THE PROBLEM

Choosing the right electronic product online can be challenging. Customers often struggle to identify products that match their requirements, understand technical specifications, compare alternatives, and find compatible accessories.

TechCart addresses this by bringing personalized AI assistance directly into the electronics shopping experience.

## OUR SOLUTION

TechCart combines an AI-powered shopping assistant with a functional electronics e-commerce platform.

Users can describe their requirements in natural language, receive personalized product recommendations, compare suitable products, and discover complementary accessories based on their intended use.

The AI assistant maintains conversational context, allowing customers to refine their requirements without starting the conversation again.

## KEY FEATURES

- AI-Powered Shopping Assistant: Understands customer requirements through natural language conversations.
- Personalized Recommendations: Suggests electronics based on user preferences, budget, and intended use.
- Context-Aware Conversations: Maintains conversation history to provide relevant follow-up recommendations.
- Product Catalogue: Displays electronics with product images, descriptions, prices, and specifications.
- Product Comparison: Helps customers evaluate suitable products.
- Smart Add-on Suggestions: Recommends complementary accessories based on shopping intent.
- User Authentication: Supports customer registration, login, and profile management.
- Shopping Cart: Allows customers to add, update, and remove products.
- Order Management: Creates and tracks customer orders.
- PayPal Checkout: Integrates PayPal Sandbox for payment approval and capture.

## TECHNOLOGY STACK

### FRONTEND
- React / JavaScript (update according to the final implementation)
- HTML
- CSS

### BACKEND
- Java 22
- Spring Boot 4.1.2
- Spring Security
- JWT Authentication
- Maven

### DATABASE
- MySQL
- Spring Data JPA / Hibernate

### AI INTEGRATION
- Google Gemini 2.5 Flash API

### PAYMENT INTEGRATION
- PayPal Developer Platform
- PayPal Sandbox REST APIs
- PayPal OAuth 2.0
- PayPal Orders API
- PayPal Orders Capture API

### DEVELOPMENT AND TESTING
- Git and GitHub
- Postman
- VS Code / IntelliJ IDEA

## HOW IT WORKS

1. A customer registers or logs in to TechCart.
2. The customer interacts with the integrated AI shopping assistant.
3. The AI understands the customer's requirements and recommends relevant electronics.
4. The customer explores product details, compares options, and adds selected products to the cart.
5. TechCart suggests complementary accessories based on the customer's shopping intent.
6. The customer provides shipping information and creates an order.
7. PayPal Sandbox handles the checkout approval.
8. The backend captures the approved payment through PayPal.
9. The order is updated after successful payment capture.

## SYSTEM ARCHITECTURE

TechCart follows a frontend-backend architecture.

- Frontend: Handles the user interface, shopping experience, AI conversation interface, and checkout interaction.
- Spring Boot Backend: Handles authentication, product management, conversations, AI requests, cart operations, orders, and payment processing.
- MySQL: Stores user information, product data, conversations, messages, carts, and orders.
- Google Gemini: Processes conversational shopping requests and generates contextual recommendations.
- PayPal Sandbox: Handles test checkout, payment approval, and payment capture.

## PROJECT SETUP

### PREREQUISITES

Install the following:

- Java JDK 22
- Maven (or use the included Maven Wrapper)
- Node.js and npm
- MySQL Server
- Git

### 1. CLONE THE REPOSITORY

```bash
git clone https://github.com/Sima171003/TechCart.git
cd TechCart
```

### 2. DATABASE CONFIGURATION

Create a MySQL database:

```sql
CREATE DATABASE techcart;
```

Configure the database URL, username, and password in the backend's `application.properties` file or through the environment variables referenced by that file.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/techcart
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Make sure the MySQL server is running.

### 3. ENVIRONMENT VARIABLES

Configure the following environment variables before starting the backend:

| Variable | Description |
|---|---|
| DB_USERNAME | MySQL username, if referenced by the configuration |
| DB_PASSWORD | MySQL password, if referenced by the configuration |
| GEMINI_API_KEY | Google Gemini API key |
| PAYPAL_CLIENT_ID | PayPal Sandbox Business app Client ID |
| PAYPAL_CLIENT_SECRET | PayPal Sandbox Business app Client Secret |

Configure the JWT secret using the exact environment variable or property name referenced in the backend's `JwtService` and `application.properties`.

Do not commit API keys, passwords, JWT secrets, or other private credentials to the repository.

### 4. RUN THE BACKEND

Navigate to the backend directory:

```bash
cd TechCart-Backend
```

Compile the project:

```bash
.\mvnw.cmd clean compile
```

Start the Spring Boot application:

```bash
.\mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### 5. RUN THE FRONTEND

Navigate to the frontend directory:

```bash
cd TechCart-Frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Use the actual frontend start command and directory name from the final project structure.

Configure the frontend API base URL:

```javascript
http://localhost:8080
```

Ensure the backend CORS configuration allows the frontend's actual origin.

## PAYPAL SANDBOX TESTING

TechCart uses the PayPal Sandbox environment for testing payments without charging real money.

To test the payment flow:

1. Configure the PayPal Sandbox Business application's Client ID and Client Secret.
2. Start the backend and frontend.
3. Register or log in to TechCart.
4. Add products to the shopping cart.
5. Create an order and proceed to checkout.
6. Approve the payment using a Sandbox Personal Buyer account.
7. Allow the frontend to redirect to the payment success route.
8. The frontend calls the backend payment capture endpoint.
9. Verify that the payment status changes to PAID.

Sandbox credentials can be created and managed through the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).

All transactions are simulated. No real money is charged.

## API ENDPOINTS

The backend exposes REST APIs for the following modules:

| Module | Endpoint |
|---|---|
| Registration | POST `/api/auth/register` |
| Login | POST `/api/auth/login` |
| User Profile | GET `/api/users/me` |
| Update Profile | PUT `/api/users/me` |
| Deactivate Account | DELETE `/api/users/me` |
| Conversations | `/api/conversations` |
| AI Chat | POST `/api/ai/chat` |
| Products | `/api/products` |
| Shopping Cart | `/api/cart` |
| Orders | `/api/orders` |
| Create PayPal Checkout | POST `/api/orders/{orderId}/paypal/create` |
| Capture PayPal Payment | POST `/api/orders/{orderId}/paypal/capture` |

Protected endpoints require JWT authentication.

Include the access token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## SECURITY

- Passwords are securely hashed using BCrypt.
- JWT-based authentication protects user-specific operations.
- User data and conversations are associated with authenticated accounts.
- PayPal credentials and Gemini API keys are managed through environment variables.
- Payment processing uses the PayPal Sandbox environment.

## FUTURE SCOPE

- Enhanced product discovery and filtering.
- More advanced personalized recommendations.
- Improved compatibility-based accessory suggestions.
- Product availability and inventory enhancements.
- Deployment for wider accessibility.
- Additional payment and notification features.

## HACKATHON PROJECT

Built as part of the PayPal AI Hackathon.

TechCart demonstrates how conversational AI and digital payment infrastructure can work together to create a more intuitive and personalized electronics shopping experience.

## LICENSE

This project is licensed under the MIT License. See the `LICENSE` file for details.
