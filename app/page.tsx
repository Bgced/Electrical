import Hero from '@/components/Hero';
import { Stats, QuickLinks, Insights } from '@/components/Stats';
import { VideoBand, About, Services, Industries, Safety } from '@/components/Sections';
import { Projects, Process, Gallery, Specs, Components } from '@/components/Sections2';
import { ThreeD, Simulator } from '@/components/Interactive';
import { Converter, Faq, Cta } from '@/components/Sections3';

export default function Home() {
  return (
    <>
      <Hero />
      <QuickLinks />
      <Insights />
      <Stats />
      <VideoBand />
      <About />
      <Services />
      <Industries />
      <Projects />
      <Process />
      <ThreeD />
      <Gallery />
      <Specs />
      <Components />
      <Safety />
      <Simulator />
      <Converter />
      <Faq />
      <Cta />
    </>
  );
}