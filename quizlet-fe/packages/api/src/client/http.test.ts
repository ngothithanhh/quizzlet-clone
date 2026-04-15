/**
 * API Client Test Suite
 * Kiểm tra kết nối với backend
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  apiGet,
  apiPost,
  getAccessToken,
  setTokens,
  clearTokens,
} from "./http";
import {
  authService,
  studySetService,
  flashcardService,
} from "./services";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("API Client", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Token Management", () => {
    it("should set and get tokens", () => {
      const token = "test-token-123";
      setTokens(token);
      expect(getAccessToken()).toBe(token);
    });

    it("should clear tokens", () => {
      setTokens("test-token");
      clearTokens();
      expect(getAccessToken()).toBeNull();
    });

    it("should set both access and refresh tokens", () => {
      setTokens("access-token", "refresh-token");
      expect(getAccessToken()).toBe("access-token");
    });
  });

  describe("Auth Service", () => {
    it("should have login method", () => {
      expect(authService.login).toBeDefined();
      expect(typeof authService.login).toBe("function");
    });

    it("should have register method", () => {
      expect(authService.register).toBeDefined();
      expect(typeof authService.register).toBe("function");
    });

    it("should have logout method", () => {
      expect(authService.logout).toBeDefined();
      setTokens("test-token");
      authService.logout();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("Study Set Service", () => {
    it("should have CRUD methods", () => {
      expect(studySetService.create).toBeDefined();
      expect(studySetService.getMyStudySets).toBeDefined();
      expect(studySetService.getAll).toBeDefined();
      expect(studySetService.getById).toBeDefined();
      expect(studySetService.update).toBeDefined();
      expect(studySetService.delete).toBeDefined();
    });
  });

  describe("Flashcard Service", () => {
    it("should have CRUD methods", () => {
      expect(flashcardService.create).toBeDefined();
      expect(flashcardService.update).toBeDefined();
      expect(flashcardService.delete).toBeDefined();
      expect(flashcardService.getByStudySet).toBeDefined();
    });

    it("should have import/export methods", () => {
      expect(flashcardService.import).toBeDefined();
      expect(flashcardService.export).toBeDefined();
      expect(flashcardService.clone).toBeDefined();
    });
  });

  describe("API Response Format", () => {
    it("should return proper response structure", async () => {
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ id: 1, name: "test" }),
          clone: () => ({
            json: () => Promise.resolve({ id: 1, name: "test" }),
          }),
        })
      ) as jest.Mock;

      const response = await apiGet("/api/test");

      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("status");
      expect(response).toHaveProperty("data");
    });
  });
});

/**
 * Integration Tests (khi backend chạy)
 * Chạy với: npm run test:integration
 */
describe("API Integration Tests", () => {
  // Skip these tests by default, chỉ chạy khi backend running
  const skipTests = !process.env.API_INTEGRATION_TEST;

  describe.skip("Auth Flow", () => {
    it("should complete registration flow", async () => {
      // Test registration with real backend
      // const result = await authService.sendRegisterOtp("test@example.com");
      // expect(result.success).toBe(true);
    });

    it("should complete login flow", async () => {
      // Test login with real backend
      // const result = await authService.login({
      //   email: "test@example.com",
      //   password: "test123"
      // });
      // expect(result.success).toBe(true);
      // expect(getAccessToken()).toBeTruthy();
    });
  });

  describe.skip("Study Set CRUD", () => {
    it("should create a study set", async () => {
      // Test with real backend
      // const result = await studySetService.create({
      //   title: "Test Set",
      //   description: "Test",
      //   visibility: "PRIVATE"
      // });
      // expect(result.success).toBe(true);
      // expect(result.data?.id).toBeDefined();
    });
  });
});

export {};

