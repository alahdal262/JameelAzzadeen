
import { Testimonial, Video, CareerMoment, Article, GalleryImage } from '../types';

// ---------------------------------------------------------
// خدمة التخزين — REST API ذاتية الاستضافة (نفس الأصل /api)
// ---------------------------------------------------------

export const DEFAULT_HERO_IMAGE = "/gamil.jpg";

const AUTH_STORAGE_KEY = 'jameel_auth';

interface AuthSession {
    token: string;
    email: string;
}

const getSession = (): AuthSession | null => {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.token === 'string' && typeof parsed.email === 'string') {
            return parsed as AuthSession;
        }
        return null;
    } catch {
        return null;
    }
};

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const session = getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
    };
    const res = await fetch(`/api${path}`, { ...options, headers });
    // Session expiry (7d JWT): a 401 on an authenticated non-login request means
    // the token is dead — clear it and send the owner back to the login page
    // instead of letting saves fail with misleading generic errors.
    if (res.status === 401 && session && !path.startsWith('/auth/login')) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.alert('انتهت صلاحية الجلسة — يرجى تسجيل الدخول من جديد');
        window.location.assign('/login');
    }
    return res;
};

// --- Generic collection helpers (whitelisted server-side) ---
const getCollection = async <T>(name: string): Promise<T[]> => {
    const res = await apiFetch(`/collections/${name}`);
    if (!res.ok) throw new Error(`Failed to fetch ${name} (${res.status})`);
    const data = await res.json();
    return (data.items || []) as T[];
};

const saveCollection = async (name: string, items: unknown[]): Promise<boolean> => {
    const res = await apiFetch(`/collections/${name}`, {
        method: 'PUT',
        body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error(`Failed to save ${name} (${res.status})`);
    return true;
};

const deleteFromCollection = async (name: string, id: string | number): Promise<void> => {
    const res = await apiFetch(`/collections/${name}/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete from ${name} (${res.status})`);
};

// ---------------------------------------------------------
// دوال المساعدة لجلب الفيديوهات من يوتيوب
// ---------------------------------------------------------
const fetchVideosFromRSS = async (channelId: string): Promise<Video[]> => {
    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.status === 'ok' && data.items) {
            return data.items.map((item: any) => {
                const videoId = item.guid.split(':')[2] || item.link.split('v=')[1];
                return {
                    id: videoId,
                    title: item.title,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    url: item.link,
                    views: 'مشاهدة',
                    date: new Date(item.pubDate).toLocaleDateString('ar-EG')
                };
            });
        }
        return [];
    } catch (error) {
        console.error("RSS Fetch Error:", error);
        return [];
    }
};

