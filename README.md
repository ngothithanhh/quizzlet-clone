# Quizzz (Quizlet Clone) - Backend System 🚀

Quizzz là một dự án Backend mô phỏng hệ thống giáo dục qua thẻ bài (Flashcard) học tập vô cùng phổ biến - Quizlet. Cung cấp nền tảng REST API chịu tải trọng trung bình-cao với kiến trúc hiện đại, tích hợp chặt chẽ AI/NLP phục vụ cho việc học tập qua ngữ âm, dịch thuật tự động.

## 🌟 Chức năng nổi bật (Features)

**📚 1. Quản trị Học thuật (Core Learning)**
- **Study Sets & Flashcards**: Khởi tạo và quản lý bộ bài từ vựng, hình ảnh, âm thanh. Cho phép gán quyền công khai `Public` hoặc `Private`.
- **Folders (Thư mục)**: Gom nhóm, phân loại các khối lượng bài học (Study Sets) để cá nhân hoá việc lưu trữ.
- **Clone Tính Năng**: Cơ chế "sao chép" tự động toàn bộ Study Set từ những kho bài tập công khai của người khác về bản thân.
- **Trình nạp file**: Hỗ trợ bóc tách, Import Flashcards hàng loạt thông qua tệp Excel `.xlsx`.
- **Yêu Thích (Favorites)**: Lưu trữ và ghim lại các bộ Flashcard hay.
- **Tracking & History**: Lưu giữ dấu chân học tập (`StudySession`), theo dõi tiến độ chính xác của từng cá nhân đối với từng thẻ.

**👩‍🏫 2. Lớp Học Ảo & Chấm Điểm (Virtual Classroom)**
- Tính năng tham gia Lớp Học bằng mã mời (Invite Code).
- Phân tách quyền Giảng Viên / Học Viên rạch ròi.
- Giáo Viên giao bài tập (`Assignment`) với mốc Deadline rõ ràng. Học sinh nộp bài và thu thập điểm quá trình (`AssignmentSubmission`).

**🔔 3. Hệ sinh thái Real-time & Bot (Notifications)**
- Hệ thống đẩy thông báo tại chỗ khi có Assignments mới hoặc gia nhập lớp học.
- **Automatic CronJob (`@EnableScheduling`)**: Bot quét chu kỳ 5 phút/lần đánh hơi các Assignment trễ hạn của các con lười chưa nộp bài, và tự thảy một cảnh báo `OVERDUE_ASSIGNMENT`.

**🤖 4. External AI & Cloud Services (Vệ tinh Cloud)**
Đóng vai trò Proxy giao tiếp mượt mà với những gã khổng lồ Công nghệ nhằm mở rộng tối đa tiện ích:
- **Ngữ Âm Văn Bản (Text-to-Speech)**: Đọc từ vựng tự động thông qua Google Voice (Audio bytes output).
- **Translator API**: Tự động dịch các thuật ngữ thẻ bài đa ngôn ngữ sử dụng sức mạnh dồi dào từ MyMemory Translation.
- **Check Lỗi Chính Tả**: Rà soát, bắt lỗi nhầm lẫn cấu trúc từ LanguageTool.
- **Trích Xuất Wikipedia**: Định nghĩa cụm từ chớp nhoáng (3 câu đầu) trực tiếp từ bộ bách khoa toàn thư thế giới (Wikipedia API).
- **Mây Hoá Dữ Liệu**: Nhấn đẩy toàn bộ file hình ảnh, file ghi âm mỏi nặng nề lên **CLOUDINARY** để Server trơn tru.

---

## 🛠️ Công Nghệ Áp Dụng (Tech Stack)

- **Ngôn ngữ**: Java 17+
- **Framework Đầu Tàu**: Spring Boot 3.2.x 
- **Bảo mật (Security)**: Spring Security (Resource Server) + **JWT (JSON Web Token)** để cấp phát phiên làm việc (Session). Xác thực 2 bước (OTP qua luồng Email).
- **Cơ sở dữ liệu (Database)**: MySQL (Mapping với Spring Data JPA & Hibernate). Khắc phục triệt để bài toán **N+1 Query** bằng `JOIN FETCH`.
- **Tối ưu Source (Clean Code)**: Lombok (Loại bỏ Boilerplate Code), MapStruct (Auto-mapping Entity to DTO).
- **Tích Hợp API Ngoài**: `RestTemplate` mạnh mẽ. Spring-boot-starter-mail để spam OTP.
- **Tài Liệu API**: Swagger (Springdoc OpenAPI) - truy cập API docs qua link UI động.

## 📂 Cấu Trúc Dự Án (Project Structure)

Dự án tuân thủ nghiêm ngặt mô hình MVC và các Best Practice của Spring Boot:
```text
quizzz-be
├── src/main/java/org/api/quizzz
│   ├── config       # Cấu hình Sercurity, Swagger, JWT Filter, CORS
│   ├── controller   # Các Endpoint RESTful API đón Request từ Frontend
│   ├── dto          # Data Transfer Object (Request & Response models)
│   ├── entity       # Mapping cấu trúc bảng thật dưới Database (JPA)
│   ├── enums        # Các hằng số (Role, NotificationType,...)
│   ├── mapper       # Class Static biến đổi dữ liệu giữa Entity <-> DTO
│   ├── repository   # Giao tiếp với Database, tối ưu câu lệnh Query
│   ├── service      # Thể hiện Logic nghiệp vụ, ném Exception, Validate
│   │   └── impl     # Tách Implementation rời khỏi Interface
│   └── utils        # Chứa SecurityUtils móc nối Token User ngầm
└── src/main/resources
    └── application.yaml  # Config kết nối DB, Server Port, API Keys
```

---

## 🚀 Hướng Rõ Cài Đặt (Installation)

### 1. Chuẩn bị (Prerequisites)
- [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) hoặc cao hơn.
- Cài đặt MySQL Sever và thiết lập database rỗng tên `quizzlet_clone`.
- Maven Package Manager.

### 2. Cấu hình Biến Số (Configuration)
Tìm và mở tệp `quizzz-be/src/main/resources/application.yaml`. 
Bạn cần ghi đè vào các thông số đặc vụ sau:

* Thông số MySQL:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quizzlet_clone?useSSL=false
    username: root
    password: Mật_Khẩu_Của_Bạn
```

* API Key Cloudinary (Bắt buộc để chạy Upload Image/Audio):
```yaml
cloudinary:
  cloud-name: của-bạn
  api-key: của-bạn
  api-secret: của-bạn
```

### 3. Build & Run
Ở thư mục gốc dự án (`quizzz-be`), mở Terminal / Cmd lên xài lệnh:
```bash
# Tải cấu trúc Dependencies
mvn clean install

# Chạy máy chủ
mvn spring-boot:run
```
Máy chủ sẽ mọc lên tại `http://localhost:8080/quizzlet-clone`. 
Hãy truy cập trực tiếp `http://localhost:8080/quizzlet-clone/swagger-ui/index.html` (Nếu có cấu hình Swagger) để xem Menu Món Ăn API!