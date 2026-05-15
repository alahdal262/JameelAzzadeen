export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Header
    nav: {
      home: 'الرئيسية',
      about: 'من هو جميل عزالدين',
      gallery: 'مكتبة الصور',
      videos: 'فيديوهات',
      twitter: 'تغريدات',
      facebook: 'فيسبوك',
      testimonials: 'قالوا عنه',
    },

    // Hero
    hero: {
      badge: 'الإعلامي والعميد',
      title1: 'جميل',
      title2: 'عزالدين',
      ctaWatch: 'شاهد أحدث الأعمال',
      ctaAbout: 'المزيد عنه',
      badgeInner: 'صوت الجمهورية',
      badgeInnerSub: 'من قلب الحدث',
    },

    // About
    about: {
      sectionTag: 'السيرة الذاتية',
      title: 'من هو جميل عزالدين؟',
      bio1: 'قامة إعلامية يمنية شامخة وصوت وطني بليغ، رسّخ مكانته على مدى عقود كأحد أبرز وجوه الإعلام في اليمن والعالم العربي. اشتُهر بفصاحته المتقدة وقدرته الفريدة على استنطاق الحقائق في أحلك الظروف.',
      bio2: 'تقلّد منصب رئيس قطاع التلفزيون في الفضائية اليمنية، وشغل رتبة عميد في جهاز التوجيه المعنوي، ليجمع بين ثقل المسؤولية الوطنية وروح الصحفي المقاتل الذي لا يساوم على الحقيقة.',
      statsYears: 'عامًا من العطاء',
      statsInterviews: 'لقاء ومقابلة',
      statsPrograms: 'برنامج تلفزيوني',
      readArticles: 'اقرأ مقالاته',
      carouselTitle: 'محطات من المسيرة',
    },

    // Gallery
    gallery: {
      sectionTag: 'المعرض',
      title: 'مكتبة الصور',
      subtitle: 'لحظات من مسيرة وطنية حافلة',
      noImages: 'لا توجد صور حتى الآن.',
    },

    // Videos
    videos: {
      sectionTag: 'قناة يوتيوب',
      title: 'أحدث الفيديوهات',
      subtitle: 'تابع آخر المقاطع والتقارير',
      watchBtn: 'مشاهدة',
      noVideos: 'لا توجد فيديوهات حتى الآن.',
    },

    // Twitter
    twitter: {
      sectionTag: 'على تويتر',
      title: 'من تغريداته',
      subtitle: 'حكمة وموقف في 280 حرفاً',
      followBtn: 'تابعني على تويتر',
    },

    // Facebook
    facebook: {
      sectionTag: 'على فيسبوك',
      title: 'من صفحته',
      subtitle: 'تابع آخر المنشورات والتحديثات',
      followBtn: 'تابع الصفحة على فيسبوك',
    },

    // Testimonials
    testimonials: {
      sectionTag: 'الشهادات',
      title: 'ماذا قالوا عنه',
      subtitle: 'آراء الزملاء والمعجبين',
    },

    // Articles
    articles: {
      sectionTag: 'المقالات',
      title: 'أحدث المقالات',
      subtitle: 'قراءات في السياسة والوطن',
      readMore: 'اقرأ المزيد',
      backHome: 'العودة للرئيسية',
      noArticles: 'لا توجد مقالات حتى الآن.',
    },

    // Footer
    footer: {
      description: 'الموقع الرسمي للإعلامي والعميد جميل عزالدين. نافذتكم على الحقيقة ومنبر للكلمة الوطنية الصادقة.',
      quickLinks: 'روابط سريعة',
      contact: 'تواصل معنا',
      newsletter: 'القائمة البريدية',
      newsletterDesc: 'اشترك ليصلك أحدث المقالات والأخبار',
      emailPlaceholder: 'البريد الإلكتروني',
      subscribe: 'اشتراك',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام',
      backTop: 'العودة للأعلى',
      rights: 'جميع الحقوق محفوظة.',
      location: 'اليمن - عدن / مأرب',
      links: {
        about: 'من هو جميل عزالدين',
        gallery: 'مكتبة الصور',
        videos: 'مكتبة الفيديو',
        articles: 'المقالات',
        testimonials: 'ماذا قيل عنه',
      },
    },

    // Loading / Errors
    loading: 'جارٍ التحميل...',
    permissionError: {
      title: 'تنبيه: قاعدة البيانات مغلقة!',
      desc: 'الموقع لا يستطيع جلب أو حفظ البيانات بسبب إعدادات الأمان في Firebase.',
      step1: 'اذهب إلى',
      step2: 'اختر مشروعك',
      step3: 'من القائمة الجانبية اختر',
      step4: 'اختر التبويب',
      step5: 'امسح الكود الموجود وضع الكود التالي بدلاً منه:',
      reload: 'لقد قمت بتحديث القواعد، أعد التحميل',
    },
  },

  en: {
    // Header
    nav: {
      home: 'Home',
      about: 'About Gamil',
      gallery: 'Gallery',
      videos: 'Videos',
      twitter: 'Tweets',
      facebook: 'Facebook',
      testimonials: 'Testimonials',
    },

    // Hero
    hero: {
      badge: 'Media Personality & Brigadier',
      title1: 'Gamil',
      title2: 'Azzadeen',
      ctaWatch: 'Watch Latest Work',
      ctaAbout: 'Learn More',
      badgeInner: 'Voice of the Republic',
      badgeInnerSub: 'From the heart of the event',
    },

    // About
    about: {
      sectionTag: 'Biography',
      title: 'Who is Gamil Azzadeen?',
      bio1: 'A towering Yemeni media figure and eloquent national voice, Gamil Azzadeen has cemented his standing over decades as one of the most prominent faces in Yemeni and Arab media. He is renowned for his exceptional eloquence and unique ability to uncover the truth under the most difficult circumstances.',
      bio2: 'He served as Head of the Television Sector at Yemen Satellite Channel and holds the rank of Brigadier General in the Moral Guidance apparatus, combining the weight of national responsibility with the spirit of a journalist who never compromises on truth.',
      statsYears: 'Years of Service',
      statsInterviews: 'Interviews & Meetings',
      statsPrograms: 'TV Programs',
      readArticles: 'Read His Articles',
      carouselTitle: 'Career Milestones',
    },

    // Gallery
    gallery: {
      sectionTag: 'Gallery',
      title: 'Photo Library',
      subtitle: 'Moments from a distinguished national journey',
      noImages: 'No images yet.',
    },

    // Videos
    videos: {
      sectionTag: 'YouTube Channel',
      title: 'Latest Videos',
      subtitle: 'Follow the latest clips and reports',
      watchBtn: 'Watch',
      noVideos: 'No videos yet.',
    },

    // Twitter
    twitter: {
      sectionTag: 'On Twitter',
      title: 'From His Tweets',
      subtitle: 'Wisdom and stance in 280 characters',
      followBtn: 'Follow on Twitter',
    },

    // Facebook
    facebook: {
      sectionTag: 'On Facebook',
      title: 'From His Page',
      subtitle: 'Follow the latest posts and updates',
      followBtn: 'Follow on Facebook',
    },

    // Testimonials
    testimonials: {
      sectionTag: 'Testimonials',
      title: 'What They Said About Him',
      subtitle: 'Opinions from colleagues and admirers',
    },

    // Articles
    articles: {
      sectionTag: 'Articles',
      title: 'Latest Articles',
      subtitle: 'Readings on politics and the homeland',
      readMore: 'Read More',
      backHome: 'Back to Home',
      noArticles: 'No articles yet.',
    },

    // Footer
    footer: {
      description: "The official website of media personality and Brigadier General Gamil Azzadeen. Your window to the truth and a platform for the honest national word.",
      quickLinks: 'Quick Links',
      contact: 'Contact Us',
      newsletter: 'Newsletter',
      newsletterDesc: 'Subscribe to receive the latest articles and news',
      emailPlaceholder: 'Email address',
      subscribe: 'Subscribe',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      backTop: 'Back to Top',
      rights: 'All rights reserved.',
      location: 'Yemen - Aden / Marib',
      links: {
        about: 'About Gamil Azzadeen',
        gallery: 'Photo Gallery',
        videos: 'Video Library',
        articles: 'Articles',
        testimonials: 'Testimonials',
      },
    },

    // Loading / Errors
    loading: 'Loading...',
    permissionError: {
      title: 'Warning: Database is Closed!',
      desc: 'The website cannot fetch or save data due to Firebase security settings.',
      step1: 'Go to',
      step2: 'Select your project',
      step3: 'From the sidebar select',
      step4: 'Select the tab',
      step5: 'Delete the existing code and replace it with:',
      reload: 'I updated the rules, reload',
    },
  },
};

export type Translations = typeof translations.ar;
