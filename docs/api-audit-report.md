# Báo cáo Audit: BE API ↔ FE Integration

> Cập nhật lần cuối: 2026-04-16

## Kết quả: Tổng quan nhanh

| Controller BE | FE tRPC Router | Trạng thái |
|---|---|---|
| AuthController | `/api/auth/*` Next.js routes | ✅ Đủ |
| StudySetController | `studySetRouter` | ✅ Đủ |
| FlashcardController | `flashcardRouter` | ✅ Đủ (CRUD cơ bản) |
| FolderController | `folderRouter` | ✅ Đủ |
| FavoriteController | `favoriteRouter` | ✅ Đủ |
| ClassroomController | ❌ Không có router | ❌ **Chưa nối** |
| NotificationController | ❌ Không có router | ❌ **Chưa nối** |
| StudySessionController | ❌ Không có router | ❌ **Chưa nối** |
| ExternalApiController | ❌ Không có router | ❌ **Chưa nối** |
| UserController | `userRouter` | ✅ Đủ |

---

## Chi tiết từng nhóm

---

### ✅ Auth — Đủ
| BE Endpoint | FE | Trạng thái |
|---|---|---|
| `POST /api/auth/register/otp` | `signup-form.tsx` gọi trực tiếp BE | ✅ |
| `POST /api/auth/register` | `signup-form.tsx` gọi trực tiếp BE | ✅ |
| `POST /api/auth/login/profile` | `/api/auth/login` route handler | ✅ |
| `POST /api/auth/logout` | `/api/auth/logout` route handler | ✅ |
| `POST /api/auth/refresh` | `/api/auth/refresh-token` route + auto-refresh trong `auth-context.tsx` | ✅ **Đã thêm** |
| `POST /api/auth/forgot-password/otp` | ❌ Không có trang | → Chưa có UI |
| `POST /api/auth/forgot-password/reset` | ❌ Không có trang | → Chưa có UI |
| `POST /api/auth/change-password` | `/api/auth/change-password` + `ChangePassword` component trong `/settings` | ✅ **Đã thêm** |
| `GET /oauth2/authorization/google` | `login-with-oauth.tsx` | ✅ |

---

### ✅ StudySet — Đủ
| BE Endpoint | FE tRPC | Trạng thái |
|---|---|---|
| `GET /api/studysets` | `studySet.popular`, `studySet.latest` | ✅ |
| `GET /api/studysets/me` | `studySet.allByUser` | ✅ |
| `GET /api/studysets/{id}` | `studySet.byId` | ✅ |
| `POST /api/studysets` | `studySet.create` | ✅ |
| `PUT /api/studysets/{id}` | `studySet.update` | ✅ **Đã thêm** |
| `DELETE /api/studysets/{id}` | `studySet.delete` | ✅ |
| `GET /api/studysets/{id}/match` | `studySet.matchCards` | ✅ |
| `GET /api/studysets/{id}/learn` | `studySet.learnCards` | ✅ |
| `GET /api/studysets/{id}/test` | `studySet.testCards` | ✅ |
| *(FE extra)* | `studySet.combine` — merge nhiều sets thành 1 | ✅ **Đã thêm** |

> `study-set-form.tsx` giờ tự động dùng `update` khi có `id` (edit mode) và `create` khi tạo mới.

---

### ✅ Flashcard — Đủ (CRUD cơ bản)
| BE Endpoint | FE tRPC | Trạng thái |
|---|---|---|
| `PUT /api/flashcards/{id}` | `flashcard.edit` | ✅ |
| `POST /api/flashcards` | `flashcard.create` | ✅ **Đã thêm** |
| `DELETE /api/flashcards/{id}` | `flashcard.delete` | ✅ **Đã thêm** |
| `GET /api/studysets/{id}/flashcards` | Bao gồm trong `studySet.byId` | ✅ |
| `POST /api/studysets/{id}/flashcards/import` | ❌ Chưa có UI | → Tính năng nâng cao |
| `GET /api/studysets/{id}/flashcards/export` | ❌ Chưa có UI | → Tính năng nâng cao |
| `POST /api/flashcards/clone` | ❌ Chưa có UI | → Tính năng nâng cao |
| `GET /api/flashcards/import/template` | ❌ Chưa có UI | → Tính năng nâng cao |

---

### ✅ Folder — Đủ
| BE Endpoint | FE tRPC | Trạng thái |
|---|---|---|
| `GET /api/folders` | `folder.allByUser` | ✅ |
| `POST /api/folders` | `folder.create` | ✅ |
| `GET /api/folders/{id}` | `folder.bySlug` | ✅ |
| `PUT /api/folders/{id}` | `folder.edit` | ✅ |
| `DELETE /api/folders/{id}` | `folder.delete` | ✅ |
| `POST /api/folders/{id}/studysets/{id}` | `folder.addSet` | ✅ |
| `DELETE /api/folders/{id}/studysets/{id}` | `folder.removeSet` | ✅ |

---

