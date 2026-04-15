# 🚀 FE-BE Integration Summary

## ✅ Đã Hoàn Thành

### 1. **API Client Layer** (`packages/api/src/client/`)
- ✅ **config.ts** - Cấu hình endpoints, base URL, constants
- ✅ **http.ts** - HTTP client với JWT auth, token refresh, error handling
- ✅ **schemas.ts** - Zod schemas for type-safe validation (40+ schemas)
- ✅ **services.ts** - Service functions cho tất cả features (auth, study sets, flashcards, classrooms, assignments, notifications, external APIs)
- ✅ **hooks.ts** - React hooks (useApiCall, useSubmit, useFetchData)
- ✅ **examples.tsx** - Example components showing usage patterns

### 2. **Configuration**
- ✅ `.env.example` - Environment variables template
- ✅ API_INTEGRATION_GUIDE.md - Comprehensive usage guide

## 📋 API Services Available

### Authentication
```typescript
authService.sendRegisterOtp(email)
authService.register({username, email, password, otpCode})
authService.login({email, password})
authService.refreshToken(refreshToken)
authService.changePassword(oldPassword, newPassword)
authService.logout()
```

### Study Sets
```typescript
studySetService.create(data)
studySetService.getMyStudySets()
studySetService.getAll(keyword?)
studySetService.getById(id)
studySetService.update(id, data)
studySetService.delete(id)
```

### Flashcards
```typescript
flashcardService.create(data)
flashcardService.update(id, data)
flashcardService.delete(id)
flashcardService.getByStudySet(studySetId)
flashcardService.import(studySetId, file)
flashcardService.export(studySetId)
flashcardService.clone(fromSetId, toSetId)
flashcardService.downloadTemplate()
```

### Folders
```typescript
folderService.create(data)
folderService.getMyFolders()
folderService.update(id, data)
folderService.delete(id)
folderService.getStudySets(folderId)
```

### Favorites
```typescript
favoriteService.getMyFavorites()
favoriteService.add(studySetId)
favoriteService.remove(favoriteId)
```

### Classrooms
```typescript
classroomService.create(data)
classroomService.getById(id)
classroomService.getMyClasses()
classroomService.update(id, data)
classroomService.delete(id)
classroomService.join(inviteCode)
classroomService.leave(classId)
classroomService.getMembers(classId)
classroomService.addMember(classId, email)
classroomService.removeMember(classId, userId)
classroomService.updateMemberRole(classId, userId, role)
classroomService.regenerateInviteCode(classId)
```

### Assignments
```typescript
assignmentService.create(classId, data)
assignmentService.getByClass(classId)
assignmentService.submit(assignmentId, answers)
assignmentService.getMyResult(assignmentId)
assignmentService.getSubmissions(assignmentId)
```

### Notifications
```typescript
notificationService.getMyNotifications()
notificationService.markAsRead(id)
notificationService.markAllAsRead()
notificationService.getUnreadCount()
```

### External APIs
```typescript
externalService.uploadImage(file)
externalService.uploadAudio(file)
externalService.getTts(text, lang)
externalService.translate(text, source, target)
externalService.spellCheck(text, language)
externalService.getWikipediaSummary(keyword, lang)
```

## 🔄 Next Steps

### Phase 1: Setup & Testing (Ngay)
1. **Setup Environment**
   ```bash
   cd quizlet-fe
   cp apps/nextjs/.env.example apps/nextjs/.env.local
   # Edit .env.local with correct API URL
   ```

2. **Install Dependencies** (nếu chưa có)
   ```bash
   pnpm install
   ```

3. **Test API Connection**
   - Đảm bảo backend chạy ở `http://localhost:8080/quizzlet-clone`
   - Xem swagger: `http://localhost:8080/quizzlet-clone/swagger-ui/index.html`

4. **Run Frontend**
   ```bash
   pnpm dev
   ```

