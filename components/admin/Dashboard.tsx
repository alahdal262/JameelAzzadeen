
import React, { useState, useEffect } from 'react';
import { Testimonial, Video, CareerMoment, Article, GalleryImage } from '../../types';
import { Trash2, Plus, Image as ImageIcon, Type, LogOut, LayoutDashboard, Video as VideoIcon, Quote, Loader2, Sparkles, Cloud, Save, Youtube, RefreshCw, UserCheck, Newspaper, Pencil, Link2, Wand2, Images, UploadCloud, User, Settings, Download, Upload, Database, AlertCircle, CheckCircle2, XCircle, KeyRound } from 'lucide-react';
import { analyzeImageForTestimonial, expandArticleContent } from '../../services/geminiService';
import { StorageService } from '../../services/storage';

interface DashboardProps {
    testimonials: Testimonial[];
    videos: Video[];
    careerMoments: CareerMoment[];
    articles: Article[];
    gallery: GalleryImage[];
    heroImage: string;
    onUpdateTestimonials: (items: Testimonial[]) => Promise<void>;
    onUpdateVideos: (items: Video[]) => Promise<void>;
    onUpdateCareerMoments: (items: CareerMoment[]) => Promise<void>;
    onUpdateArticles: (items: Article[]) => Promise<void>;
    onUpdateGallery: (items: GalleryImage[]) => Promise<void>;
    onUpdateHeroImage: (url: string) => Promise<void>;
    onLogout: () => void;
    initialTab?: string;
    onTabChange?: (slug: string) => void;
}

type Tab = 'testimonials' | 'videos' | 'about' | 'articles' | 'gallery' | 'settings' | 'account';

// URL slug <-> internal tab mapping ('backup' slug maps to internal 'settings' tab)
const slugToTab = (slug?: string): Tab => {
    switch (slug) {
        case 'testimonials':
        case 'videos':
        case 'about':
        case 'gallery':
        case 'articles':
        case 'account':
            return slug;
        case 'backup':
            return 'settings';
        default:
            return 'testimonials';
    }
};

const tabToSlug = (tab: Tab): string => (tab === 'settings' ? 'backup' : tab);

