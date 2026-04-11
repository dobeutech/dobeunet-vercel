import { EnhancedHero } from "@/components/home/EnhancedHero";
import { Mission } from "@/components/home/Mission";
import { Services } from "@/components/home/Services";
import { Work } from "@/components/home/Work";
import { Pricing } from "@/components/home/Pricing";
import { PageMeta } from "@/components/seo/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Home"
        description="Transform your business with custom web solutions. DOBEU builds fast, modern websites and software that help you grow and serve customers better."
        keywords="web development, custom websites, software development, business growth, modern web solutions, responsive design"
      />
      <EnhancedHero />
      <Mission />
      <Services />
      <Work />
      <Pricing />
    </>
  );
}
