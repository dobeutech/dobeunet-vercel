import React from "react";
import { ColorSwatch } from "../kit/ColorSwatch";

export const ColorSection = () => (
  <section className="space-y-8">
    <h2 className="text-3xl font-bold border-l-4 border-pink-500 pl-4">
      Color Palette
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <ColorSwatch color="bg-yellow-400" name="Electric Lemon" hex="#FACC15" />
      <ColorSwatch color="bg-black" name="Void Black" hex="#000000" />
      <ColorSwatch color="bg-white" name="Stark White" hex="#FFFFFF" />
      <ColorSwatch color="bg-blue-500" name="Azure Tech" hex="#3B82F6" />
      <ColorSwatch color="bg-pink-500" name="Neon Rose" hex="#EC4899" />
      <ColorSwatch color="bg-purple-500" name="Deep Violet" hex="#A855F7" />
      <ColorSwatch color="bg-neutral-900" name="Graphite" hex="#171717" />
      <ColorSwatch color="bg-gray-500" name="Muted Metal" hex="#6B7280" />
    </div>
  </section>
);
