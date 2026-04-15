# Frontend - Backend Integration Guide

## 📋 Tổng Quan

Dự án đã tạo API client layer để kết nối NextJS/Expo frontend với Spring Boot backend. Phần này hướng dẫn cách sử dụng.

## 🚀 Bắt Đầu

### 1. Cấu Hình Environment

Tạo file `.env.local` ở thư mục `apps/nextjs/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/quizzlet-clone
```

Hoặc nếu backend chạy ở domain khác:
```env
NEXT_PUBLIC_API_URL=https://api.quizzlet-clone.com
```

### 2. Chạy Backend

```bash
cd quizzz-be
mvn spring-boot:run
```

Backend sẽ chạy ở `http://localhost:8080/quizzlet-clone`

### 3. Chạy Frontend

```bash
cd quizlet-fe
pnpm install  # Nếu chưa cài
pnpm dev
```

## 📚 Cách Sử Dụng API

### Import Services

```typescript
import { authService, studySetService, flashcardService } from "@acme/api";
```

### Authentication

#### Đăng Ký (OTP)
```typescript
// Bước 1: Gửi OTP
await authService.sendRegisterOtp("user@example.com");

// Bước 2: Xác thực OTP + Đăng ký
const result = await authService.register({
  username: "john_doe",
  email: "user@example.com",
  password: "secure123",
  otpCode: "123456"
});
```

#### Đăng Nhập
```typescript
const result = await authService.login({
  email: "user@example.com",
  password: "secure123"
});

if (result.success) {
  // Token tự động lưu vào localStorage
  console.log("Đăng nhập thành công");
}
```

#### Đổi Mật Khẩu
```typescript
const result = await authService.changePassword(
  "old_password",
  "new_password"
);
```

#### Đăng Xuất
```typescript
authService.logout();
```

### Study Sets

#### Tạo Study Set
```typescript
const result = await studySetService.create({
  title: "English Vocabulary",
  description: "Common English words",
  visibility: "PUBLIC"
});

if (result.success) {
  const studySet = result.data;
  console.log("Created:", studySet.id);
}
```

#### Lấy Study Sets của Tôi
```typescript
const result = await studySetService.getMyStudySets();
if (result.success) {
  const mySets = result.data;
}
```

#### Tìm Kiếm Study Sets
```typescript
// Toàn bộ public study sets
const all = await studySetService.getAll();

// Tìm kiếm
const search = await studySetService.getAll("English");
```

#### Lấy Chi Tiết
```typescript
const result = await studySetService.getById(123);
if (result.success) {
  const studySet = result.data;
}
```

#### Cập Nhật
```typescript
await studySetService.update(123, {
  title: "Updated Title",
  visibility: "PRIVATE"
});
```

#### Xóa
```typescript
await studySetService.delete(123);
```

### Flashcards

#### Tạo Flashcard
```typescript
const result = await flashcardService.create({
  studySetId: 123,
  term: "Hello",
  definition: "A greeting word",
  imageUrl: null,
  audioUrl: null
});
```

#### Lấy Flashcards theo Study Set
```typescript
const result = await flashcardService.getByStudySet(123);
if (result.success) {
  const cards = result.data;
}
```

#### Import từ Excel
```typescript
const file = new File([buffer], "flashcards.xlsx");
const result = await flashcardService.import(123, file);
```

#### Export ra Excel
```typescript
const result = await flashcardService.export(123);
if (result.success) {
  const blob = result.data;
  // Tạo download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.xlsx";
  a.click();
}
```

#### Clone Flashcards
```typescript
await flashcardService.clone(fromSetId, toSetId);
```

### Classrooms

#### Tạo Lớp Học
```typescript
const result = await classroomService.create({
  name: "English 101",
  description: "Beginner English",
  section: "A"
});
```

#### Tham Gia Lớp (bằng Invite Code)
```typescript
const result = await classroomService.join("INVITE_CODE_123");
```

#### Lấy Lớp Của Tôi
```typescript
const result = await classroomService.getMyClasses();
```

#### Quản Lý Thành Viên
```typescript
// Thêm thành viên
await classroomService.addMember(classId, "student@example.com");

// Xóa thành viên
await classroomService.removeMember(classId, userId);

// Cập nhật role
await classroomService.updateMemberRole(classId, userId, "TEACHER");
```

### Assignments

#### Tạo Assignment (Giáo viên)
```typescript
const result = await assignmentService.create(classId, {
  classId,
  title: "Quiz 1",
  description: "First quiz",
  studySetId: 123,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  pointsPossible: 100
});
```

#### Nộp Assignment (Học sinh)
```typescript
const result = await assignmentService.submit(assignmentId, {
  "flashcard_1": "answer1",
  "flashcard_2": "answer2"
});
```

#### Xem Kết Quả
```typescript
const result = await assignmentService.getMyResult(assignmentId);
```

### External Services

#### Text-to-Speech
```typescript
const result = await externalService.getTts("Hello world", "en-US");
if (result.success) {
  const audioBlob = result.data;
  // Phát âm thanh
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
}
```

#### Dịch Thuật
```typescript
const result = await externalService.translate(
  "Hello",
  "en",
  "vi"
);
```

