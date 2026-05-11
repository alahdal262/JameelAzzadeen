
import { Testimonial, Video, CareerMoment, Article, GalleryImage } from '../types';
// @ts-ignore
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    setDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    getDoc
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

// ---------------------------------------------------------
// بيانات الاتصال بقاعدة البيانات (Firebase)
// ---------------------------------------------------------
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA_L0XyjlLOeavYYuKIHddwD23PepZPtuQ",
  authDomain: "gameelazzadeen.firebaseapp.com",
  projectId: "gameelazzadeen",
  storageBucket: "gameelazzadeen.firebasestorage.app",
  messagingSenderId: "1074091818654",
  appId: "1:1074091818654:web:114c8a4d55f5ce36c5c58f",
  measurementId: "G-SPEN12CYTF"
};

export const DEFAULT_HERO_IMAGE = "https://gamilazzdeen.com/wp-content/uploads/2025/12/gamil.png";

// تهيئة Firebase
let db: any;
let auth: any;

try {
    const app = initializeApp(FIREBASE_CONFIG);
    // ⚠️ تم إزالة التخزين المؤقت (Persistence) نهائياً
    // الآن الاتصال مباشر: إذا لم يكن هناك إنترنت أو صلاحية، ستفشل العملية فوراً.
    db = getFirestore(app);
    
    // محاولة تهيئة Auth بشكل منفصل لتجنب تعطل التطبيق بالكامل إذا فشلت
    try {
        auth = getAuth(app);
        console.log("✅ Firebase Auth Initialized");
    } catch (authError) {
        console.warn("⚠️ Failed to initialize Firebase Auth (Check imports in index.html):", authError);
    }
    
    console.log("✅ Connected to Firebase (Direct Mode)");
} catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
}

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

