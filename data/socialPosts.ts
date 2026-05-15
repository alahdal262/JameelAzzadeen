export interface SocialPost {
  id: number;
  type: 'facebook' | 'twitter';
  embedUrl: string;
  sourceUrl: string;
  height: number;
}

const fb = (postUrl: string, height = 600): SocialPost['embedUrl'] =>
  `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(postUrl)}&show_text=true&width=500&locale=ar_AR&appId`;

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 1, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/18GvVs4K8V/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=2483806965378169&id=100012466695920'),
  },
  {
    id: 2, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/184gm31REJ/',
    embedUrl: fb('https://www.facebook.com/100009998891395/posts/2862325527444049/'),
  },
  {
    id: 3, type: 'twitter', height: 550,
    sourceUrl: 'https://x.com/g_khamre/status/2050969680458727691',
    embedUrl: 'twitter:2050969680458727691',
  },
  {
    id: 4, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1FWdCCXQ8p/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=4450708078495138&id=100006679681928'),
  },
  {
    id: 5, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/1B2KJQvpE3/',
    embedUrl: fb('https://www.facebook.com/100007677948905/posts/4393753657557189/'),
  },
  {
    id: 6, type: 'facebook', height: 620,
    sourceUrl: 'https://www.facebook.com/share/18Pvuaraqb/',
    embedUrl: fb('https://www.facebook.com/61572190533741/posts/122168647898739684/'),
  },
  {
    id: 7, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/18XFqsHok9/',
    embedUrl: fb('https://www.facebook.com/100003144254499/posts/26943116565376454/'),
  },
  {
    id: 8, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/18PER5LFQ1/',
    embedUrl: fb('https://www.facebook.com/61573945325326/posts/122173282916798177/'),
  },
  {
    id: 9, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/1EFZUNcdPR/',
    embedUrl: fb('https://www.facebook.com/61561543972459/posts/122198630660384799/'),
  },
  {
    id: 10, type: 'facebook', height: 620,
    sourceUrl: 'https://www.facebook.com/share/p/1B8rie1BAd/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=122110727498916898&id=61577506953803'),
  },
  {
    id: 11, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1AznrvByEn/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=2964366860434503&id=100005836542888'),
  },
  {
    id: 12, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/18oWy6feyX/',
    embedUrl: fb('https://www.facebook.com/100004116841814/posts/3483625328451328/'),
  },
  {
    id: 13, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/18otrMgbMH/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=4417171195232132&id=100008178858794'),
  },
  {
    id: 14, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1GCpMEkCvA/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=27320301394253882&id=100001021702697'),
  },
  {
    id: 15, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/1JPEVA6emw/',
    embedUrl: fb('https://www.facebook.com/100050305244604/posts/1624244595929033/'),
  },
  {
    id: 16, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1Aq6wa2qiw/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=2417871905355346&id=100013976808495'),
  },
  {
    id: 17, type: 'facebook', height: 620,
    sourceUrl: 'https://www.facebook.com/share/p/1bsvE2VGg8/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=122250771776308621&id=61559258654583'),
  },
  {
    id: 18, type: 'facebook', height: 650,
    sourceUrl: 'https://www.facebook.com/share/1bXYNWcHtL/',
    embedUrl: fb('https://www.facebook.com/photo.php?fbid=122126934591096097&set=a.122098527393096097&type=3'),
  },
  {
    id: 19, type: 'facebook', height: 650,
    sourceUrl: 'https://www.facebook.com/share/18gsWAAsXV/',
    embedUrl: fb('https://www.facebook.com/photo.php?fbid=26754679480809210&set=a.179958148708038&type=3'),
  },
  {
    id: 20, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1LCuheyr6s/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=122272180004216402&id=61556492070195'),
  },
  {
    id: 21, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/18U831WbQ4/',
    embedUrl: fb('https://www.facebook.com/100009338670352/posts/4455806328073946/'),
  },
  {
    id: 22, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1GQRwLRn3L/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=2794017204301657&id=100010802137815'),
  },
  {
    id: 23, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/1D2My2SzNj/',
    embedUrl: fb('https://www.facebook.com/61556492070195/posts/122272361660216402/'),
  },
  {
    id: 24, type: 'facebook', height: 600,
    sourceUrl: 'https://www.facebook.com/share/p/1apimmLbgC/',
    embedUrl: fb('https://www.facebook.com/story.php?story_fbid=2865211433822125&id=100009998891395'),
  },
];
