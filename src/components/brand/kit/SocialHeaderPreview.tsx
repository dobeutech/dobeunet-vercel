import React from "react";
import { Logo } from "../../layout/Logo";
import { Twitter, Linkedin, Facebook } from "lucide-react";

interface SocialHeaderPreviewProps {
  platform: string;
  width: string;
  height: string;
  color: string;
}

export const SocialHeaderPreview = ({
  platform,
  width,
  height,
  color,
}: SocialHeaderPreviewProps) => (
  <div className="space-y-4">
    <h4 className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
      {platform === "Twitter" && <Twitter size={16} />}
      {platform === "LinkedIn" && <Linkedin size={16} />}
      {platform === "Facebook" && <Facebook size={16} />}
      {platform} Header
    </h4>
    <div
      className={`relative overflow-hidden rounded-lg ${color} flex items-center justify-center`}
      style={{ aspectRatio: width }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      <div className="relative z-10 text-center transform scale-75 md:scale-100">
        <Logo className="mb-4 justify-center scale-150" />
        <p className="text-white font-bold text-xl tracking-tight">
          Tech is your best friend.
        </p>
      </div>
    </div>
  </div>
);