// ---------------------------------------------------------
// خدمة التخزين (أونلاين فقط - بدون ذاكرة مؤقتة)
// ---------------------------------------------------------
export const StorageService = {
  
  // فحص الاتصال واختبار الكتابة
  testConnection: async (): Promise<{success: boolean, message: string}> => {
      if (!db) return { success: false, message: "Firebase SDK not initialized" };
      try {
          // محاولة قراءة بسيطة (Ping)
           await getDoc(doc(db, 'system', 'ping'));
          return { success: true, message: "الاتصال ناجح" };
      } catch (e: any) {
          console.error("Connection test failed:", e);
          if (e.code === 'permission-denied' || e.message?.includes('permission') || e.message?.includes('Missing or insufficient permissions')) {
              console.error(`
              %c⚠️ تنبيه هام: قاعدة البيانات مغلقة! ⚠️
              يرجى الذهاب إلى Firebase Console > Firestore Database > Rules
              وتغيير القواعد إلى: allow read, write: if true;
              `, "color: red; font-weight: bold; font-size: 14px;");
              return { success: false, message: "permission-denied" };
          }
          return { success: false, message: `خطأ غير متوقع: ${e.message}` };
      }
  },

  // Authentication Methods
  login: async (email: string, pass: string) => {
      if (!auth) throw new Error("Auth not initialized (Check Console Logs)");
      return signInWithEmailAndPassword(auth, email, pass);
  },

  logout: async () => {
      if (!auth) return;
      return signOut(auth);
  },

  getCurrentUser: (): User | null => {
      return auth?.currentUser || null;
  },

  isOnline: (): boolean => !!db,

  // --- الصورة الشخصية ---
  getHeroImage: async (): Promise<string> => {
      if (!db) return DEFAULT_HERO_IMAGE;
      try {
          const docRef = doc(db, 'settings', 'hero_image');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) return docSnap.data().url;
      } catch (e) { console.error("Error getting hero image:", e); throw e; }
      return DEFAULT_HERO_IMAGE;
  },

  saveHeroImage: async (url: string): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await setDoc(doc(db, 'settings', 'hero_image'), { url }, { merge: true });
  },

  // --- معرف القناة ---
  getChannelId: async (): Promise<string> => {
      if (!db) return '';
      try {
          const docRef = doc(db, 'settings', 'general');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) return docSnap.data().channelId || '';
      } catch (e) { console.error("Error getting channel ID:", e); throw e; }
      return '';
  },

  saveChannelId: async (channelId: string): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await setDoc(doc(db, 'settings', 'general'), { channelId }, { merge: true });
  },

  // --- الآراء (Testimonials) ---
  getTestimonials: async (): Promise<Testimonial[]> => {
    if (!db) return [];
    try {
      const q = query(collection(db, 'testimonials'), orderBy('id', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: Testimonial[] = [];
      querySnapshot.forEach((doc) => items.push(doc.data() as Testimonial));
      return items;
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  saveTestimonials: async (items: Testimonial[]): Promise<boolean> => {
    if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
    // Save items individually
    for (const item of items) {
        await setDoc(doc(db, 'testimonials', String(item.id)), item);
    }
    return true;
  },

  deleteTestimonial: async (id: string | number): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await deleteDoc(doc(db, 'testimonials', String(id)));
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
    if (!db) return [];
    try {
      const q = query(collection(db, 'videos'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const items: Video[] = [];
      querySnapshot.forEach((doc) => items.push(doc.data() as Video));
      return items;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }
  },

  saveVideos: async (items: Video[]): Promise<boolean> => {
    if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
    for (const item of items) {
        await setDoc(doc(db, 'videos', item.id), item);
    }
    return true;
  },

  deleteVideo: async (id: string): Promise<void> => {
    if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
    await deleteDoc(doc(db, 'videos', id));
  },

  // --- السيرة (Career Moments) ---
  getCareerMoments: async (): Promise<CareerMoment[]> => {
    if (!db) return [];
    try {
        const q = query(collection(db, 'career_moments'), orderBy('id', 'desc'));
        const querySnapshot = await getDocs(q);
        const items: CareerMoment[] = [];
        querySnapshot.forEach((doc) => items.push(doc.data() as CareerMoment));
        return items;
    } catch(e) { 
        console.error("Error fetching moments:", e);
        throw e;
    }
  },

  saveCareerMoments: async (items: CareerMoment[]): Promise<boolean> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      for (const item of items) {
          await setDoc(doc(db, 'career_moments', String(item.id)), item);
      }
      return true;
  },

  deleteCareerMoment: async (id: string | number): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await deleteDoc(doc(db, 'career_moments', String(id)));
  },

  // --- المقالات ---
  getArticles: async (): Promise<Article[]> => {
    if (!db) return [];
    try {
        const q = query(collection(db, 'articles'), orderBy('id', 'desc'));
        const querySnapshot = await getDocs(q);
        const items: Article[] = [];
        querySnapshot.forEach((doc) => items.push(doc.data() as Article));
        return items;
    } catch(e) {
        console.error("Error fetching articles:", e);
        throw e;
    }
  },

  saveArticles: async (items: Article[]): Promise<boolean> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      for (const item of items) {
          await setDoc(doc(db, 'articles', String(item.id)), item);
      }
      return true;
  },

  deleteArticle: async (id: string): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await deleteDoc(doc(db, 'articles', id));
  },

  // --- المعرض ---
  getGallery: async (): Promise<GalleryImage[]> => {
    if (!db) return [];
    try {
        const q = query(collection(db, 'gallery'), orderBy('id', 'desc'));
        const querySnapshot = await getDocs(q);
        const items: GalleryImage[] = [];
        querySnapshot.forEach((doc) => items.push(doc.data() as GalleryImage));
        return items;
    } catch(e) {
        console.error("Error fetching gallery:", e);
        throw e;
    }
  },

  saveGallery: async (items: GalleryImage[]): Promise<boolean> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      for (const item of items) {
          await setDoc(doc(db, 'gallery', String(item.id)), item);
      }
      return true;
  },

  deleteGalleryImage: async (id: string | number): Promise<void> => {
      if (!db) throw new Error("لا يوجد اتصال بقاعدة البيانات");
      await deleteDoc(doc(db, 'gallery', String(id)));
  }
};
