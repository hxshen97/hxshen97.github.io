// src/i18n/ui.ts

export const languages = { en: "EN", zh: "中文" } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";

export const ui: Record<Lang, Record<string, string>> = {
  en: {
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.publications": "Publications",
    "nav.cv": "CV",
    "nav.contact": "Contact",
    "sidebar.tagline": "EDA Software\nComputational Mathematics",
    "home.role": "EDA Software R&D · Computational Mathematics PhD",
    "home.bio": "",
    "home.viewProjects": "View Projects",
    "home.readBlog": "Read Blog",
    "home.featuredProjects": "Featured Projects",
    "home.allProjects": "All projects →",
    "home.recentPosts": "Recent Posts",
    "home.allPosts": "All posts →",
    "home.getInTouch": "Get in touch",
    "blog.title": "Blog",
    "blog.subtitle": "Thoughts on mathematics, engineering, and whatever else.",
    "projects.title": "Projects",
    "projects.subtitle": "Software, research tools, and experiments.",
    "publications.title": "Publications",
    "publications.subtitle": "Papers, theses, and mathematical writing.",
    "cv.title": "Curriculum Vitae",
    "cv.download": "Download PDF →",
    "cv.education": "Education",
    "cv.experience": "Experience",
    "cv.skills": "Skills",
    "contact.title": "Contact",
    "contact.subtitle": "The best way to reach me is by email.",
    "filter.all": "All",
  },
  zh: {
    "nav.about": "关于",
    "nav.projects": "项目",
    "nav.blog": "博客",
    "nav.publications": "学术成果",
    "nav.cv": "简历",
    "nav.contact": "联系方式",
    "sidebar.tagline": "EDA软件 | 计算数学",
    "home.role": "EDA软件研发工程师 · 计算数学博士",
    "home.bio": "",
    "home.viewProjects": "查看项目",
    "home.readBlog": "阅读博客",
    "home.featuredProjects": "精选项目",
    "home.allProjects": "所有项目 →",
    "home.recentPosts": "最新文章",
    "home.allPosts": "所有文章 →",
    "home.getInTouch": "联系我",
    "blog.title": "博客",
    "blog.subtitle": "关于理论与技术的一些思考",
    "projects.title": "项目",
    "projects.subtitle": "软件、研究工具和实验",
    "publications.title": "发表",
    "publications.subtitle": "期刊论文、学位论文和学术笔记",
    "cv.title": "个人简历",
    "cv.download": "下载 PDF →",
    "cv.education": "教育背景",
    "cv.experience": "工作经历",
    "cv.skills": "技能",
    "contact.title": "联系方式",
    "contact.subtitle": "优先使用邮件沟通",
    "filter.all": "全部",
  },
};

export function t(lang: Lang, key: string): string {
  return ui[lang][key] ?? ui[defaultLang][key] ?? key;
}

function ensureTrailingSlash(p: string): string {
  return p.endsWith("/") ? p : `${p}/`;
}

export function localizedPath(path: string, lang: Lang): string {
  const p = lang === defaultLang ? path : `/zh${path}`;
  return ensureTrailingSlash(p);
}

/**
 * Given a URL pathname, strip the /zh prefix to get the "base" path,
 * then return both language versions.
 */
export function langSwitchPaths(pathname: string): { en: string; zh: string } {
  const base = pathname.startsWith("/zh") ? pathname.replace(/^\/zh/, "") || "/" : pathname;
  return {
    en: ensureTrailingSlash(base),
    zh: ensureTrailingSlash(`/zh${base === "/" ? "" : base}`),
  };
}
