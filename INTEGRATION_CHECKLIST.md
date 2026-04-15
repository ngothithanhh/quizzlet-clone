# 🎯 Frontend-Backend Integration Checklist

## ✅ Phase 1: Setup (COMPLETE)

- [x] API Client Layer created
  - [x] HTTP client with JWT auth
  - [x] Token management (setTokens, getAccessToken, clearTokens)
  - [x] Auto token refresh on 401
  - [x] Error handling
  
- [x] API Schemas (Zod)
  - [x] Auth schemas
  - [x] Study Set schemas
  - [x] Flashcard schemas
  - [x] Folder schemas
  - [x] Classroom schemas
  - [x] Assignment schemas
  - [x] Notification schemas
  - [x] External API schemas

- [x] Service Functions
  - [x] authService (login, register, logout, refresh, etc)
  - [x] studySetService (CRUD, search)
  - [x] flashcardService (CRUD, import/export, clone)
  - [x] folderService (CRUD)
  - [x] favoriteService (add, remove, list)
  - [x] classroomService (CRUD, members, roles, invite codes)
  - [x] assignmentService (CRUD, submit, get results)
  - [x] notificationService (get, mark read, unread count)
  - [x] externalService (upload, TTS, translate, spellcheck, wikipedia)

- [x] React Hooks
  - [x] useApiCall (for single API calls)
  - [x] useSubmit (for form submissions)
  - [x] useFetchData (for data fetching on mount)

- [x] Documentation
  - [x] API_INTEGRATION_GUIDE.md (comprehensive guide)
  - [x] FE_BE_INTEGRATION_SUMMARY.md (overview + next steps)
  - [x] Example components (examples.tsx)

- [x] Configuration
  - [x] .env.example for NextJS
  - [x] Makefile with common commands

## 📝 Phase 2: Core Pages (TODO)

### 2.1 Authentication Pages
- [ ] Login Page
  - [ ] Email input
  - [ ] Password input
  - [ ] Error display
  - [ ] Loading state
  - [ ] "Forgot password" link
  - [ ] "Sign up" link
  - [ ] Integration: `authService.login()`

- [ ] Register Page
  - [ ] Step 1: Email input + Send OTP button
  - [ ] Step 2: OTP input
  - [ ] Step 3: Username, Password inputs
  - [ ] Error handling
  - [ ] Integration: `authService.sendRegisterOtp()` → `authService.register()`

- [ ] Forgot Password Page
  - [ ] Email input + Send OTP
  - [ ] OTP + New Password inputs
  - [ ] Integration: `authService.sendForgotPasswordOtp()` → `authService.resetPassword()`

### 2.2 Dashboard
- [ ] Navigation Bar
  - [ ] User profile dropdown
  - [ ] Notification bell with unread count
  - [ ] Search bar
  - [ ] Logout button

- [ ] Sidebar
  - [ ] My Study Sets link
  - [ ] My Folders link
  - [ ] My Favorites link
  - [ ] My Classes link
  - [ ] Create new Study Set button

### 2.3 Study Set Pages
- [ ] Study Sets List
  - [ ] Fetch with `useFetchData(studySetService.getMyStudySets)`
  - [ ] Cards showing title, description, flashcard count
  - [ ] Edit/Delete buttons
  - [ ] Create new button

- [ ] Study Set Detail
  - [ ] Title, description, visibility
  - [ ] Flashcards list
  - [ ] Add flashcard button
  - [ ] Edit/Delete study set buttons
  - [ ] Export button
  - [ ] Share/Favorite button
  - [ ] Start studying button

- [ ] Create/Edit Study Set
  - [ ] Form with title, description, visibility
  - [ ] Submit handling with `useSubmit(studySetService.create)`
  - [ ] Validation using schemas
  - [ ] Success message + redirect

### 2.4 Flashcard Pages
- [ ] Flashcard Editor
  - [ ] Term + Definition inputs
  - [ ] Image upload
  - [ ] Audio upload
  - [ ] Save button with `flashcardService.create/update`
  - [ ] Delete button

- [ ] Import Flashcards
  - [ ] Drag-drop file area
  - [ ] File preview/validation
  - [ ] Import button with `flashcardService.import()`
  - [ ] Success message

- [ ] Study Mode
  - [ ] Flashcard view (term/definition flip)
  - [ ] Navigation (prev/next)
  - [ ] Progress bar
  - [ ] Mark as known/learning
  - [ ] Audio playback button (TTS)

- [ ] Test Mode
  - [ ] Multiple choice or fill-in questions
  - [ ] Submit answers with `assignmentService.submit()`
  - [ ] Show score and results
  - [ ] Review button

## 🎓 Phase 3: Classroom Features (TODO)

### 3.1 Classroom Pages
- [ ] Create Classroom
  - [ ] Form with name, description, section
  - [ ] Create button with `classroomService.create()`
  - [ ] Show invite code
  - [ ] Copy invite code button

- [ ] Join Classroom
  - [ ] Invite code input
  - [ ] Join button with `classroomService.join()`
  - [ ] Error handling for invalid code

- [ ] Classroom Detail
  - [ ] Class info (name, section, teacher)
  - [ ] Members list with roles
  - [ ] Assignments list
  - [ ] Announcements (if available)