export const StorageService = {

  // فحص الاتصال بالخادم وقاعدة البيانات
  testConnection: async (): Promise<{success: boolean, message: string}> => {
      try {
          const res = await apiFetch('/health');
          if (!res.ok) return { success: false, message: `خطأ في الخادم (${res.status})` };
          const data = await res.json();
          if (data.ok && data.db) return { success: true, message: "الاتصال ناجح" };
          if (data.ok && !data.db) return { success: false, message: "قاعدة البيانات غير متصلة" };
          return { success: false, message: "الخادم غير جاهز" };
      } catch (e: any) {
          console.error("Connection test failed:", e);
          return { success: false, message: `تعذر الاتصال بالخادم: ${e.message}` };
      }
  },

  // Authentication Methods
  login: async (email: string, pass: string) => {
      const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password: pass }),
      });
      if (res.status === 401) throw new Error('invalid_credentials');
      if (!res.ok) throw new Error(`login_failed_${res.status}`);
      const data = await res.json();
      const session: AuthSession = { token: data.token, email: data.email };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return session;
  },

  logout: async () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getCurrentUser: (): { email: string } | null => {
      const session = getSession();
      return session ? { email: session.email } : null;
  },

  changeCredentials: async (currentPassword: string, newEmail?: string, newPassword?: string): Promise<{ email: string }> => {
      const res = await apiFetch('/auth/credentials', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newEmail, newPassword }),
      });
      if (res.status === 401) throw new Error('unauthorized');
      if (res.status === 403) throw new Error('wrong_password');
      if (res.status === 400) {
          const body = await res.json().catch(() => ({} as { message?: string }));
          throw new Error(body.message === 'email_taken' ? 'email_taken' : 'bad_request');
      }
      if (!res.ok) throw new Error(`credentials_update_failed_${res.status}`);
      const data = await res.json();
      const session: AuthSession = { token: data.token, email: data.email };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { email: session.email };
  },

  isOnline: (): boolean => true,

  // --- الصورة الشخصية ---
  getHeroImage: async (): Promise<string> => {
      try {
          const res = await apiFetch('/settings/hero_image');
          if (!res.ok) return DEFAULT_HERO_IMAGE;
          const data = await res.json();
          return data.value?.url || DEFAULT_HERO_IMAGE;
      } catch (e) {
          console.error("Error getting hero image:", e);
          return DEFAULT_HERO_IMAGE;
      }
  },

  saveHeroImage: async (url: string): Promise<void> => {
      const res = await apiFetch('/settings/hero_image', {
          method: 'PUT',
          body: JSON.stringify({ value: { url } }),
      });
      if (!res.ok) throw new Error(`Failed to save hero image (${res.status})`);
  },

  // --- معرف القناة ---
  getChannelId: async (): Promise<string> => {
      try {
          const res = await apiFetch('/settings/general');
          if (!res.ok) return '';
          const data = await res.json();
          return data.value?.channelId || '';
      } catch (e) {
          console.error("Error getting channel ID:", e);
          return '';
      }
  },

  saveChannelId: async (channelId: string): Promise<void> => {
      const res = await apiFetch('/settings/general', {
          method: 'PUT',
          body: JSON.stringify({ value: { channelId } }),
      });
      if (!res.ok) throw new Error(`Failed to save channel ID (${res.status})`);
  },

  // --- الآراء (Testimonials) ---
  getTestimonials: async (): Promise<Testimonial[]> => {
      return getCollection<Testimonial>('testimonials');
  },

  saveTestimonials: async (items: Testimonial[]): Promise<boolean> => {
      return saveCollection('testimonials', items);
  },

  deleteTestimonial: async (id: string | number): Promise<void> => {
      return deleteFromCollection('testimonials', id);
  },

  // --- الفيديوهات ---
  getVideos: async (): Promise<Video[]> => {
    // محاولة جلب الفيديوهات من القناة أولاً
    const channelId = await StorageService.getChannelId().catch(() => ''); // Suppress error for RSS check only
    if (channelId) {
        const rssVideos = await fetchVideosFromRSS(channelId);
        if (rssVideos.length > 0) return rssVideos;
    }

    // ثم محاولة جلب الفيديوهات اليدوية من قاعدة البيانات
    return getCollection<Video>('videos');
  },

  saveVideos: async (items: Video[]): Promise<boolean> => {
      return saveCollection('videos', items);
  },

  deleteVideo: async (id: string): Promise<void> => {
      return deleteFromCollection('videos', id);
  },

  // --- السيرة (Career Moments) ---
  getCareerMoments: async (): Promise<CareerMoment[]> => {
      return getCollection<CareerMoment>('career_moments');
  },

  saveCareerMoments: async (items: CareerMoment[]): Promise<boolean> => {
      return saveCollection('career_moments', items);
  },

  deleteCareerMoment: async (id: string | number): Promise<void> => {
      return deleteFromCollection('career_moments', id);
  },

  // --- المقالات ---
  getArticles: async (): Promise<Article[]> => {
      return getCollection<Article>('articles');
  },

  saveArticles: async (items: Article[]): Promise<boolean> => {
      return saveCollection('articles', items);
  },

  deleteArticle: async (id: string): Promise<void> => {
      return deleteFromCollection('articles', id);
  },

  // --- المعرض ---
  getGallery: async (): Promise<GalleryImage[]> => {
      return getCollection<GalleryImage>('gallery');
  },

  saveGallery: async (items: GalleryImage[]): Promise<boolean> => {
      return saveCollection('gallery', items);
  },

  deleteGalleryImage: async (id: string | number): Promise<void> => {
      return deleteFromCollection('gallery', id);
  }
};
