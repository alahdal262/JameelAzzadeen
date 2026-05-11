
import { GoogleGenAI, Type } from "@google/genai";

// Fallback content if API key is missing
export const FALLBACK_BIO = `قامة إعلامية يمنية شامخة، وصوت وطني بليغ رَسَخَ مكانته كأحد أبرز الإعلاميين في اليمن. تميز بفصاحته المتقدة وقدرته الفريدة على استنطاق الحقائق، مدافعًا عن قضايا وطنه وشعبه بكل شجاعة واقتدار. مسيرته المهنية محفورة كنموذج ملهم للعطاء والتفاني في خدمة الإعلام الهادف، تاركًا بصمة خالدة في الوعي الوطني.`;

export const getBio = async (): Promise<string> => {
  try {
    // Fixed: Initializing GoogleGenAI with process.env.API_KEY directly and using gemini-3-flash-preview
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اكتب سيرة ذاتية احترافية وملهمة (حوالي 60 كلمة) للاعلامي اليمني الشهير "جميل عزالدين". ركز على دوره الوطني، بلاغته، ومنصبه كإعلامي بارز في اليمن. النص يجب أن يكون باللغة العربية الفصحى القوية.
      شرط مهم: لا تبدأ النص بذكر اسمه "جميل عزالدين"، بل ابدأ بالوصف مباشرة (مثلاً: قامة إعلامية، صوت وطني... إلخ).`,
    });
    return response.text || FALLBACK_BIO;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_BIO;
  }
};

export const getLatestTweets = async (): Promise<string[]> => {
  const fallbackTweets = [
    "الجمهورية هي الحصن الحصين لكل اليمنيين، والدفاع عنها واجب مقدس لا يقبل المساومة.",
    "نحن هنا، وسنظل هنا، أصواتاً تصدح بالحق حتى يعود الوطن معافى.",
    "لا نامت أعين الجبناء، ولا عاش من خان الوطن. تحيا اليمن جمهورية موحدة.",
    "سبتمبر هو الميلاد الحقيقي لليمن الجديد، ولن تعود عجلة التاريخ للوراء.",
    "الإعلام الوطني هو الجبهة التي لا تقل أهمية عن المعركة العسكرية."
  ];

  try {
    // Fixed: Initializing GoogleGenAI with process.env.API_KEY directly and using gemini-3-flash-preview
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `تخيل أنك الاعلامي جميل عزالدين. اكتب 5 تغريدات قصيرة (كل واحدة لا تتجاوز 200 حرف) تتحدث عن حب الوطن، الصمود، والجمهورية، بأسلوب "الحكمة البليغة" وكأنها أقوال مأثورة.
      أرجع النتيجة بصيغة JSON Array of strings فقط.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
             type: Type.ARRAY,
             items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if(!text) return fallbackTweets;
    return JSON.parse(text);
  } catch (error) {
    console.error("Tweets fetch error", error);
    return fallbackTweets;
  }
};

// Deprecated single tweet function, keeping for compatibility if used elsewhere, pointing to new logic
export const getLatestTweetContent = async (): Promise<string> => {
   const tweets = await getLatestTweets();
   return tweets[0];
}

export const analyzeImageForTestimonial = async (base64Image: string): Promise<{content: string, author: string, role: string}> => {
  try {
    // Fixed: Initializing GoogleGenAI with process.env.API_KEY directly and using gemini-3-flash-preview
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png, API is flexible
              data: cleanBase64
            }
          },
          {
            text: "قم بتحليل هذه الصورة. استخرج النص الموجود فيها كاملاً (الاقتباس). استخرج اسم الشخص الذي كتب النص أو صاحب الاقتباس (المؤلف). استخرج صفته أو منصبه إن وجد. أعد النتيجة بتنسيق JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING, description: "The full text/quote found in the image" },
            author: { type: Type.STRING, description: "The name of the person who said/wrote it" },
            role: { type: Type.STRING, description: "The job title or role of the person" },
          },
          required: ["content", "author"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Image analysis failed:", error);
    return {
      content: "",
      author: "",
      role: ""
    };
  }
};

export const expandArticleContent = async (title: string, brief: string): Promise<string> => {
  try {
    // Fixed: Initializing GoogleGenAI with process.env.API_KEY directly and using gemini-3-pro-preview for advanced text generation
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `
      أنت الكاتب الصحفي والإعلامي اليمني الكبير "جميل عزالدين".
      مطلوب منك كتابة مقال سياسي/وطني موجز ومركز (لا يزيد عن 200 كلمة) بناءً على العنوان والأفكار التالية.
      
      العنوان: ${title}
      المدخلات: ${brief}

      الشروط الصارمة:
      1. الطول: المقال يجب أن يكون موجزاً ومركزاً (حد أقصى 200 كلمة).
      2. الأسلوب: استخدم لغة عربية فصحى قوية، حماسية، وبلاغية (نفس أسلوبك المعروف في التلفزيون).
      3. المحتوى: ركز على حب الوطن، الجمهورية، الجيش الوطني، نبذ الكهنوت، والوحدة الوطنية.
      4. التنسيق: استخدم وسوم HTML لتنسيق المقال. استخدم <h3> للعناوين الفرعية، و <p> للفقرات.
      5. لا تكتب مقدمات مثل "إليك المقال"، ادخل في الموضوع فوراً.
      6. قسم المقال إلى فقرتين أو ثلاث فقرات كحد أقصى.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Article expansion failed:", error);
    throw error;
  }
};
