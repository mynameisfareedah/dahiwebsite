import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the supabase module BEFORE importing authService
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
}));

// Now import the real authService
import { authService } from '../authService';
import { supabase } from '../../../lib/supabase';

describe('AuthService - Real Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-abc', user: mockUser };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error for invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      const result = await authService.signIn('test@example.com', 'wrongpassword');

      expect(result.error).toBe('Invalid login credentials');
      expect(result.user).toBeUndefined();
    });

    it('should catch and return network errors', async () => {
      const error = new Error('Network error');
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValueOnce(error);

      const result = await authService.signIn('test@example.com', 'password');

      expect(result.error).toBe('Network error');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully and clear session', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      // Set a session to verify it gets cleared
      localStorage.setItem('adminSession', JSON.stringify({ token: 'test' }));

      const result = await authService.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should clear session even if Supabase call has error', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: { message: 'Already signed out' },
      });

      localStorage.setItem('adminSession', JSON.stringify({ token: 'test' }));

      const result = await authService.signOut();

      expect(result.error).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.auth.signOut).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.signOut();

      expect(result.error).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return null when no session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const session = await authService.getSession();

      expect(session).toBeNull();
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return valid session and persist it', async () => {
      const mockSession = {
        access_token: 'token-abc',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      const session = await authService.getSession();

      expect(session).toEqual(mockSession);
    });

    it('should handle session retrieval errors and return null', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Error fetching session' },
      });

      const session = await authService.getSession();

      expect(session).toBeNull();
    });

    it('should handle network errors', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValueOnce(new Error('Network error'));

      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return null when no user is authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const user = await authService.getUser();

      expect(user).toBeNull();
    });

    it('should return current authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { role: 'admin' },
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const user = await authService.getUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null for auth session errors', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Auth session missing' },
      });

      const user = await authService.getUser();

      expect(user).toBeNull();
    });

    it('should handle network errors', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(new Error('Network error'));

      const user = await authService.getUser();

      expect(user).toBeNull();
    });
  });

  describe('verifyAdmin', () => {
    it('should verify admin by checking profiles table', async () => {
      const mockProfile = { id: 'user-123', role: 'Admin' };

      // Mock the Supabase from().select() chain
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: mockSelect,
      });

      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ maybeSingle: mockMaybeSingle });

      const isAdmin = await authService.verifyAdmin('user-123');

      expect(isAdmin).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should return false for non-admin users', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: mockSelect,
      });

      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ maybeSingle: mockMaybeSingle });

      const isAdmin = await authService.verifyAdmin('user-456');

      expect(isAdmin).toBe(false);
    });

    it('should return false when userId is missing', async () => {
      const isAdmin = await authService.verifyAdmin();

      expect(isAdmin).toBe(false);
    });

    it('should handle database query errors', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: mockSelect,
      });

      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ maybeSingle: mockMaybeSingle });

      const isAdmin = await authService.verifyAdmin('user-123');

      expect(isAdmin).toBe(false);
    });
  });
});
