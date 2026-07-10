import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

type KeepAlivePage = {
  id: string;
  paths: string[];
  render: () => ReactNode;
};

type ProtectedKeepAliveRouterProps = {
  pages: KeepAlivePage[];
  fallback: ReactNode;
};

const normalizePath = (path: string) => {
  if (!path) return "/";
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
};

export function ProtectedKeepAliveRouter({
  pages,
  fallback,
}: ProtectedKeepAliveRouterProps) {
  const location = useLocation();
  const cacheRef = useRef<Record<string, ReactNode>>({});
  const [, setVersion] = useState(0);

  const pathname = normalizePath(location.pathname);

  const activePage = useMemo(
    () =>
      pages.find((page) =>
        page.paths.some((pagePath) => normalizePath(pagePath) === pathname)
      ),
    [pages, pathname]
  );

  useEffect(() => {
    if (!activePage) return;

    if (!cacheRef.current[activePage.id]) {
      cacheRef.current[activePage.id] = activePage.render();
      setVersion((value) => value + 1);
    }
  }, [activePage]);

  if (!activePage) {
    return <>{fallback}</>;
  }

  return (
    <>
      {pages.map((page) => {
        const element = cacheRef.current[page.id];
        if (!element) return null;

        return (
          <section
            key={page.id}
            style={{ display: page.id === activePage.id ? "block" : "none" }}
            aria-hidden={page.id !== activePage.id}
          >
            {element}
          </section>
        );
      })}
    </>
  );
}
