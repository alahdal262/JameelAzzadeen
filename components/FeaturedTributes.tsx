import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
    Facebook,
    Twitter,
    MessageCircle,
    PenLine,
    Clock,
    Eye,
    BadgeCheck,
    CornerDownLeft,
    ChevronDown,
    ChevronUp,
    Quote,
} from 'lucide-react';
import { TRIBUTES, Tribute, TributeOrigin } from '../data/tributes';

// -----------------------------------------------------------------------------
// شهادات مختارة — "لوح الشهادات"
// -----------------------------------------------------------------------------
// كل شهادة تحتفظ بملامح المنصة التي وردت منها (منشور، رسالة، تعليق، تغريدة)،
// لكنها تجلس داخل إطار واحد مشترك: نفس الحواف، نفس الخيط الذهبي، نفس شارة
// المصدر. الاختلاف في المحتوى لا في الإطار.
//
// ملاحظات تنفيذية مهمة:
// • RTL: ترتيب DOM هو ما يحدد الترتيب البصري داخل الشبكة — أول عنصر يظهر يميناً.
// • أصناف Tailwind تُكتب كاملة في كلا فرعي الشرط، لأن الـ play CDN لا يرى
//   الأصناف المُركّبة من أجزاء نصية.
// • البطاقات لا تتمدد (lg:self-start): بدون ذلك يفرض أطول عمود ارتفاعه على
//   جاره، فتُقصّ الصورة ويظهر فراغ ميت أسفل البطاقة القصيرة عند التوسيع.
// -----------------------------------------------------------------------------

/** لون المنصة — يظهر في شارة المصدر وفي تدرّج خفيف بزاوية البطاقة. */
const ACCENT: Record<TributeOrigin, string> = {
    facebook: '#1877F2',
    comment: '#1877F2',
    twitter: '#1DA1F2',
    messenger: '#0084FF',
    letter: '#d97706',
};

const CARD_SHELL =
    'relative overflow-hidden rounded-3xl border border-white/10 hover:border-gold-500/40 transition-colors duration-500 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]';

