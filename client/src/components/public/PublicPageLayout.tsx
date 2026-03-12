import React, { useEffect } from "react";
import SynapseHero from "./SynapseHero";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  palette: string[]; // Still included for compatibility, but SynapseHero uses dark theme
  pageTitle: string;
  description: string;
}

export function PublicPageLayout({ children, pageTitle, description }: PublicPageLayoutProps) {
  useEffect(() => {
    document.title = pageTitle || "Synapse | Opinion-Routing";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [pageTitle, description]);

  return (
    <div className="relative min-h-screen w-full bg-black">
      <SynapseHero>
        {children}
      </SynapseHero>
    </div>
  );
}