- [ ] Member Management (Teacher only)
  - [ ] Add member by email
  - [ ] Remove member
  - [ ] Change role (Teacher/Student)
  - [ ] Regenerate invite code

### 3.2 Assignment Pages
- [ ] Create Assignment (Teacher)
  - [ ] Form with title, description, study set, due date, points
  - [ ] Create button with `assignmentService.create()`

- [ ] Submit Assignment (Student)
  - [ ] Show assignment details
  - [ ] Answer form based on flashcards
  - [ ] Submit button with `assignmentService.submit()`

- [ ] Grade Assignment (Teacher)
  - [ ] List of submissions
  - [ ] View student answers
  - [ ] Enter grade/feedback
  - [ ] Save button

- [ ] View Results (Student)
  - [ ] Assignment score
  - [ ] Correct/incorrect answers
  - [ ] Teacher feedback
  - [ ] Due date status

## 🔔 Phase 4: Advanced Features (TODO)

### 4.1 Notifications
- [ ] Notification Center
  - [ ] List of notifications
  - [ ] Mark as read buttons
  - [ ] Delete/Archive buttons
  - [ ] Fetch with `notificationService.getMyNotifications()`

- [ ] Notification Badge
  - [ ] Show unread count
  - [ ] Update real-time (polling every 30s)
  - [ ] Fetch with `notificationService.getUnreadCount()`

### 4.2 External Services
- [ ] Text-to-Speech
  - [ ] Speaker icon on flashcards
  - [ ] Play audio with `externalService.getTts()`
  - [ ] Loading state while generating

- [ ] Translation Widget
  - [ ] Translation button on flashcards
  - [ ] Show translation result
  - [ ] Multiple language options
  - [ ] Use `externalService.translate()`

- [ ] Spell Check
  - [ ] Inline spell check in flashcard editor
  - [ ] Highlight errors
  - [ ] Show suggestions
  - [ ] Use `externalService.spellCheck()`

- [ ] Wikipedia Lookup
  - [ ] Info button on flashcards
  - [ ] Show summary in modal
  - [ ] Use `externalService.getWikipediaSummary()`

### 4.3 File Upload
- [ ] Image Upload
  - [ ] Drag-drop area
  - [ ] Preview
  - [ ] Upload with `externalService.uploadImage()`
  - [ ] Store URL in flashcard

- [ ] Audio Upload
  - [ ] Upload with `externalService.uploadAudio()`
  - [ ] Preview player
  - [ ] Store URL in flashcard

## 🎨 Phase 5: UI/UX Polish (TODO)

- [ ] Responsive Design
  - [ ] Mobile layout (<640px)
  - [ ] Tablet layout (640px-1024px)
  - [ ] Desktop layout (>1024px)

- [ ] Loading States
  - [ ] Skeleton loaders
  - [ ] Spinners
  - [ ] Progress bars

- [ ] Error Handling
  - [ ] Error modals
  - [ ] Toast notifications
  - [ ] Retry buttons

- [ ] Accessibility
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Color contrast
  - [ ] Focus indicators

- [ ] Performance
  - [ ] React Query caching
  - [ ] Code splitting
  - [ ] Image optimization
  - [ ] Bundle size analysis

## 🚀 Phase 6: Deployment (TODO)

- [ ] Production Build
  - [ ] Frontend: `pnpm build && pnpm start`
  - [ ] Backend: `mvn clean package -DskipTests`

- [ ] Environment Setup
  - [ ] Production API URL
  - [ ] SSL/HTTPS configuration
  - [ ] Database backups
  - [ ] Error logging/monitoring

- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests (Cypress/Playwright)
  - [ ] Load testing

- [ ] Deployment
  - [ ] Backend deployment (AWS/Heroku/VPS)
  - [ ] Frontend deployment (Vercel/Netlify)
  - [ ] Database migration
  - [ ] Domain & DNS setup

## 📊 Progress Tracking

| Phase | Status | Progress | Due Date |
|-------|--------|----------|----------|
| Phase 1: Setup | ✅ DONE | 100% | ✓ |
| Phase 2: Core Pages | ⏳ TODO | 0% | TBD |
| Phase 3: Classrooms | ⏳ TODO | 0% | TBD |
| Phase 4: Advanced | ⏳ TODO | 0% | TBD |
| Phase 5: Polish | ⏳ TODO | 0% | TBD |
| Phase 6: Deploy | ⏳ TODO | 0% | TBD |

## 🔗 Important Links

- **API Docs**: [Swagger](http://localhost:8080/quizzlet-clone/swagger-ui/index.html)
- **Integration Guide**: [API_INTEGRATION_GUIDE.md](./quizlet-fe/API_INTEGRATION_GUIDE.md)
- **Backend README**: [README.md](./README.md)
- **Frontend API**: [packages/api/src/client/](./quizlet-fe/packages/api/src/client/)

## 📞 Quick Commands

```bash
# Backend
cd quizzz-be && mvn spring-boot:run

# Frontend
cd quizlet-fe && pnpm dev

# Install all dependencies
cd quizzz-be && mvn clean install
cd quizlet-fe && pnpm install

# Run tests
cd quizlet-fe && pnpm test

# Format code
cd quizlet-fe && pnpm format

# Or use Makefile
make help
make run-all
make stop
```

---

**Last Updated**: April 15, 2026
**Status**: Phase 1 Complete ✅