#### Kiểm Tra Chính Tả
```typescript
const result = await externalService.spellCheck(
  "Helo world",
  "en-US"
);
if (result.success) {
  const errors = result.data?.errors;
}
```

#### Wikipedia Lookup
```typescript
const result = await externalService.getWikipediaSummary(
  "Python programming",
  "en"
);
```

### Upload Files

#### Upload Hình Ảnh
```typescript
const file = imageInputRef.current?.files?.[0];
if (file) {
  const result = await externalService.uploadImage(file);
  if (result.success) {
    const imageUrl = result.data?.url;
  }
}
```

#### Upload Audio
```typescript
const file = audioInputRef.current?.files?.[0];
if (file) {
  const result = await externalService.uploadAudio(file);
  if (result.success) {
    const audioUrl = result.data?.url;
  }
}
```

## 🪝 React Hooks

### useApiCall

Sử dụng cho một lần gọi API:

```typescript
import { useApiCall, authService } from "@acme/api";

export function LoginForm() {
  const { data, error, loading, execute } = useApiCall(authService.login);

  const handleLogin = async (email: string, password: string) => {
    try {
      await execute({ email, password });
    } catch (err) {
      console.error("Login failed");
    }
  };

  return (
    <>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleLogin("a@b.com", "pass")} disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </>
  );
}
```

### useSubmit

Sử dụng cho form submission:

```typescript
import { useSubmit, studySetService } from "@acme/api";

export function CreateStudySetForm() {
  const { isSubmitting, submitError, submit, clearError } = useSubmit(
    studySetService.create
  );

  const handleSubmit = async (formData: any) => {
    try {
      const result = await submit(formData);
      console.log("Tạo thành công:", result.id);
    } catch (err) {
      console.error("Create failed");
    }
  };

  return (
    <>
      {submitError && <div className="error">{submitError}</div>}
      <button onClick={() => handleSubmit({...})} disabled={isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo"}
      </button>
    </>
  );
}
```

### useFetchData

Sử dụng để fetch data khi component mount:

```typescript
import { useFetchData, studySetService } from "@acme/api";

export function StudySetList() {
  const { data: studySets, isLoading, error, refetch } = useFetchData(
    studySetService.getMyStudySets
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {studySets?.map(set => (
        <div key={set.id}>{set.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## 🔐 Token Management

Tokens được tự động lưu/xóa bởi API client:

```typescript
import { getAccessToken, clearTokens, setTokens } from "@acme/api";

// Lấy token hiện tại
const token = getAccessToken();

// Lưu tokens (thường không cần - login sẽ tự lưu)
setTokens(accessToken, refreshToken);

// Xóa tokens (đăng xuất)
clearTokens();
```

## 🛡️ Error Handling

Tất cả responses trả về format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
  status: number;
}
```

Ví dụ:

```typescript
const result = await studySetService.create({...});

if (result.success) {
  console.log("Thành công:", result.data);
} else {
  console.error(`Lỗi ${result.error?.code}: ${result.error?.message}`);
}
```

## 🔄 Token Refresh

Token refresh tự động xảy ra khi:
1. API trả về 401 Unauthorized
2. Nếu refresh token vẫn valid, access token được làm mới
3. Request tự động retry với token mới
4. Nếu refresh token expired, user được redirect tới /login

## ⚙️ CORS Configuration

Nếu gặp CORS error, hãy kiểm tra backend có CORS configuration:

```yaml
# application.yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000,http://localhost:19006"
      allowed-methods: GET,POST,PUT,DELETE,PATCH
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

## 📱 Mobile (Expo)

Đối với Expo app, sử dụng `expo-secure-store` để lưu tokens:

```typescript
import * as SecureStore from "expo-secure-store";

// Thay đổi setTokens trong src/client/http.ts:
export function setTokens(accessToken: string, refreshToken?: string): void {
  SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  if (refreshToken) {
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAccessToken(): string | null {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
```

## 🚀 Production Deployment

Trước khi deploy, cấu hình:

1. **API URL**: 
   ```env
   NEXT_PUBLIC_API_URL=https://api.quizzlet-clone.com
   ```

2. **CORS**: Ensure backend cho phép FE domain

3. **SSL**: Sử dụng HTTPS cho tất cả requests

4. **Rate Limiting**: Backend nên có rate limiting

5. **Security**: 
   - HTTPS chắc chắn
   - Secure cookies (if applicable)
   - CSRF protection

## 🐛 Debugging

Để debug API calls, thêm log:

```typescript
// Trong http.ts
const response = await fetch(fullUrl, {...});
console.log(`[API] ${method} ${fullUrl}`, {
  status: response.status,
  data: await response.clone().json(),
});
```

Hoặc dùng browser DevTools Network tab.

## 📞 Liên Hệ Backend

- **Base URL**: `http://localhost:8080/quizzlet-clone`
- **Swagger UI**: `http://localhost:8080/quizzlet-clone/swagger-ui/index.html`
- **Health Check**: `http://localhost:8080/quizzlet-clone/actuator/health` (nếu có)

---

**Chúc mừng! Bây giờ frontend đã có thể gọi backend API. 🎉**

