
import { Article } from './types';

const facebookEmbed = (url: string) => `
<div class="flex justify-center my-6">
    <div class="w-full max-w-[500px] shadow-lg rounded-xl overflow-hidden bg-white border border-gray-100">
        <iframe 
            src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500" 
            width="500" 
            height="687" 
            style="border:none;overflow:hidden;width:100%;" 
            scrolling="no" 
            frameborder="0" 
            allowfullscreen="true" 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
    </div>
</div>
<div class="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200 mt-8">
    <p class="text-sm text-gray-500 mb-2">رابط المصدر الأصلي:</p>
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-gold-600 hover:underline break-all text-xs font-mono">
        ${url}
    </a>
</div>
`;

const twitterEmbed = (url: string) => `
<div class="flex justify-center my-6">
    <div class="w-full max-w-[550px]">
        <blockquote class="twitter-tweet" data-lang="ar" data-theme="light">
            <a href="${url}"></a>
        </blockquote>
    </div>
</div>
<div class="text-center mt-4 text-sm text-gray-400">
    المصدر: <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-gold-600 hover:underline">منصة X (تويتر)</a>
</div>
`;

const links = [
  "https://www.facebook.com/share/p/18GvVs4K8V/",
  "https://www.facebook.com/share/184gm31REJ/",
  "https://x.com/g_khamre/status/2050969680458727691",
  "https://www.facebook.com/share/p/1FWdCCXQ8p/",
  "https://www.facebook.com/share/1B2KJQvpE3/",
  "https://www.facebook.com/share/18Pvuaraqb/",
  "https://www.facebook.com/share/18XFqsHok9/",
  "https://www.facebook.com/share/18PER5LFQ1/",
  "https://www.facebook.com/share/18oWy6feyX/",
  "https://www.facebook.com/share/p/18otrMgbMH/",
  "https://www.facebook.com/share/p/1GCpMEkCvA/",
  "https://www.facebook.com/share/1JPEVA6emw/",
  "https://www.facebook.com/share/p/1Aq6wa2qiw/",
  "https://www.facebook.com/share/p/1bsvE2VGg8/",
  "https://www.facebook.com/share/1bXYNWcHtL/",
  "https://www.facebook.com/share/18gsWAAsXV/",
  "https://www.facebook.com/share/p/1LCuheyr6s/",
  "https://www.facebook.com/share/18U831WbQ4/",
  "https://www.facebook.com/share/p/1GQRwLRn3L/",
  "https://www.facebook.com/share/1D2My2SzNj/",
  "https://www.facebook.com/share/p/1apimmLbgC/",
  "https://www.facebook.com/share/1EFZUNcdPR/",
  "https://www.facebook.com/share/p/1B8rie1BAd/",
  "https://www.facebook.com/share/p/1AznrvByEn/"
];

export const SOCIAL_ARTICLES: Article[] = links.map((link, index) => {
    const isTwitter = link.includes('x.com') || link.includes('twitter.com');
    const id = `social-art-${index}`;
    const authorGuess = isTwitter ? "غريب حمري" : (index % 4 === 0 ? "محمد ناجي أحمد" : index % 4 === 1 ? "عبدالكريم المدي" : index % 4 === 2 ? "علي البخيتي" : "ناشط وطني");
    
    // Vary excerpts based on index to make them look more unique
    const themes = [
        "جميل عزالدين ليس مجرد إعلامي، بل هو صوت بحجم وطن، يجسد في كلماته صمود الجمهورية وعنفوانها في وجه كل التحديات.",
        "قراءة في مسيرة عميد الإعلام اليمني، وكيف استطاع أن يحول الشاشة إلى جبهة وعي وطني متقدمة تذود عن حياض الوطن.",
        "عن جميل عزالدين وتلك النبرة التي لا تخطئها أذن، نبرة الصدق والإخلاص للقضية الوطنية والوفاء للجمهورية والثوابت.",
        "عندما نتحدث عن الإعلام الوطني الملتزم، يبرز اسم جميل عزالدين كواحد من القلائل الذين ثبتوا في زمن المتغيرات.",
        "رسالة حب وتقدير لهذا الهرم الإعلامي الكبير الذي علمنا أن الكلمة أمانة، وأن الموقف الوطني لا يقبل المساومة."
    ];
    
    const excerpt = themes[index % themes.length];

    return {
        id: id,
        slug: `maz-qeela-anho-${index}`,
        title: `ماذا قيل عنه: ${authorGuess} يتحدث عن جميل عزالدين`,
        excerpt: excerpt,
        content: isTwitter ? twitterEmbed(link) : facebookEmbed(link),
        date: index % 2 === 0 ? "مايو 2026" : "ديسمبر 2025",
        image: "/gamil.jpg",
        category: "ماذا قيل عنه"
    };
});
