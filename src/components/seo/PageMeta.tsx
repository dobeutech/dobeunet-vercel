import { useEffect } from "react";

interface PageMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

const DEFAULT_DESCRIPTION =
  "DOBEU creates custom websites and software that help businesses grow. Get modern web solutions, consulting, and training from experienced developers.";
const DEFAULT_KEYWORDS =
  "web development, custom software, website design, software consulting, web applications, business technology, digital solutions";
const SITE_NAME = "DOBEU - Web Development & Software Solutions";

export function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
}: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | DOBEU` : SITE_NAME;
    document.title = fullTitle;

    const metaTags: Record<string, string> = {
      description,
      keywords,
      "og:title": ogTitle || fullTitle,
      "og:description": ogDescription || description,
      "og:type": "website",
      "twitter:card": "summary_large_image",
      "twitter:title": ogTitle || fullTitle,
      "twitter:description": ogDescription || description,
    };

    if (ogImage) {
      metaTags["og:image"] = ogImage;
      metaTags["twitter:image"] = ogImage;
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(
        `meta[property="${name}"]`,
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.querySelector(
          `meta[name="${name}"]`,
        ) as HTMLMetaElement;
      }

      if (meta) {
        meta.content = content;
      } else {
        const newMeta = document.createElement("meta");
        if (
          name.startsWith("og:") ||
          name === "twitter:card" ||
          name === "twitter:title" ||
          name === "twitter:description" ||
          name === "twitter:image"
        ) {
          newMeta.setAttribute(
            name.startsWith("og:") ? "property" : "name",
            name,
          );
        } else {
          newMeta.setAttribute("name", name);
        }
        newMeta.content = content;
        document.head.appendChild(newMeta);
      }
    });

    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    return () => {
      document.title = SITE_NAME;
    };
  }, [
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    canonical,
  ]);

  return null;
}
