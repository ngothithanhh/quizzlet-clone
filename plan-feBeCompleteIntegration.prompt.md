# PLAN: Kết Nối FE-BE Hoàn Chỉnh - Hiển Thị Dữ Liệu Ổn Định

**Tl;DR**: Thiết lập kết nối stable giữa NextJS Frontend (tRPC) và Spring Boot Backend (REST API). Xác định vấn đề hiện tại, cấu hình đầy đủ, và đảm bảo FE nhận & hiển thị dữ liệu từ BE mà không lỗi.

---

## Bước 1: Xác Định & Phân Tích Vấn Đề Hiện Tại

1. Kiểm tra database MySQL có dữ liệu Study Sets chưa
2. Verify Backend chạy & API endpoints hoạt động (Swagger UI)
3. Xác nhận tRPC client đang kết nối đúng URL backend
4. Test query database queries (leftJoin vs innerJoin fix)

---

## Bước 2: Cấu Hình Backend (BE)

### 2.1 Verify MySQL Database
- Database name: `quizzlet_clone` đã tạo?
- Tables có data: `StudySet`, `Flashcard`, `User`?
- Connection string: `jdbc:mysql://localhost:3306/quizzlet_clone`

### 2.2 Verify application.yaml (Spring Boot)
- Port: `8080` ✓
- Context path: `/quizzlet-clone` ✓
- CORS enabled: `localhost:3000` ✓
- JWT secret configured ✓
- Cloudinary keys (if needed)

### 2.3 Check Key Controllers
- Study Set Controller (`/api/studysets` endpoints)
- Verify PUBLIC access endpoints (no JWT required for list/search)

---

## Bước 3: Cấu Hình Frontend (FE)

### 3.1 Verify tRPC Configuration
**File**: `src/trpc/react.tsx`
- Base URL pointing to `http://localhost:8080/quizzlet-clone`
- Check `getBaseUrl()` function returns correct URL

### 3.2 Verify Router Setup
**File**: `packages/api/src/router/studySet.ts`
- `public` procedures (no auth required) are accessible
- Check database queries are correct (LEFT JOIN applied)

### 3.3 Environment Variables
**File**: `.env.local`
- Set correct API URL or ensure default works

---

## Bước 4: Database & Query Fixes

### 4.1 Apply LEFT JOIN fix
- **File**: `packages/db/src/queries/index.ts`
- Ensure study sets display even without flashcards
- Status: Already done ✓

### 4.2 Insert Sample Data
If DB empty:
- Create test user
- Create 3-5 test study sets with flashcards
- Run migrations/seeding

### 4.3 Test queries directly
- Use database client to verify data exists
- Run the `getLatestStudySets()` query manually

---

## Bước 5: Component Stability

### 5.1 Remove error logging issues
- Clean up try-catch blocks (Suspense handles errors)
- Let Error Boundary catch real errors

### 5.2 Add proper loading states
- Use Suspense fallback: `<StudySetSkeletonGrid />`
- Show skeleton while loading

### 5.3 Add error UI gracefully
- If query fails, show "No data" vs error
- Wrap with Error Boundary (already done)

---

## Bước 6: Testing & Validation

### 6.1 Backend Testing
- Hit `/api/studysets` manually (curl or Postman)
- Hit Swagger UI: `http://localhost:8080/quizzlet-clone/swagger-ui.html`
- Verify JSON response structure

### 6.2 Frontend Testing
- Open browser DevTools → Network tab
- Check tRPC requests going to correct URL
- Verify response data format matches TypeScript types

### 6.3 Full Flow
- Start backend: `mvn spring-boot:run`
- Start frontend: `pnpm dev`
- Load homepage
- Check console for errors
- Verify study sets display

---

## Bước 7: Troubleshooting Checklist

| Problem | Solution |
|---------|----------|
| 404 Not Found | Check base URL, context path, backend running |
| CORS Error | Verify CORS config in `application.yaml` |
| Empty data | Insert test data into DB |
| Type mismatch | Check Zod schemas match backend DTOs |
| Timeout | Check backend is responsive |
| useSuspenseQuery fails | Check LEFT JOIN fix applied, data exists |
| tRPC connection refused | Verify backend URL in `getBaseUrl()` |
| No data displayed | Check database has Study Sets with Flashcards |

---

## Kế Tiếp - Further Considerations

1. **Data Seeding Strategy** - Should we auto-seed test data on first run or require manual setup?
2. **Error Boundaries** - Should we wrap all pages with TRPCErrorBoundary or just component level?
3. **Auth Integration** - When implementing login, should we use JWT tokens or maintain separate session?

---

## Implementation Checklist

### Backend Checks
- [ ] MySQL database `quizzlet_clone` exists
- [ ] Tables created (StudySet, Flashcard, User, etc.)
- [ ] Backend runs without errors on port 8080
- [ ] Swagger UI accessible at `/quizzlet-clone/swagger-ui.html`
- [ ] CORS properly configured
- [ ] Sample data inserted into database

### Frontend Checks
- [ ] tRPC client configured with correct base URL
- [ ] `getBaseUrl()` returns `http://localhost:8080/quizzlet-clone`
- [ ] LEFT JOIN applied to queries
- [ ] Suspense components have fallback UI
- [ ] Error boundary wrapping components

### Integration Checks
- [ ] Frontend tRPC requests reach backend
- [ ] Network tab shows successful responses
- [ ] Data types match between backend DTOs and Zod schemas
- [ ] Study sets display on homepage
- [ ] No console errors related to tRPC/API

### User Experience Checks
- [ ] Loading skeletons shown while fetching
- [ ] Graceful error handling if query fails
- [ ] Data updates without full page reload
- [ ] No blank pages or layout shifts

---

## Success Criteria

✅ Homepage displays study sets from database  
✅ No errors in browser console  
✅ No CORS errors  
✅ Data loads within 2-3 seconds  
✅ Error boundary catches failures gracefully  
✅ tRPC logs show successful queries  

---

## Estimated Timeline

- **Phase 1 (Verification)**: 15 minutes
- **Phase 2 (Configuration)**: 20 minutes
- **Phase 3 (Data Seeding)**: 10 minutes
- **Phase 4 (Testing)**: 20 minutes
- **Phase 5 (Refinement)**: 15 minutes

**Total**: 1.5-2 hours

---

## Resources & References

- Backend Swagger: `http://localhost:8080/quizzlet-clone/swagger-ui.html`
- API Integration Guide: `quizlet-fe/API_INTEGRATION_GUIDE.md`
- TRPC Error Fix: `quizlet-fe/TRPC_ERROR_FIX.md`
- Database Queries: `quizlet-fe/packages/db/src/queries/index.ts`
- tRPC Setup: `quizlet-fe/apps/nextjs/src/trpc/react.tsx`

---

## Notes

- tRPC already uses suspense queries, so errors naturally bubble up
- Error Boundary component available at `trpc-error-boundary.tsx`
- Sample data seeding can be manual (SQL) or automated (backend endpoint)
- Frontend currently using Drizzle ORM for database queries
- Backend using Spring Boot REST API with JWT auth

