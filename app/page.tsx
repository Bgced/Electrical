import Hero from '@/components/Hero';
import { Stats, Insights } from '@/components/Stats';
import { VideoBand, About } from '@/components/Sections';
import { Projects, Gallery, Specs, Components } from '@/components/Sections2';
import LabSection from '@/components/LabSection';
import { Converter, Cta } from '@/components/Sections3';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <VideoBand />
      <About />
      <LabSection />
      <Components />
      <Projects />
      <Gallery />
      <Specs />
      <Converter />
      <Insights />
      <Cta />
    </>
  );
}
