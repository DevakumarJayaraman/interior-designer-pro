# Interior Designer Pro (Spring Boot + React Tailwind TSX + Redux)

This is a clean, consolidated full-stack codebase implementing the step-by-step interior designer workflow:

1. Client onboarding  
2. Project planning (areas, preferences via notes, basic measurements)  
3. Products + dimensions  
4. Draft quotation + totals  
5. Cutlist generation (starter)  
6. Material usage summary (starter sheet estimation)

## Run Backend
```bash
cd backend
gradle bootRun  # or generate wrapper: gradle wrapper && ./gradlew bootRun
```
- Swagger UI: http://localhost:8080/swagger
- H2 Console: http://localhost:8080/h2

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173 and calls backend at http://localhost:8080

## Notes
- Pricing is intentionally simple and will be refined later (templates, BOM pricing, etc.)
- Cutlist is a starter approach (1 cut-part per quote item). Extend into template-driven parts later.