### Phase 2: Core Components (1-2 tuần)
1. **Auth Pages**
   - Login page (sử dụng `authService.login`)
   - Register page (sử dụng `authService.register`, OTP flow)
   - Forgot password page

2. **Study Set Management**
   - Study set list page (sử dụng `useFetchData(studySetService.getMyStudySets)`)
   - Create/edit study set form
   - Study set details with flashcards

3. **Flashcard Management**
   - Flashcard editor
   - Import/export Excel UI
   - Study/test modes

### Phase 3: Advanced Features (2-3 tuần)
1. **Virtual Classrooms**
   - Join class with invite code
   - Class member management
   - Assignment creation & submission

2. **Real-time Features**
   - Notification polling
   - Notification center UI

3. **External Services**
   - Text-to-speech player
   - Translation widget
   - Spell-check inline editor
   - Wikipedia lookup modal

### Phase 4: Polish & Deploy (1 tuần)
1. **UI/UX**
   - Responsive design
   - Loading states
   - Error handling
   - Toast notifications

2. **Performance**
   - React Query/SWR caching
   - Code splitting
   - Image optimization

3. **Security**
   - HTTPS
   - CORS configuration
   - Rate limiting

## 📝 Usage Example

### Simple Login Component
```typescript
import { useSubmit, authService } from "@acme/api";

export function LoginPage() {
  const { isSubmitting, submitError, submit } = useSubmit(authService.login);

  const handleLogin = async (email: string, password: string) => {
    try {
      await submit({ email, password });
      // Redirect to dashboard
    } catch (err) {
      // submitError has error message
    }
  };

  return (
    // ... form JSX
  );
}
```

### Study Set List
```typescript
import { useFetchData, studySetService } from "@acme/api";

export function StudySetList() {
  const { data: sets, isLoading, error } = useFetchData(
    studySetService.getMyStudySets
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {sets?.map(set => (
        <div key={set.id}>{set.title}</div>
      ))}
    </div>
  );
}
```

## 🐛 Troubleshooting

### CORS Error
**Nguyên nhân**: Backend không cho phép request từ FE domain
**Giải pháp**: Thêm CORS config vào backend `application.yaml`:
```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000"
      allowed-methods: "GET,POST,PUT,DELETE,PATCH"
      allow-credentials: true
```

### Token Expired
**Nguyên nhân**: Access token hết hạn
**Giải pháp**: API client tự động refresh bằng refresh token. Nếu vẫn fail, user redirect tới login.

### Network Error
**Nguyên nhân**: Backend không chạy hoặc API URL sai
**Giải pháp**: 
- Kiểm tra backend chạy: `http://localhost:8080/quizzlet-clone/swagger-ui`
- Kiểm tra `NEXT_PUBLIC_API_URL` ở `.env.local`

### Type Errors
**Nguyên nhân**: Type không match
**Giải pháp**: Kiểm tra schemas.ts và response format từ backend

## 📚 Documentation

- **API Integration Guide**: `API_INTEGRATION_GUIDE.md`
- **Backend Swagger**: `http://localhost:8080/quizzlet-clone/swagger-ui/`
- **Backend README**: `quizzz-be/README.md`
- **Frontend Code**: `quizlet-fe/packages/api/src/client/`

## 🎯 Key Points

1. **Automatic Token Management**: Login/logout tự động handle tokens
2. **Type Safety**: Zod schemas validate tất cả API responses
3. **Error Handling**: Unified error format với retry logic
4. **React Hooks**: useApiCall, useSubmit, useFetchData cho dễ sử dụng
5. **Token Refresh**: Tự động refresh expired tokens (không cần FE handler)

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra API_INTEGRATION_GUIDE.md
2. Xem example components tại `packages/api/src/client/examples.tsx`
3. Kiểm tra browser console và network tab
4. Xem backend logs: `mvn spring-boot:run` output

---

**Hệ thống ready để phát triển components! Hãy bắt đầu với Login page. 🚀**