const Dashboard: React.FC<DashboardProps> = ({ testimonials, videos, careerMoments, articles, gallery, heroImage, onUpdateTestimonials, onUpdateVideos, onUpdateCareerMoments, onUpdateArticles, onUpdateGallery, onUpdateHeroImage, onLogout, initialTab, onTabChange }) => {
    const [activeTab, setActiveTab] = useState<Tab>(() => slugToTab(initialTab));

    // Sync tab state when the initialTab prop changes (e.g. browser back/forward)
    useEffect(() => {
        const tab = slugToTab(initialTab);
        setActiveTab(prev => (prev === tab ? prev : tab));
    }, [initialTab]);

    const handleTabClick = (tab: Tab) => {
        setActiveTab(tab);
        onTabChange?.(tabToSlug(tab));
    };
    const [isSaving, setIsSaving] = useState(false);
    const [dbStatus, setDbStatus] = useState<{status: 'idle' | 'checking' | 'ok' | 'error', message: string}>({status: 'idle', message: ''});

    // Hero Image State
    const [tempHeroImage, setTempHeroImage] = useState(heroImage);

    // Testimonial State
    const [newItemType, setNewItemType] = useState<'text' | 'image' | 'mixed'>('image');
    const [newAuthor, setNewAuthor] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newImage, setNewImage] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Video State
    const [videoMode, setVideoMode] = useState<'manual' | 'channel'>('manual');
    const [channelId, setChannelId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');

    // Career Moment State
    const [momentImage, setMomentImage] = useState<string>('');
    const [momentLabel, setMomentLabel] = useState('');
    const [momentYear, setMomentYear] = useState('');

    // Article State
    const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
    const [articleTitle, setArticleTitle] = useState('');
    const [articleCategory, setArticleCategory] = useState('');
    const [articleImage, setArticleImage] = useState<string>('');
    const [articleExcerpt, setArticleExcerpt] = useState('');
    const [articleContent, setArticleContent] = useState('');
    const [isExpanding, setIsExpanding] = useState(false);
    
    // Import State
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Gallery State
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    // Backup State
    const [isRestoring, setIsRestoring] = useState(false);

    // Account (Login Credentials) State
    const [accountCurrentPassword, setAccountCurrentPassword] = useState('');
    const [accountNewEmail, setAccountNewEmail] = useState(StorageService.getCurrentUser()?.email || '');
    const [accountNewPassword, setAccountNewPassword] = useState('');
    const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
    const [isChangingCredentials, setIsChangingCredentials] = useState(false);
    const [credentialsMessage, setCredentialsMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        setTempHeroImage(heroImage);
        
        // Load stored channel ID
        StorageService.getChannelId().then(id => {
            if (id) {
                setChannelId(id);
                setVideoMode('channel');
            }
        });
        
        // Auto-check DB connection on mount
        checkDbConnection();
    }, [heroImage]);

    const checkDbConnection = async () => {
        setDbStatus({status: 'checking', message: 'جاري فحص الاتصال...'});
        const result = await StorageService.testConnection();
        if (result.success) {
            setDbStatus({status: 'ok', message: result.message});
        } else {
            setDbStatus({status: 'error', message: result.message});
        }
    };

    const handleSaveChannelId = async () => {
        if (!channelId) return;
        setIsSaving(true);
        try {
            await StorageService.saveChannelId(channelId);
            alert('تم حفظ معرف القناة بنجاح في السيرفر!');
            window.location.reload();
        } catch (error: any) {
            alert('فشل الحفظ: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const compressImage = (base64Str: string, maxWidth = 800): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onerror = () => reject(new Error('تعذر قراءة الصورة — استخدم صيغة JPG أو PNG (صيغة HEIC من الآيفون غير مدعومة)'));
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, analyze = false) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const rawBase64 = reader.result as string;
                const compressedBase64 = await compressImage(rawBase64);
                setter(compressedBase64);

                if (analyze) {
                    setIsAnalyzing(true);
                    try {
                        const analysis = await analyzeImageForTestimonial(compressedBase64);
                        if (analysis.content || analysis.author) {
                            setNewContent(analysis.content || '');
                            setNewAuthor(analysis.author || 'غير معروف');
                            setNewRole(analysis.role || '');
                            setNewItemType('mixed');
                        }
                    } catch (error) {
                        console.error("Failed to analyze image", error);
                    } finally {
                        setIsAnalyzing(false);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingGallery(true);
        const newImages: GalleryImage[] = [];

        try {
            const promises = (Array.from(files) as File[]).map((file) => {
                return new Promise<void>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const rawBase64 = reader.result as string;
                        const compressedBase64 = await compressImage(rawBase64, 1000); 
                        
                        newImages.push({
                            id: Date.now() + Math.random(),
                            src: compressedBase64,
                            date: new Date().getFullYear().toString()
                        });
                        resolve();
                    };
                    reader.readAsDataURL(file);
                });
            });

            await Promise.all(promises);
            
            // Merge with existing gallery
            const updatedGallery = [...newImages, ...gallery];
            // Wait for server update
            await onUpdateGallery(updatedGallery);
            alert(`تم رفع ${newImages.length} صورة بنجاح للسيرفر!`);
        } catch (error: any) {
            console.error("Bulk upload error", error);
            alert("فشل الرفع للسيرفر: " + error.message);
        } finally {
            setIsUploadingGallery(false);
            if(e.target) e.target.value = '';
        }
    };

    const handleSaveHeroImage = async () => {
        setIsSaving(true);
        try {
            await onUpdateHeroImage(tempHeroImage);
            alert('تم تحديث الصورة الشخصية الرئيسية في السيرفر!');
        } catch (error: any) {
             alert('فشل الحفظ: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTestimonial = async (id: string | number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            setIsSaving(true);
            try {
                const updated = testimonials.filter(item => item.id !== id);
                await StorageService.deleteTestimonial(id); // Delete from DB
                await onUpdateTestimonials(updated); // Update State
            } catch (e: any) {
                alert("فشل الحذف: " + e.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDeleteVideo = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
            setIsSaving(true);
            try {
                const updated = videos.filter(item => item.id !== id);
                await StorageService.deleteVideo(id);
                await onUpdateVideos(updated);
            } catch(e: any) {
                alert("فشل الحذف: " + e.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDeleteMoment = async (id: string | number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            setIsSaving(true);
            try {
                const updated = careerMoments.filter(item => item.id !== id);
                await StorageService.deleteCareerMoment(id);
                await onUpdateCareerMoments(updated);
            } catch(e: any) {
                alert("فشل الحذف: " + e.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDeleteArticle = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
            setIsSaving(true);
            try {
                const updated = articles.filter(item => item.id !== id);
                await StorageService.deleteArticle(id);
                await onUpdateArticles(updated);
            } catch(e: any) {
                alert("فشل الحذف: " + e.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDeleteGalleryImage = async (id: string | number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            setIsSaving(true);
            try {
                const updated = gallery.filter(item => item.id !== id);
                await StorageService.deleteGalleryImage(id);
                await onUpdateGallery(updated);
            } catch(e: any) {
                alert("فشل الحذف: " + e.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticleId(article.id);
        setArticleTitle(article.title);
        setArticleCategory(article.category);
        setArticleImage(article.image);
        setArticleExcerpt(article.excerpt);
        
        let contentText = article.content;
        setArticleContent(contentText);
        
        const form = document.querySelector('form');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
    };

    const resetArticleForm = () => {
        setEditingArticleId(null);
        setArticleTitle('');
        setArticleCategory('');
        setArticleImage('');
        setArticleExcerpt('');
        setArticleContent('');
        setImportUrl('');
    };

    const handleAddTestimonial = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const newItem: Testimonial = {
            id: Date.now(),
            type: newItemType,
            author: (newItemType === 'text' || newItemType === 'mixed') ? newAuthor : undefined,
            role: (newItemType === 'text' || newItemType === 'mixed') ? newRole : undefined,
            content: (newItemType === 'text' || newItemType === 'mixed') ? newContent : undefined,
            src: (newItemType === 'image' || newItemType === 'mixed') ? newImage : undefined
        };

        try {
            await onUpdateTestimonials([newItem, ...testimonials]);
            setNewAuthor(''); 
            setNewRole(''); 
            setNewContent(''); 
            setNewImage('');
            setNewItemType('image'); 
            alert('تم الحفظ في السيرفر بنجاح!');
        } catch (error: any) {
            alert('فشل الحفظ في السيرفر: ' + error.message + '\nتأكد من اتصال الإنترنت.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let videoId = '';
        try {
            const trimmed = videoUrl.trim();
            if (trimmed.includes('v=')) {
                videoId = trimmed.split('v=')[1].split('&')[0];
            } else if (trimmed.includes('youtu.be/')) {
                videoId = trimmed.split('youtu.be/')[1].split('?')[0];
            } else if (trimmed.includes('shorts/')) {
                 videoId = trimmed.split('shorts/')[1].split('?')[0];
            } else if (trimmed.includes('live/')) {
                 videoId = trimmed.split('live/')[1].split('?')[0];
            } else if (trimmed.includes('embed/')) {
                 videoId = trimmed.split('embed/')[1].split('?')[0];
            } else if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
                 videoId = trimmed; // bare video id
            }
        } catch (e) {
            alert('الرابط غير صحيح');
            return;
        }

        // A real YouTube id is exactly 11 URL-safe chars — anything else would
        // publish a dead thumbnail and a broken embed on the public site.
        if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
            alert('لم يتم التعرف على معرف الفيديو. تأكد من الرابط (YouTube Link).');
            return;
        }

        const newVideo: Video = {
            id: videoId,
            title: videoTitle,
            url: videoUrl,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            date: new Date().toLocaleDateString('ar-EG'),
            views: 'جديد'
        };

        setIsSaving(true);
        try {
            await onUpdateVideos([newVideo, ...videos]);
            setVideoUrl('');
            setVideoTitle('');
            alert('تم حفظ الفيديو في السيرفر بنجاح!');
        } catch (e: any) {
            alert("فشل الحفظ: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCareerMoment = async (e: React.FormEvent) => {
        e.preventDefault();
        const newMoment: CareerMoment = {
            id: Date.now(),
            src: momentImage,
            label: momentLabel,
            year: momentYear
        };
        
        setIsSaving(true);
        try {
            await onUpdateCareerMoments([newMoment, ...careerMoments]);
            setMomentImage('');
            setMomentLabel('');
            setMomentYear('');
            alert('تمت إضافة الصورة للسيرفر بنجاح!');
        } catch (e: any) {
            alert("فشل الحفظ: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExpandArticle = async () => {
        if (!articleTitle) {
            alert('يرجى كتابة عنوان للمقال أولاً.');
            return;
        }

        setIsExpanding(true);
        try {
            const brief = articleContent || articleExcerpt || articleTitle;
            const expandedContent = await expandArticleContent(articleTitle, brief);
            setArticleContent(expandedContent);
        } catch (error) {
            alert('حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.');
        } finally {
            setIsExpanding(false);
        }
    };

    const handleImportFromUrl = async () => {
        if (!importUrl) return;
        
        setIsImporting(true);
        try {
            let titleGuess = "مقال جديد";
            try {
               const urlParts = importUrl.split('/');
               const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
               if (lastPart) {
                   titleGuess = decodeURIComponent(lastPart).replace(/-/g, ' ');
               }
            } catch (e) {}

            const generatedContent = await expandArticleContent(titleGuess, `اكتب مقالاً كاملاً عن: ${titleGuess}`);
            
            setArticleTitle(titleGuess);
            setArticleContent(generatedContent);
            setArticleExcerpt(generatedContent.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'); 
            setArticleCategory('مقال مستورد');
            
            alert('تم استيراد (توليد) المقال بنجاح! يمكنك الآن تعديله.');
        } catch (error) {
            alert('فشل الاستيراد. تأكد من الرابط.');
        } finally {
            setIsImporting(false);
        }
    };

    const handleSubmitArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let formattedContent = articleContent;
        if (!articleContent.includes('<p>') && !articleContent.includes('<h3>')) {
             formattedContent = articleContent.split('\n').filter(line => line.trim() !== '').map(line => `<p>${line}</p>`).join('');
        }

        setIsSaving(true);
        try {
            if (editingArticleId) {
                const updatedArticles = articles.map(art => {
                    if (art.id === editingArticleId) {
                        return {
                            ...art,
                            title: articleTitle,
                            category: articleCategory,
                            excerpt: articleExcerpt,
                            content: formattedContent,
                            image: articleImage || art.image, 
                        };
                    }
                    return art;
                });
                await onUpdateArticles(updatedArticles);
                alert('تم تعديل المقال في السيرفر بنجاح!');
            } else {
                const slug = articleTitle.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');
                const newArticle: Article = {
                    id: String(Date.now()),
                    slug: slug,
                    title: articleTitle,
                    category: articleCategory,
                    excerpt: articleExcerpt,
                    content: formattedContent,
                    image: articleImage || 'https://picsum.photos/seed/new_article/800/600',
                    date: new Date().toLocaleDateString('ar-EG')
                };
                await onUpdateArticles([newArticle, ...articles]);
                alert('تم نشر المقال في السيرفر بنجاح!');
            }
            resetArticleForm();
        } catch (e: any) {
            alert("فشل الحفظ: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Login Credentials Logic ---
    const handleChangeCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setCredentialsMessage(null);

        const currentEmail = (StorageService.getCurrentUser()?.email || '').toLowerCase();

        if (!accountCurrentPassword) {
            setCredentialsMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية' });
            return;
        }

        const trimmedEmail = accountNewEmail.trim().toLowerCase();
        const emailChanged = trimmedEmail !== '' && trimmedEmail !== currentEmail;
        const passwordEntered = accountNewPassword.length > 0;

        if (!emailChanged && !passwordEntered) {
            setCredentialsMessage({ type: 'error', text: 'لم تغيّر شيئاً' });
            return;
        }

        if (emailChanged && !/.+@.+\..+/.test(trimmedEmail)) {
            setCredentialsMessage({ type: 'error', text: 'البريد الإلكتروني الجديد غير صالح' });
            return;
        }

        if (passwordEntered) {
            if (accountNewPassword.length < 8) {
                setCredentialsMessage({ type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' });
                return;
            }
            if (accountNewPassword !== accountConfirmPassword) {
                setCredentialsMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
                return;
            }
        }

        setIsChangingCredentials(true);
        try {
            const result = await StorageService.changeCredentials(
                accountCurrentPassword,
                emailChanged ? trimmedEmail : undefined,
                passwordEntered ? accountNewPassword : undefined
            );
            setCredentialsMessage({ type: 'success', text: 'تم تحديث بيانات الدخول بنجاح' });
            setAccountCurrentPassword('');
            setAccountNewPassword('');
            setAccountConfirmPassword('');
            setAccountNewEmail(result.email);
        } catch (error: any) {
            const text =
                error.message === 'wrong_password' ? 'كلمة المرور الحالية غير صحيحة' :
                error.message === 'email_taken' ? 'هذا البريد مستخدم مسبقاً' :
                'حدث خطأ أثناء تحديث البيانات. حاول مرة أخرى.';
            setCredentialsMessage({ type: 'error', text });
        } finally {
            setIsChangingCredentials(false);
        }
    };

    // --- Backup & Restore Logic ---
    const handleExportBackup = () => {
        const backupData = {
            testimonials,
            videos: videos.filter(v => v.url), // Filter out invalid
            careerMoments,
            articles,
            gallery,
            heroImage,
            timestamp: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `gamil_site_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm("تحذير: استعادة النسخة الاحتياطية ستقوم بدمج البيانات القديمة مع البيانات الحالية ورفعها لقاعدة البيانات. هل أنت متأكد؟")) {
            return;
        }

        setIsRestoring(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Merge by id — the backup wins on conflicts. Without dedup,
                // restoring a recent export doubled every item in the UI.
                const mergeById = <T extends { id: string | number }>(backup: T[], current: T[]): T[] => {
                    const seen = new Set(backup.map(i => String(i.id)));
                    return [...backup, ...current.filter(i => !seen.has(String(i.id)))];
                };

                if (json.testimonials && Array.isArray(json.testimonials)) {
                    await onUpdateTestimonials(mergeById(json.testimonials, testimonials));
                }
                if (json.videos && Array.isArray(json.videos)) {
                    await onUpdateVideos(mergeById(json.videos, videos));
                }
                if (json.careerMoments && Array.isArray(json.careerMoments)) {
                    await onUpdateCareerMoments(mergeById(json.careerMoments, careerMoments));
                }
                if (json.articles && Array.isArray(json.articles)) {
                    await onUpdateArticles(mergeById(json.articles, articles));
                }
                if (json.gallery && Array.isArray(json.gallery)) {
                    await onUpdateGallery(mergeById(json.gallery, gallery));
                }
                if (json.heroImage) {
                    await onUpdateHeroImage(json.heroImage);
                }

                alert("تم استعادة البيانات ورفعها للسيرفر بنجاح!");
            } catch (error) {
                console.error("Backup Restore Error", error);
                alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية. تأكد من الملف.");
            } finally {
                setIsRestoring(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-slate-900 text-white p-4 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="text-gold-500" />
                    <div>
                        <h1 className="font-heading font-bold text-xl">لوحة التحكم</h1>
                        <span className="text-green-400 flex items-center gap-1 text-[10px]"><Cloud size={10} /> Online Only Mode</span>
                    </div>
                </div>

                {/* DB Status Indicator */}
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                    {dbStatus.status === 'checking' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                    {dbStatus.status === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {dbStatus.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    
                    <span className={`text-xs font-bold ${
                        dbStatus.status === 'error' ? 'text-red-400' : 
                        dbStatus.status === 'ok' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                        {dbStatus.status === 'checking' ? 'فحص السيرفر...' : dbStatus.message || 'حالة الاتصال'}
                    </span>

                    {dbStatus.status === 'error' && (
                         <button onClick={checkDbConnection} className="mr-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
                             إعادة المحاولة
                         </button>
                    )}
                </div>

                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    خروج
                </button>
            </div>

            {isSaving && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3 shadow-2xl">
                        <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                        <p className="font-bold text-slate-800">جاري الحفظ في السيرفر...</p>
                        <p className="text-xs text-slate-500">لا تغلق الصفحة حتى تنتهي العملية</p>
                    </div>
                </div>
            )}

            <div className="container mx-auto p-4 md:p-6">
                
                {/* Error Banner */}
                {dbStatus.status === 'error' && (
                    <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg mb-6 flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-red-800">تنبيه هام جداً: قاعدة البيانات لا تقبل الكتابة!</h3>
                            <p className="text-red-700 text-sm mt-1">{dbStatus.message}</p>
                            <p className="text-red-600 text-xs mt-2">
                                الخادم أو قاعدة البيانات غير متاحة حالياً — أعد المحاولة بعد قليل، وإن استمرت المشكلة تحقق من حالة الخادم.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm max-w-5xl overflow-x-auto">
                    <button onClick={() => handleTabClick('testimonials')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'testimonials' ? 'bg-slate-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><Quote size={20} /> الآراء والصور</button>
                    <button onClick={() => handleTabClick('videos')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'videos' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><VideoIcon size={20} /> الفيديوهات</button>
                    <button onClick={() => handleTabClick('about')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'about' ? 'bg-gold-500 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><UserCheck size={20} /> صور السيرة</button>
                    <button onClick={() => handleTabClick('gallery')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'gallery' ? 'bg-amber-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><Images size={20} /> المعرض</button>
                    <button onClick={() => handleTabClick('articles')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'articles' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><Newspaper size={20} /> المقالات</button>
                    <button onClick={() => handleTabClick('settings')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><Settings size={20} /> النسخ الاحتياطي</button>
                    <button onClick={() => handleTabClick('account')} className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all min-w-[140px] ${activeTab === 'account' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}><KeyRound size={20} /> حساب الدخول</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Input Form Area */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
                            <h2 className="text-xl font-bold mb-6 border-b pb-2 flex items-center gap-2">
                                {activeTab === 'gallery' ? <UploadCloud size={20} className="text-amber-500" /> : activeTab === 'account' ? <KeyRound size={20} className="text-emerald-600" /> : <Plus size={20} className={activeTab === 'videos' ? 'text-red-500' : activeTab === 'about' ? 'text-gold-500' : activeTab === 'articles' ? 'text-purple-500' : activeTab === 'settings' ? 'text-slate-500' : 'text-gold-500'} />}

                                {activeTab === 'testimonials' ? 'إضافة محتوى جديد' :
                                    activeTab === 'videos' ? 'إضافة فيديو جديد' :
                                    activeTab === 'about' ? 'إضافة صورة للسيرة' :
                                    activeTab === 'gallery' ? 'رفع صور متعددة' :
                                    activeTab === 'settings' ? 'إدارة البيانات' :
                                    activeTab === 'account' ? 'تغيير بيانات الدخول' :
                                    editingArticleId ? 'تعديل المقال' : 'إضافة مقال جديد'}
                            </h2>

                            {activeTab === 'settings' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                        <div className="flex items-start gap-2">
                                            <Database className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p>يمكنك هنا تحميل نسخة احتياطية من بيانات الموقع الحالية، أو استعادة بيانات قديمة (مثلاً من التخزين المحلي السابق) ليتم رفعها للسيرفر.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <h3 className="font-bold flex items-center gap-2 mb-2 text-slate-800">
                                                <Download size={18} className="text-green-600" />
                                                تصدير البيانات (Backup)
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-3">تحميل ملف JSON يحتوي على جميع المقالات والصور والفيديوهات.</p>
                                            <button 
                                                onClick={handleExportBackup}
                                                className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800"
                                            >
                                                تحميل النسخة الاحتياطية
                                            </button>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <h3 className="font-bold flex items-center gap-2 mb-2 text-slate-800">
                                                <Upload size={18} className="text-blue-600" />
                                                استيراد ورفع للسيرفر (Restore)
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-3">رفع ملف JSON سابق لإضافته إلى قاعدة البيانات الحالية.</p>
                                            <label className="block w-full cursor-pointer">
                                                <div className={`w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 text-center flex items-center justify-center gap-2 ${isRestoring ? 'opacity-70 cursor-wait' : ''}`}>
                                                    {isRestoring ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    {isRestoring ? 'جاري الرفع...' : 'اختر ملف النسخة الاحتياطية'}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept=".json" 
                                                    onChange={handleRestoreBackup} 
                                                    className="hidden" 
                                                    disabled={isRestoring}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <form onSubmit={handleChangeCredentials} className="space-y-4">
                                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                        <p className="text-xs font-bold text-emerald-800 mb-1">البريد الإلكتروني الحالي</p>
                                        <p className="text-sm font-mono text-emerald-900 bg-white/70 border border-emerald-100 rounded px-2 py-1 text-left" dir="ltr">
                                            {StorageService.getCurrentUser()?.email || 'غير معروف'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الحالية</label>
                                        <input
                                            type="password"
                                            placeholder="أدخل كلمة المرور الحالية"
                                            value={accountCurrentPassword}
                                            onChange={(e) => setAccountCurrentPassword(e.target.value)}
                                            className="w-full border p-3 rounded-lg"
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني الجديد (اختياري)</label>
                                        <input
                                            type="email"
                                            placeholder="new@email.com"
                                            value={accountNewEmail}
                                            onChange={(e) => setAccountNewEmail(e.target.value)}
                                            className="w-full border p-3 rounded-lg text-left"
                                            dir="ltr"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة (اختياري)</label>
                                        <input
                                            type="password"
                                            placeholder="8 أحرف على الأقل"
                                            value={accountNewPassword}
                                            onChange={(e) => setAccountNewPassword(e.target.value)}
                                            className="w-full border p-3 rounded-lg"
                                            autoComplete="new-password"
                                            minLength={8}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            placeholder="أعد كتابة كلمة المرور الجديدة"
                                            value={accountConfirmPassword}
                                            onChange={(e) => setAccountConfirmPassword(e.target.value)}
                                            className="w-full border p-3 rounded-lg"
                                            autoComplete="new-password"
                                            required={accountNewPassword.length > 0}
                                        />
                                    </div>

                                    {credentialsMessage && (
                                        <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 border ${credentialsMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {credentialsMessage.type === 'success' ? <CheckCircle2 size={16} className="flex-shrink-0" /> : <XCircle size={16} className="flex-shrink-0" />}
                                            {credentialsMessage.text}
                                        </div>
                                    )}

                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>بعد تغيير بيانات الدخول ستبقى مسجلاً هنا في هذه الجلسة، لكن يجب استخدام البيانات الجديدة عند تسجيل الدخول في المرة القادمة.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isChangingCredentials}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {isChangingCredentials ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                                        {isChangingCredentials ? 'جاري التحديث...' : 'تحديث بيانات الدخول'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'about' && (
                                <>
                                    {/* Hero Image Section */}
                                    <div className="mb-8 border-b border-gray-200 pb-8">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gold-600">
                                            <User size={20} />
                                            الصورة الشخصية الرئيسية
                                        </h3>
                                        <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setTempHeroImage)} className="hidden" id="hero-upload"/>
                                            <label htmlFor="hero-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                {tempHeroImage ? <img src={tempHeroImage} alt="Hero Preview" className="h-40 w-32 object-cover rounded shadow border-2 border-white" /> : <><ImageIcon className="w-12 h-12 text-gray-400" /><span className="text-sm text-gray-500">اضغط لتغيير صورة البروفايل الرئيسية</span></>}
                                            </label>
                                        </div>
                                        {tempHeroImage !== heroImage && (
                                            <button onClick={handleSaveHeroImage} className="mt-3 w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                                                حفظ الصورة الرئيسية
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleAddCareerMoment} className="space-y-4">
                                        <h3 className="font-bold text-md mb-2 text-gray-700">إضافة صورة للسلايدر (السيرة)</h3>
                                        <div className="border-2 border-dashed border-gold-300 bg-gold-50 rounded-lg p-6 text-center hover:border-gold-500 transition-colors">
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMomentImage)} className="hidden" id="moment-upload"/>
                                            <label htmlFor="moment-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                {momentImage ? <img src={momentImage} alt="Preview" className="max-h-40 rounded shadow" /> : <><ImageIcon className="w-12 h-12 text-gold-400" /><span className="text-sm text-gray-500">اضغط لرفع صورة</span></>}
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف (التعليق)</label>
                                            <input 
                                                type="text" 
                                                placeholder="مثال: تغطية ميدانية في الجوف" 
                                                value={momentLabel} 
                                                onChange={(e) => setMomentLabel(e.target.value)} 
                                                className="w-full border p-3 rounded-lg" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف / العام</label>
                                            <input 
                                                type="text" 
                                                placeholder="مثال: 2020 أو 'ميداني'" 
                                                value={momentYear} 
                                                onChange={(e) => setMomentYear(e.target.value)} 
                                                className="w-full border p-3 rounded-lg" 
                                                required 
                                            />
                                        </div>
                                        <button type="submit" disabled={!momentImage} className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-gold-500/20 disabled:opacity-50">
                                            إضافة إلى السلايدر
                                        </button>
                                    </form>
                                </>
                            )}

                            {activeTab === 'gallery' && (
                                <div className="space-y-4">
                                    <div className={`border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg p-8 text-center hover:border-amber-500 transition-colors relative`}>
                                        {isUploadingGallery ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
                                                <p className="text-sm font-bold text-amber-700">جاري ضغط ورفع الصور...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    multiple 
                                                    onChange={handleBulkImageUpload} 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                                />
                                                <div className="flex flex-col items-center gap-3">
                                                    <UploadCloud className="w-16 h-16 text-amber-400" />
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-slate-700">اضغط لرفع صور متعددة</p>
                                                        <p className="text-xs text-gray-500">يمكنك تحديد أكثر من صورة دفعة واحدة</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
                                        ملاحظة: سيتم ضغط الصور تلقائياً لتسريع التصفح وتوفير المساحة.
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'testimonials' && (
                                <form onSubmit={handleAddTestimonial} className="space-y-4">
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                                        <button type="button" onClick={() => setNewItemType('image')} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${newItemType === 'image' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><ImageIcon size={16} /> صورة</button>
                                        <button type="button" onClick={() => setNewItemType('text')} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${newItemType === 'text' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Type size={16} /> نص</button>
                                        <button type="button" onClick={() => setNewItemType('mixed')} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${newItemType === 'mixed' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Sparkles size={16} /> ذكي</button>
                                    </div>

                                    {(newItemType === 'image' || newItemType === 'mixed') && (
                                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors bg-gray-50 relative ${newItemType === 'mixed' ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-blue-500'}`}>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewImage, true)} className="hidden" id="image-upload"/>
                                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                {newImage ? <img src={newImage} alt="Preview" className="max-h-40 rounded shadow" /> : <><ImageIcon className={`w-12 h-12 ${newItemType === 'mixed' ? 'text-purple-300' : 'text-gray-300'}`} /><span className="text-sm text-gray-500">{newItemType === 'mixed' ? 'ارفع صورة لتحليلها' : 'اضغط لرفع صورة'}</span></>}
                                            </label>
                                            {isAnalyzing && <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg"><Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-2" /><span className="text-sm font-bold text-slate-700">جاري التحليل والضغط...</span></div>}
                                        </div>
                                    )}

                                    {(newItemType === 'text' || newItemType === 'mixed') && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div><label className="text-xs font-bold text-gray-500 mb-1 block">نص الاقتباس / التعليق</label><textarea placeholder="نص الاقتباس..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full border p-3 rounded-lg h-32" required /></div>
                                            <div><label className="text-xs font-bold text-gray-500 mb-1 block">القائل / المصدر</label><input type="text" placeholder="مثال: صحيفة الثورة / د. فلان" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} className="w-full border p-3 rounded-lg" required /></div>
                                            <div><label className="text-xs font-bold text-gray-500 mb-1 block">الوصف / الصفة</label><input type="text" placeholder="مثال: مقال صحفي" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full border p-3 rounded-lg" /></div>
                                        </div>
                                    )}

                                    <button type="submit" disabled={(newItemType !== 'text' && !newImage) || (newItemType !== 'image' && !newContent)} className={`w-full font-bold py-3 rounded-lg transition-colors text-white ${newItemType === 'mixed' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-900 hover:bg-slate-800'}`}>{newItemType === 'mixed' ? 'نشر الاقتباس والصورة' : 'نشر'}</button>
                                </form>
                            )}

                            {activeTab === 'videos' && (
                                <form onSubmit={handleAddVideo} className="space-y-4">
                                    <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                                        <button type="button" onClick={() => setVideoMode('manual')} className={`flex-1 py-2 text-sm font-bold rounded-md ${videoMode === 'manual' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>يدوي</button>
                                        <button type="button" onClick={() => setVideoMode('channel')} className={`flex-1 py-2 text-sm font-bold rounded-md ${videoMode === 'channel' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>تلقائي (قناة)</button>
                                    </div>

                                    {videoMode === 'channel' ? (
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                            <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                                                <Youtube size={20} />
                                                <h3>ربط القناة تلقائياً</h3>
                                            </div>
                                            <p className="text-xs text-red-600 mb-4">سيقوم الموقع بجلب آخر 10 فيديوهات من قناتك تلقائياً دون الحاجة للإضافة اليدوية.</p>
                                            
                                            <label className="block text-sm font-bold text-gray-700 mb-2">معرف القناة (Channel ID)</label>
                                            <input 
                                                type="text" 
                                                placeholder="مثال: UC6w3x_g5oIPabiTR4BOsGXw" 
                                                value={channelId} 
                                                onChange={(e) => setChannelId(e.target.value)} 
                                                className="w-full border p-3 rounded-lg text-left dir-ltr mb-3 font-mono text-sm" 
                                            />
                                            <button type="button" onClick={handleSaveChannelId} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                                                <RefreshCw size={18} />
                                                حفظ وربط
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">رابط الفيديو (YouTube URL)</label>
                                                <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full border p-3 rounded-lg dir-ltr text-left" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الفيديو</label>
                                                <input type="text" placeholder="عنوان الفيديو" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full border p-3 rounded-lg" required />
                                            </div>
                                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">إضافة الفيديو</button>
                                        </div>
                                    )}
                                </form>
                            )}

                            {activeTab === 'articles' && (
                                <>
                                    {/* Smart Import Section */}
                                    <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <h3 className="text-purple-800 font-bold text-sm mb-3 flex items-center gap-2">
                                            <Link2 size={16} />
                                            استيراد ذكي من الموقع
                                        </h3>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="رابط المقال أو عنوانه..." 
                                                value={importUrl}
                                                onChange={(e) => setImportUrl(e.target.value)}
                                                className="flex-1 border p-2 rounded-lg text-sm bg-white"
                                            />
                                            <button 
                                                onClick={handleImportFromUrl}
                                                disabled={isImporting || !importUrl}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                                            >
                                                {isImporting ? <Loader2 size={14} className="animate-spin" /> : 'جلب'}
                                            </button>
                                        </div>
                                        <p className="text-purple-600 text-[10px] mt-2 opacity-80">
                                            * الصق رابطاً وسنقوم بجلب المحتوى (أو توليده بالذكاء الاصطناعي بناءً على العنوان) وإعادة صياغته ليكون مطولاً.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmitArticle} className="space-y-4">
                                        <div className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg p-6 text-center hover:border-purple-500 transition-colors relative">
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setArticleImage)} className="hidden" id="article-upload"/>
                                            <label htmlFor="article-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                {articleImage ? <img src={articleImage} alt="Preview" className="max-h-40 rounded shadow" /> : <><ImageIcon className="w-12 h-12 text-purple-400" /><span className="text-sm text-gray-500">اضغط لرفع صورة المقال</span></>}
                                            </label>
                                            {editingArticleId && (
                                                <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">وضع التعديل</div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المقال</label>
                                            <input 
                                                type="text" 
                                                placeholder="عنوان المقال..." 
                                                value={articleTitle} 
                                                onChange={(e) => setArticleTitle(e.target.value)} 
                                                className="w-full border p-3 rounded-lg" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                                            <input 
                                                type="text" 
                                                placeholder="مثال: سياسة، وطن" 
                                                value={articleCategory} 
                                                onChange={(e) => setArticleCategory(e.target.value)} 
                                                className="w-full border p-3 rounded-lg" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">ملخص قصير</label>
                                            <textarea 
                                                placeholder="ملخص يظهر في البطاقة..." 
                                                value={articleExcerpt} 
                                                onChange={(e) => setArticleExcerpt(e.target.value)} 
                                                className="w-full border p-3 rounded-lg h-24" 
                                                required 
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-bold text-gray-700">محتوى المقال</label>
                                                <button 
                                                    type="button" 
                                                    onClick={handleExpandArticle}
                                                    disabled={isExpanding}
                                                    className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-colors border border-purple-200"
                                                >
                                                    {isExpanding ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                    {isExpanding ? 'جاري الكتابة...' : 'إعادة صياغة وتوسيع'}
                                                </button>
                                            </div>
                                            <textarea 
                                                placeholder="اكتب المحتوى هنا..." 
                                                value={articleContent} 
                                                onChange={(e) => setArticleContent(e.target.value)} 
                                                className="w-full border p-3 rounded-lg h-64 font-sans leading-relaxed text-lg" 
                                                required 
                                            />
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {editingArticleId && (
                                                <button type="button" onClick={resetArticleForm} className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg">
                                                    إلغاء
                                                </button>
                                            )}
                                            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-500/20">
                                                {editingArticleId ? 'حفظ التعديلات' : 'نشر المقال'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2">
                        {/* ... Gallery List ... */}
                        {activeTab === 'gallery' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">مكتبة الصور ({gallery.length})</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {gallery.map((img) => (
                                        <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-100">
                                            <img src={img.src} alt="Gallery Item" className="w-full h-full object-cover" loading="lazy" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                <button 
                                                    onClick={() => handleDeleteGalleryImage(img.id)} 
                                                    className="bg-red-500 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 size={14} /> حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {gallery.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                        المعرض فارغ
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ... Testimonials List ... */}
                        {activeTab === 'testimonials' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">المحتوى المنشور ({testimonials.length})</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {testimonials.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex gap-4 group">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.src ? <img src={item.src} alt="Item" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Type /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.type === 'mixed' ? 'bg-purple-100 text-purple-600' : 'text-gray-500 bg-gray-100'}`}>{item.type === 'image' ? 'صورة' : item.type === 'mixed' ? 'مختلط' : 'نص'}</span>
                                                    <button onClick={() => handleDeleteTestimonial(item.id)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-700 line-clamp-2">{(item.type === 'text' || item.type === 'mixed') ? item.content : 'صورة مرفقة فقط'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ... Videos List ... */}
                        {activeTab === 'videos' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">الفيديوهات المنشورة</h2>
                                    {channelId && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <RefreshCw size={10} /> جلب تلقائي مفعل
                                        </span>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {videos.map((video) => (
                                        <div key={video.id} className="bg-white p-3 rounded-xl shadow border border-gray-100 flex gap-4 group hover:border-red-200 transition-colors">
                                            <div className="w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-2 mb-1">{video.title}</h4>
                                                {!channelId && (
                                                    <div className="mt-auto flex justify-end">
                                                        <button onClick={() => handleDeleteVideo(video.id)} className="flex items-center gap-1 text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"><Trash2 size={12} /> حذف</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ... About List ... */}
                        {activeTab === 'about' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">صور السيرة الذاتية ({careerMoments.length})</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {careerMoments.map((moment) => (
                                        <div key={moment.id} className="bg-white p-3 rounded-xl shadow border border-gray-100 flex gap-4 group hover:border-gold-300 transition-colors">
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={moment.src} alt={moment.label} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gold-100 text-gold-800">{moment.year}</span>
                                                    <button onClick={() => handleDeleteMoment(moment.id)} className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                                                </div>
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-2 mt-2">{moment.label}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'articles' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold mb-4">المقالات المنشورة ({articles.length})</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {articles.map((article) => (
                                        <div key={article.id} className={`bg-white p-3 rounded-xl shadow border flex gap-4 group transition-all cursor-pointer ${editingArticleId === article.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-100 hover:border-purple-300'}`} onClick={() => handleEditArticle(article)}>
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{article.category}</span>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditArticle(article); }} 
                                                            className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded hover:bg-blue-100"
                                                            title="تعديل المقال"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }} 
                                                            className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded hover:bg-red-100"
                                                            title="حذف المقال"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-sm text-slate-800 line-clamp-2 mt-2">{article.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'settings' && (
                             <div className="text-center py-20 text-gray-400">
                                استخدم الخيارات في القائمة الجانبية لإدارة البيانات.
                             </div>
                        )}

                        {activeTab === 'account' && (
                             <div className="text-center py-20 text-gray-400">
                                استخدم النموذج في القائمة الجانبية لتغيير البريد الإلكتروني أو كلمة المرور الخاصة بالدخول.
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