### ✅ Favorite — Đủ
| BE Endpoint | FE tRPC | Trạng thái |
|---|---|---|
| `POST /api/favorites/{studySetId}` | `favorite.add` | ✅ **Đã thêm** |
| `DELETE /api/favorites/{studySetId}` | `favorite.remove` | ✅ **Đã thêm** |
| `GET /api/favorites` | `favorite.getAll` | ✅ **Đã thêm** |

> Component `FavoriteStudySets` hiển thị danh sách trong trang profile của user.

---

### ✅ User — Đủ
| BE Endpoint | FE tRPC | Trạng thái |
|---|---|---|
| `GET /api/users/me` | `user.byId` | ✅ |
| `PUT /api/users/me` | `user.update` | ✅ |
| `GET /api/users/me/sessions` | `activity.allByUser` (lấy date cho calendar) | ✅ |
| `DELETE /api/users/{id}` | `user.delete` | ✅ |

---

### ❌ Classroom — CHƯA NỐI VÀO FE
| BE Endpoint | FE | Ghi chú |
|---|---|---|
| `POST /api/classes` | ❌ | Tạo lớp |
| `GET /api/classes/{id}` | ❌ | Xem lớp |
| `GET /api/classes/my` | ❌ | Lớp của tôi |
| `PUT /api/classes/{id}` | ❌ | Sửa lớp |
| `DELETE /api/classes/{id}` | ❌ | Xóa lớp |
| `POST /api/classes/join` | ❌ | Tham gia lớp |
| `POST /api/classes/{id}/invite-code` | ❌ | Tạo lại mã mời |
| `POST /api/classes/{id}/members` | ❌ | Thêm thành viên |
| `DELETE /api/classes/{id}/members/{uid}` | ❌ | Xóa thành viên |
| `POST /api/classes/{id}/leave` | ❌ | Rời lớp |
| `PUT /api/classes/{id}/members/{uid}/role` | ❌ | Đổi role |
| `POST /api/classes/{id}/assignments` | ❌ | Tạo bài kiểm tra |
| `GET /api/classes/{id}/assignments` | ❌ | Xem bài kiểm tra |
| `POST /api/classes/assignments/{id}/submit` | ❌ | Nộp bài |
| `GET /api/classes/assignments/{id}/my-result` | ❌ | Xem kết quả |
| `GET /api/classes/assignments/{id}/submissions` | ❌ | Xem tất cả bài nộp |

> **FE không có trang/chức năng Classroom nào cả.** Cần làm từ đầu.

---

### ❌ Notification — CHƯA NỐI VÀO FE
| BE Endpoint | FE | Ghi chú |
|---|---|---|
| `GET /api/notifications` | ❌ | Lấy thông báo |
| `PUT /api/notifications/{id}/read` | ❌ | Đánh dấu đọc |
| `PUT /api/notifications/read-all` | ❌ | Đọc tất cả |
| `GET /api/notifications/unread-count` | ❌ | Số thông báo chưa đọc |

> **FE không có UI Notifications.**

---

### ❌ StudySession — CHƯA NỐI VÀO FE
| BE Endpoint | FE | Ghi chú |
|---|---|---|
| `POST /api/study/start` | ❌ | Bắt đầu phiên học |
| `POST /api/study/answer` | ❌ | Ghi nhận câu trả lời |
| `POST /api/study/end` | ❌ | Kết thúc phiên (lấy thống kê) |

> FE các trang `/flashcards`, `/match`, `/learn`, `/test` hoạt động độc lập trên FE, chưa track kết quả qua BE.

---

### ❌ External API — CHƯA NỐI VÀO FE
| BE Endpoint | FE | Ghi chú |
|---|---|---|
| `POST /api/external/upload/image` | ❌ | Upload ảnh flashcard |
| `POST /api/external/upload/audio` | ❌ | Upload audio flashcard |
| `GET /api/external/tts` | ❌ | Text-to-speech |
| `GET /api/external/translate` | ❌ | Dịch thuật |
| `POST /api/external/spellcheck` | ❌ | Kiểm tra chính tả |
| `GET /api/external/wikipedia` | ❌ | Tóm tắt Wikipedia |

---

## Kết luận: Việc còn lại

### 🔴 Chưa có UI — cần làm từ đầu
1. **Classroom** — toàn bộ chức năng lớp học (16 endpoints)
2. **Notifications** — thông báo, badge đếm chưa đọc (4 endpoints)
3. **StudySession tracking** — log kết quả học tập (3 endpoints)
4. **Forgot password / Reset password** — trang quên mật khẩu (2 endpoints)
5. **External APIs** — TTS, translate, spell check, upload ảnh/audio, Excel import/export

### 🟢 Đã hoàn thiện
- Auth (login/register/logout/Google OAuth/change-password/token-refresh)
- StudySet (full CRUD + update + combine + game modes)
- Folder (full CRUD)
- Flashcard (create/edit/delete)
- Favorite (add/remove/list)
- User profile (get/update)
- Activity calendar
