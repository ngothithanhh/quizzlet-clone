/**
 * Example Components - Cách sử dụng API Client
 * Đặt ở: apps/nextjs/src/components/examples/
 */

"use client";

import { useSubmit, authService, studySetService } from "@acme/api";
import { useState } from "react";

// ===== Login Component Example =====
export function LoginExample() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isSubmitting, submitError, submit, clearError } = useSubmit(
    authService.login
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await submit({ email, password });
      alert("Đăng nhập thành công!");
      // Redirect hoặc update state
    } catch (err) {
      // submitError sẽ được set tự động
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2>Đăng Nhập</h2>
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
      </button>
    </form>
  );
}

// ===== Create Study Set Component Example =====
export function CreateStudySetExample() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const { isSubmitting, submitError, submit, clearError } = useSubmit(
    studySetService.create
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const result = await submit({ title, description, visibility });
      alert(`Tạo thành công! ID: ${result?.id}`);
      setTitle("");
      setDescription("");
    } catch (err) {
      // submitError sẽ được set
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2>Tạo Study Set</h2>

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. English Vocabulary"
          className="w-full px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả về study set này..."
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hiển thị</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}
          className="w-full px-3 py-2 border border-gray-300 rounded"
        >
          <option value="PRIVATE">Riêng tư</option>
          <option value="PUBLIC">Công khai</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting ? "Đang tạo..." : "Tạo Study Set"}
      </button>
    </form>
  );
}

// ===== Study Set List Component Example =====
"use client";
import { useFetchData } from "@acme/api";

export function StudySetListExample() {
  const { data: studySets, isLoading, error, refetch } = useFetchData(
    studySetService.getMyStudySets
  );

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Study Sets</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {studySets && studySets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studySets.map((set) => (
            <div
              key={set.id}
              className="p-4 border border-gray-300 rounded-lg hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg">{set.title}</h3>
              <p className="text-gray-600 text-sm">{set.description}</p>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-500">
                  {set.flashcardCount || 0} cards
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    set.visibility === "PUBLIC"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {set.visibility}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Bạn chưa có Study Set nào. Hãy tạo một cái mới!
        </div>
      )}
    </div>
  );
}

// ===== Upload Image Component Example =====
"use client";
import { externalService } from "@acme/api";
import { useState } from "react";

export function ImageUploadExample() {
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const result = await externalService.uploadImage(file);
      if (result.success && result.data?.url) {
        setUploadedUrl(result.data.url);
        alert("Upload thành công!");
      } else {
        setError(result.error?.message || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h2>Upload Hình Ảnh</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded p-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            handleFileChange(e);
            handleUpload(e);
          }}
          disabled={uploading}
          className="w-full"
        />
      </div>

      {preview && (
        <div>
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded"
          />
        </div>
      )}

      {uploadedUrl && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>URL: {uploadedUrl}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(uploadedUrl);
              alert("Đã copy!");
            }}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded"
          >
            Copy URL
          </button>
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
}