/** خلفية البطاقة: عمق داكن مع لمسة من لون المنصة في الزاوية. */
const shell = (origin: TributeOrigin): React.CSSProperties => ({
    background: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 55%, ${ACCENT[origin]}24 100%)`,
});

const OriginIcon: React.FC<{ origin: TributeOrigin; size?: number }> = ({ origin, size = 11 }) => {
    if (origin === 'twitter') return <Twitter size={size} aria-hidden="true" />;
    if (origin === 'messenger') return <MessageCircle size={size} aria-hidden="true" />;
    if (origin === 'letter') return <PenLine size={size} aria-hidden="true" />;
    if (origin === 'comment') return <CornerDownLeft size={size} className="transform -scale-x-100" aria-hidden="true" />;
    return <Facebook size={size} aria-hidden="true" />;
};

/** شارة المصدر أعلى يمين البطاقة — الزاوية الأولى في القراءة العربية. */
const SourceChip: React.FC<{ tribute: Tribute }> = ({ tribute }) => (
    <div
        className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-bold text-white shadow-lg"
        style={{ backgroundColor: `${ACCENT[tribute.origin]}40`, borderColor: `${ACCENT[tribute.origin]}88` }}
    >
        <OriginIcon origin={tribute.origin} />
        <span>{tribute.originLabel}</span>
    </div>
);

/** الخيط الذهبي أعلى كل بطاقة — العنصر المشترك الذي يجمع الأشكال المختلفة. */
const TopRule: React.FC = () => (
    <div
        className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent pointer-events-none"
        aria-hidden="true"
    />
);

const Byline: React.FC<{ tribute: Tribute; large?: boolean }> = ({ tribute, large }) => (
    <div className="flex items-center gap-3">
        <div
            aria-hidden="true"
            className="w-11 h-11 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center font-bold text-slate-900 flex-shrink-0 shadow-lg"
        >
            {tribute.author[0]}
        </div>
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
                <h4
                    id={`tribute-${tribute.id}-name`}
                    className={
                        large
                            ? 'font-heading font-black text-white text-lg md:text-xl leading-tight'
                            : 'font-bold text-white text-sm leading-tight'
                    }
                >
                    {tribute.author}
                </h4>
                {tribute.verified && (
                    <BadgeCheck size={15} className="text-gold-400 flex-shrink-0" aria-label="حساب موثّق" />
                )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
                {tribute.handle && (
                    <span className="text-xs text-white/50 font-mono" dir="ltr">
                        {tribute.handle}
                    </span>
                )}
                {tribute.role && <p className="text-xs text-gold-400/70">{tribute.role}</p>}
            </div>
        </div>
    </div>
);

/** سطر التاريخ والإحصاءات أسفل البطاقة. */
const MetaRow: React.FC<{ tribute: Tribute; className?: string }> = ({ tribute, className }) => (
    <div className={`flex items-center gap-3 flex-wrap text-[11px] text-white/60 ${className || ''}`}>
        <span className="inline-flex items-center gap-1.5">
            <Clock size={11} aria-hidden="true" />
            {tribute.date}
        </span>
        {tribute.meta && (
            <span className="inline-flex items-center gap-1.5">
                <Eye size={11} aria-hidden="true" />
                <span dir="ltr">{tribute.meta}</span>
            </span>
        )}
    </div>
);

const Paragraphs: React.FC<{ items: string[]; className?: string }> = ({ items, className }) => (
    <>
        {items.map((text, i) => (
            <p
                key={i}
                className={className || 'text-white/90 text-[15px] md:text-base leading-[2] font-medium'}
            >
                {text}
            </p>
        ))}
    </>
);

/**
 * إظهار بقية النص. يتوقف الطي عند نهاية فقرة كاملة — لا قص في منتصف جملة —
 * والحركة عبر grid-rows حتى تحترم تفضيل تقليل الحركة تلقائياً.
 */
const Reveal: React.FC<{ id: string; open: boolean; children: React.ReactNode }> = ({ id, open, children }) => (
    <div
        id={id}
        className={
            open
                ? 'grid grid-rows-[1fr] opacity-100 transition-all duration-500 ease-out'
                : 'grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-out'
        }
    >
        <div className="overflow-hidden">
            <div className="space-y-4 pt-4">{children}</div>
        </div>
    </div>
);

const RevealToggle: React.FC<{
    controls: string;
    open: boolean;
    onToggle: () => void;
    moreLabel: string;
    lessLabel: string;
}> = ({ controls, open, onToggle, moreLabel, lessLabel }) => (
    <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={controls}
        className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors"
    >
        <span>{open ? lessLabel : moreLabel}</span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
    </button>
);

const byId = (id: string): Tribute => {
    const found = TRIBUTES.find((t) => t.id === id);
    if (!found) throw new Error(`Unknown tribute id: ${id}`);
    return found;
};

const FeaturedTributes: React.FC = () => {
    const reduceMotion = useReducedMotion();
    const [openEssay, setOpenEssay] = useState(false);
    const [openStory, setOpenStory] = useState(false);
    const [photoFailed, setPhotoFailed] = useState(false);

    const maram = byId('maram');
    const sammawi = byId('sammawi');
    const jalladi = byId('jalladi');
    const alowein = byId('alowein');
    const qashai = byId('qashai');
    const uqab = byId('uqab');

    // نفس وصفة الظهور المستخدمة في صفحة المقالات، مع احترام تقليل الحركة.
    const rise = (index: number) =>
        reduceMotion
            ? {}
            : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-50px' },
                  transition: { duration: 0.6, delay: index * 0.08 },
              };

    return (
        <div className="mb-20 md:mb-24">
            {/* فاصل تمهيدي — بلا شارة إضافية، فالقسم يحمل شارته أعلاه */}
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-10 md:mb-12">
                <div className="h-px flex-1 bg-gradient-to-l from-gold-500/40 via-gold-500/15 to-transparent" aria-hidden="true"></div>
                <h3 className="text-gold-300/90 text-xs md:text-sm font-bold tracking-[0.2em] whitespace-nowrap">
                    شهادات مختارة
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-gold-500/40 via-gold-500/15 to-transparent" aria-hidden="true"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* ── الشهادة الأولى: منشور د. محمد علي مرعم، ومعه صورة اللقاء ── */}
                <motion.article
                    {...rise(0)}
                    aria-labelledby={`tribute-${maram.id}-name`}
                    className={`lg:col-span-12 ${CARD_SHELL}`}
                    style={shell(maram.origin)}
                >
                    <TopRule />
                    <SourceChip tribute={maram} />
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-start">
                        {/* الصورة أولاً في DOM ⇐ تظهر يميناً في الاتجاه العربي.
                            نسبة 4:3 ثابتة + self-start تمنع تمدد الخلية خلف عمود
                            النص، وهو ما كان سيقصّ نصف الصورة أفقياً. */}
                        <div className="lg:col-span-5 p-4 md:p-6 lg:p-8 lg:self-start">
                            {!photoFailed && maram.photo ? (
                                <figure className="m-0">
                                    <a
                                        href={maram.photo}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="relative block w-full aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-xl group/photo"
                                    >
                                        <img
                                            src={maram.photo}
                                            alt={maram.photoAlt || maram.author}
                                            width={960}
                                            height={720}
                                            loading="lazy"
                                            onError={() => setPhotoFailed(true)}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-105"
                                        />
                                    </a>
                                    <figcaption className="mt-3 text-[11px] leading-relaxed text-white/55 border-r-2 border-gold-500/40 pr-3">
                                        {maram.photoAlt}
                                    </figcaption>
                                </figure>
                            ) : (
                                <div className="w-full aspect-[4/3] rounded-2xl border border-white/10 bg-slate-950/60 flex items-center justify-center">
                                    <Quote className="w-24 h-24 text-white/[0.06] transform -scale-x-100" strokeWidth={1} aria-hidden="true" />
                                </div>
                            )}
                            <div className="mt-7 pt-6 border-t border-white/10">
                                <Byline tribute={maram} large />
                                <MetaRow tribute={maram} className="mt-3" />
                            </div>
                        </div>

                        <div className="lg:col-span-7 p-6 md:p-8 lg:p-10 lg:pr-2 lg:pt-10">
                            {/* الفقرة الأولى بحجم أكبر ولون أدفأ — بديل الحرف
                                الاستهلالي، الذي لا يصلح للعربية لأنها متصلة الحروف. */}
                            <p className="text-gold-100/95 text-lg md:text-xl leading-[2] font-medium max-w-[62ch]">
                                {maram.paragraphs[0]}
                            </p>
                            <div className="space-y-4 mt-5 max-w-[62ch]">
                                <Paragraphs items={maram.paragraphs.slice(1)} />
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* ── الشهادة الثانية: رسالة عبدالعزيز السماوي، ورقة مؤطّرة ── */}
                <motion.article
                    {...rise(1)}
                    aria-labelledby={`tribute-${sammawi.id}-name`}
                    className="lg:col-span-7 lg:self-start relative rounded-3xl border border-white/10 hover:border-gold-500/40 transition-colors duration-500 p-3 md:p-4 bg-slate-900/50 backdrop-blur-md shadow-[0_30px_80px_-25px_rgba(0,0,0,0.85)]"
                >
                    <SourceChip tribute={sammawi} />
                    {/* ورقة كريمية داخل إطار داكن: البياض هنا يقرأ كوثيقة مؤطّرة
                        لا كخطأ في التباين. كل نص بداخلها يصرّح بلونه الداكن. */}
                    <div className="relative rounded-2xl bg-[#f7f3e8] text-slate-800 p-6 md:p-9 pr-7 md:pr-11 overflow-hidden shadow-inner">
                        <div
                            className="absolute inset-0 pointer-events-none"
                            aria-hidden="true"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0)',
                                backgroundSize: '22px 22px',
                            }}
                        ></div>
                        {/* هامش الورقة على جهة البدء — العلامة البصرية الأسرع لرسالة مكتوبة */}
                        <div className="absolute top-6 bottom-6 right-3 md:right-5 w-px bg-gold-700/30 pointer-events-none" aria-hidden="true"></div>

                        <div className="relative z-10">
                            <p className="font-heading font-bold text-slate-900 text-base md:text-lg mt-6 md:mt-4">
                                {sammawi.paragraphs[0]}
                            </p>
                            <div className="h-px bg-gradient-to-l from-gold-700/40 via-gold-700/15 to-transparent mt-4 mb-5" aria-hidden="true"></div>
                            <div className="space-y-4">
                                <Paragraphs
                                    items={sammawi.paragraphs.slice(1)}
                                    className="text-slate-800 text-[15px] md:text-base leading-[2.05] font-medium"
                                />
                            </div>

                            {sammawi.closing && (
                                <p className="text-slate-900 text-[15px] md:text-base leading-[2.05] font-bold mt-6 pt-5 border-t border-slate-900/10">
                                    {sammawi.closing}
                                </p>
                            )}

                            {/* التوقيع بخط الرقعة — أقرب ما يكون إلى خط اليد العربي */}
                            <div className="text-left mt-7">
                                <h4
                                    id={`tribute-${sammawi.id}-name`}
                                    className="inline-block font-signature text-slate-900 text-[26px] md:text-[30px] leading-none -rotate-[1.5deg]"
                                >
                                    {sammawi.signature || sammawi.author}
                                </h4>
                                <div className="w-44 h-px bg-slate-900/25 mt-2 mr-auto" aria-hidden="true"></div>
                                {sammawi.role && <p className="text-slate-600 text-xs mt-2">{sammawi.role}</p>}
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* ── الشهادة الثالثة: رسالة ماسنجر، موزّعة على فقاعات ── */}
                <motion.article
                    {...rise(2)}
                    aria-labelledby={`tribute-${jalladi.id}-name`}
                    className={`lg:col-span-5 lg:self-start ${CARD_SHELL} p-6 md:p-8`}
                    style={shell(jalladi.origin)}
                >
                    <TopRule />
                    <SourceChip tribute={jalladi} />

                    {jalladi.heading && (
                        <h4 className="font-heading font-black text-white text-lg md:text-xl mt-10 mb-5 relative z-10">
                            {jalladi.heading}
                        </h4>
                    )}

                    {/* فقاعات واردة: الزاوية المربّعة أعلى اليمين، لأن المُرسِل
                        يجلس على جهة البدء في الاتجاه العربي. */}
                    <div className="space-y-3 relative z-10">
                        {jalladi.paragraphs.map((line, i) => (
                            <p
                                key={i}
                                className={
                                    i === 0
                                        ? 'max-w-[94%] rounded-2xl rounded-tr-md border border-gold-500/25 bg-gold-500/[0.07] px-4 py-3 text-gold-200 text-[15px] md:text-base leading-[2.05] font-medium'
                                        : 'max-w-[94%] rounded-2xl rounded-tr-md border border-white/10 bg-white/[0.06] px-4 py-3 text-white/90 text-[15px] md:text-base leading-[2.05] font-medium'
                                }
                            >
                                {line}
                            </p>
                        ))}
                    </div>

                    <div className="h-px bg-gradient-to-r from-gold-500/25 via-gold-500/10 to-transparent my-6" aria-hidden="true"></div>
                    <div className="relative z-10">
                        <Byline tribute={jalladi} />
                        <MetaRow tribute={jalladi} className="mt-3" />
                    </div>
                </motion.article>

                {/* ── الشهادة الرابعة: منشور د. محمد العوين على منصة X ── */}
                <motion.article
                    {...rise(3)}
                    aria-labelledby={`tribute-${alowein.id}-name`}
                    className={`lg:col-span-12 ${CARD_SHELL} p-6 md:p-10 lg:p-12`}
                    style={shell(alowein.origin)}
                >
                    <TopRule />
                    <SourceChip tribute={alowein} />

                    <div className="max-w-[72ch] mx-auto relative z-10">
                        <div className="mt-8 md:mt-6">
                            <Byline tribute={alowein} large />
                        </div>
                        <div className="h-px bg-gradient-to-l from-transparent via-gold-500/25 to-transparent my-7" aria-hidden="true"></div>

                        <p className="text-gold-100/95 text-lg md:text-xl leading-[2] font-medium">
                            {alowein.paragraphs[0]}
                        </p>
                        <div className="space-y-5 mt-6">
                            <Paragraphs items={alowein.paragraphs.slice(1)} className="text-white/90 text-[15px] md:text-base leading-[2.05] font-medium" />
                        </div>

                        <div className="h-px bg-white/10 mt-8 mb-4" aria-hidden="true"></div>
                        <MetaRow tribute={alowein} />
                    </div>
                </motion.article>

                {/* ── الشهادة الخامسة: منشور عادل القشائي، مع اقتباس مُبرز ── */}
                <motion.article
                    {...rise(4)}
                    aria-labelledby={`tribute-${qashai.id}-name`}
                    className={`lg:col-span-12 ${CARD_SHELL} p-6 md:p-8 lg:p-10`}
                    style={shell(qashai.origin)}
                >
                    <TopRule />
                    <SourceChip tribute={qashai} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 lg:mt-6">
                        {/* اللوحة الجانبية أولاً في DOM ⇐ تظهر يميناً، فيبدأ القارئ
                            بالاقتباس كما يفتتح المقال المطوّل في المجلات. */}
                        <aside className="lg:col-span-4 pb-8 lg:pb-0 border-b border-white/10 lg:border-b-0 lg:border-l lg:border-white/10 lg:pl-12 flex flex-col justify-center">
                            <div>
                                <Quote className="w-9 h-9 text-gold-500/40 transform -scale-x-100 mb-4" strokeWidth={1.5} aria-hidden="true" />
                                <p className="font-heading font-black text-gold-300 text-xl md:text-2xl lg:text-[26px] leading-[1.7]">
                                    {qashai.pullQuote}
                                </p>
                                {qashai.pullQuoteCaption && (
                                    <p className="text-white/50 text-[11px] mt-4">{qashai.pullQuoteCaption}</p>
                                )}
                                <div className="mt-7">
                                    <Byline tribute={qashai} />
                                    <MetaRow tribute={qashai} className="mt-3" />
                                </div>
                            </div>
                        </aside>

                        <div className="lg:col-span-8 max-w-[64ch]">
                            <p className="text-gold-100/95 text-lg md:text-xl leading-[2] font-medium">
                                {qashai.paragraphs[0]}
                            </p>
                            <Reveal id={`tribute-${qashai.id}-body`} open={openEssay}>
                                <Paragraphs items={qashai.paragraphs.slice(1)} />
                            </Reveal>
                            <RevealToggle
                                controls={`tribute-${qashai.id}-body`}
                                open={openEssay}
                                onToggle={() => setOpenEssay((v) => !v)}
                                moreLabel="اقرأ الشهادة كاملة"
                                lessLabel="عرض أقل"
                            />
                        </div>
                    </div>
                </motion.article>

                {/* ── الشهادة السادسة: تعليق عزالدين العقاب، حكاية الاسم ── */}
                <motion.article
                    {...rise(5)}
                    aria-labelledby={`tribute-${uqab.id}-name`}
                    className={`lg:col-span-12 ${CARD_SHELL} p-6 md:p-8 lg:p-10`}
                    style={shell(uqab.origin)}
                >
                    <TopRule />
                    <SourceChip tribute={uqab} />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 lg:mt-6">
                        {/* النص أولاً ⇐ يميناً. عكس ترتيب البطاقة السابقة، حتى لا
                            تتكرر الإيقاعة نفسها مرتين متتاليتين. */}
                        <div className="lg:col-span-8 max-w-[64ch]">
                            {uqab.standfirst && (
                                <p className="text-gold-400 text-[11px] font-bold tracking-[0.2em] mb-4">{uqab.standfirst}</p>
                            )}
                            <p className="text-gold-100/95 text-lg md:text-xl leading-[2] font-medium">
                                {uqab.paragraphs[0]}
                            </p>
                            <Reveal id={`tribute-${uqab.id}-body`} open={openStory}>
                                <Paragraphs items={uqab.paragraphs.slice(1)} />
                            </Reveal>
                            <RevealToggle
                                controls={`tribute-${uqab.id}-body`}
                                open={openStory}
                                onToggle={() => setOpenStory((v) => !v)}
                                moreLabel="قراءة التعليق كاملاً"
                                lessLabel="عرض أقل"
                            />
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Byline tribute={uqab} />
                                <MetaRow tribute={uqab} className="mt-3" />
                            </div>
                        </div>

                        {/* الوعد ولوحة الاسم — خارج المنطقة المطويّة، فهما خلاصة
                            الحكاية ويجب أن يُقرآ قبل الضغط على "قراءة التعليق". */}
                        <aside className="lg:col-span-4 pt-8 lg:pt-0 border-t border-white/10 lg:border-t-0 lg:border-r lg:border-white/10 lg:pr-12 flex flex-col justify-center">
                            <div>
                                <Quote className="w-9 h-9 text-gold-500/40 transform -scale-x-100 mb-4" strokeWidth={1.5} aria-hidden="true" />
                                <p className="font-heading font-black text-gold-300 text-2xl md:text-3xl leading-[1.6]">
                                    {uqab.pullQuote}
                                </p>
                                {uqab.nameplate && (
                                    <div className="mt-7 inline-flex flex-col gap-1 px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.04]">
                                        <span className="text-white text-sm font-bold">{uqab.nameplate.name}</span>
                                        <span className="text-white/55 text-[11px] leading-relaxed">{uqab.nameplate.caption}</span>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </motion.article>
            </div>
        </div>
    );
};

export default FeaturedTributes;
