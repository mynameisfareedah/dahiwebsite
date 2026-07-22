import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadResourceCoverImageMock } = vi.hoisted(() => ({
  uploadResourceCoverImageMock: vi.fn(),
}));

let insertMock = vi.fn();

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: (table) => {
      if (table === 'admin_users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { active: true, role: 'Admin' }, error: null }),
            }),
          }),
        };
      }

      if (table === 'resources') {
        return {
          insert: (...args) => insertMock(...args),
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }

      return {};
    },
    storage: { from: vi.fn() },
  },
  isSupabaseConfigured: true,
  handleSupabaseError: (e) => e,
}));

vi.mock('../resourceImageService', () => ({
  uploadResourceCoverImage: uploadResourceCoverImageMock,
}));

import { resourceService } from '../resourceService';
import { supabase } from '../../../lib/supabase';

describe('createResource payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'resource-1',
            title: 'Health Guide',
            cover_image: 'https://cdn.example.com/cover.png',
            external_url: 'https://example.com/resource',
            resource_type: 'guide',
            category: 'general',
            featured: false,
            status: 'draft',
          },
          error: null,
        }),
      }),
    });
  });

  it('uploads cover image and includes created_by in insert payload', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({ data: { user: { id: 'admin-1' } }, error: null });

    uploadResourceCoverImageMock.mockResolvedValueOnce({ publicUrl: 'https://cdn.example.com/cover.png', storagePath: 'cover.png' });

    const file = { name: 'cover.png', size: 500, type: 'image/png' };

    const result = await resourceService.createResource({
      title: 'Health Guide',
      description: 'A guide',
      category: 'general',
      resourceType: 'guide',
      externalUrl: 'https://example.com/resource',
      coverImageFile: file,
    });

    expect(uploadResourceCoverImageMock).toHaveBeenCalledWith(file);
    expect(result.success).toBe(true);

    // assert insert called with payload containing created_by
    expect(insertMock).toHaveBeenCalled();
    const calledWith = insertMock.mock.calls[0][0];
    expect(calledWith).toBeDefined();
    expect(calledWith.created_by).toBe('admin-1');
    expect(calledWith.cover_image).toBe('https://cdn.example.com/cover.png');
  });
});
