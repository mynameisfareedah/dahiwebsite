import { beforeEach, describe, expect, it, vi } from 'vitest';

const { uploadResourceCoverImageMock } = vi.hoisted(() => ({
  uploadResourceCoverImageMock: vi.fn(),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
  handleSupabaseError: (error) => error,
}));

vi.mock('../resourceImageService', () => ({
  uploadResourceCoverImage: uploadResourceCoverImageMock,
}));

vi.mock('../auditService', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

import { resourceService } from '../resourceService';
import { supabase } from '../../../lib/supabase';

describe('resourceService - cover image upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadResourceCoverImageMock.mockReset();
  });

  it('uploads a selected cover image before creating a resource', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-1' } },
      error: null,
    });

    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'admin_users') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { active: true, role: 'Admin' },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === 'resources') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'resource-1',
                  title: 'Health Guide',
                  description: 'A guide',
                  category: 'general',
                  resource_type: 'guide',
                  cover_image: 'https://cdn.example.com/cover.png',
                  external_url: 'https://example.com/resource',
                  platform: 'External',
                  button_text: 'Read now',
                  featured: false,
                  status: 'draft',
                },
                error: null,
              }),
            }),
          }),
        };
      }

      return {};
    });

    uploadResourceCoverImageMock.mockResolvedValueOnce({
      publicUrl: 'https://cdn.example.com/cover.png',
      storagePath: 'resources/cover.png',
    });

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
    expect(result.data.coverImage).toBe('https://cdn.example.com/cover.png');
  });

  it('uploads a new cover image before updating an existing resource', async () => {
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'resources') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'resource-1',
                  title: 'Health Guide',
                  description: 'A guide',
                  category: 'general',
                  resource_type: 'guide',
                  cover_image: 'https://cdn.example.com/old.png',
                  external_url: 'https://example.com/resource',
                  platform: 'External',
                  featured: false,
                  status: 'draft',
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'resource-1',
                    title: 'Health Guide',
                    description: 'A guide',
                    category: 'general',
                    resource_type: 'guide',
                    cover_image: 'https://cdn.example.com/new.png',
                    external_url: 'https://example.com/resource',
                    platform: 'External',
                    featured: false,
                    status: 'draft',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    });

    uploadResourceCoverImageMock.mockResolvedValueOnce({
      publicUrl: 'https://cdn.example.com/new.png',
      storagePath: 'resources/new.png',
    });

    const file = { name: 'cover.png', size: 500, type: 'image/png' };
    const result = await resourceService.updateResource('resource-1', {
      title: 'Health Guide',
      description: 'A guide',
      category: 'general',
      resourceType: 'guide',
      externalUrl: 'https://example.com/resource',
      coverImageFile: file,
    });

    expect(uploadResourceCoverImageMock).toHaveBeenCalledWith(file);
    expect(result.success).toBe(true);
    expect(result.data.coverImage).toBe('https://cdn.example.com/new.png');
  });
});
