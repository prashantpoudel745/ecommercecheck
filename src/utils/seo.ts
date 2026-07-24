type SeoOptions = {
  title: string;
  description: string;
  canonicalPath: string;
};

const SITE_URL = "https://bebasthapan.com";

const setMeta = (selector: string, attribute: "content" | "href", value: string) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

export const setPageSeo = ({ title, description, canonicalPath }: SeoOptions) => {
  if (typeof document === "undefined") return;

  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  document.title = title;

  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", canonicalUrl);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);
  setMeta('link[rel="canonical"]', "href", canonicalUrl);
};
