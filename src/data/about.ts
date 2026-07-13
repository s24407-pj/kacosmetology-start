import type { AboutSection } from '@app-types/types'

export const ABOUT_SECTION: AboutSection = {
  leadText:
    'Kosmetologia i trychologia to nie tylko moja praca – to moja pasja. Jestem magistrem kosmetologii, a swoją wiedzę stale poszerzam, uczestnicząc w licznych kursach i szkoleniach z zakresu zdrowia skóry, trychologii oraz terapii holistycznych. Łączę nowoczesne podejście do pielęgnacji z głębokim zrozumieniem ludzkiego organizmu, aby skutecznie wspierać moich pacjentów w poprawie wyglądu skóry, kondycji włosów i ogólnego samopoczucia. Stawiam na indywidualną diagnozę i kompleksowe działania – bo prawdziwe efekty zaczynają się od zrozumienia potrzeb całego organizmu, a nie tylko jego powierzchni.',
  processHeading: 'Jak wygląda współpraca',
  image: {
    src: '/images/proces/o-mnie.webp',
    alt: 'Kosmetolog z książką i modelem skóry w gabinecie Ka.Cosmetology',
    aspect: '4/5',
  },
  processSteps: [
    {
      step: 1,
      title: 'Szczegółowy wywiad',
      description: 'Analiza skóry, stylu życia i dotychczasowej pielęgnacji.',
      icon: 'clipboard',
      video: {
        poster: '/movies/konsultacja-poster.webp',
        alt: 'Szczegółowy wywiad kosmetologiczny w gabinecie',
        sources: {
          webm: '/movies/konsultacja.webm',
          mp4: '/movies/konsultacja.mp4',
        },
      },
    },
    {
      step: 2,
      title: 'Dobór zabiegu',
      description: 'Plan zabiegów dopasowany do indywidualnych potrzeb.',
      icon: 'sparkles',
      video: {
        poster: '/movies/dobor-zabiegu-poster.webp',
        alt: 'Film prezentujący gabinet Ka.Cosmetology i stanowisko zabiegowe',
        sources: {
          webm: '/movies/dobor-zabiegu.webm',
          mp4: '/movies/dobor-zabiegu.mp4',
        },
      },
    },
    {
      step: 3,
      title: 'Zalecenia',
      description: 'Rekomendacje pielęgnacji domowej i nawyków.',
      icon: 'checklist',
      video: {
        poster: '/movies/zalecenia-poster.webp',
        alt: 'Indywidualne zalecenia pielęgnacyjne dla klienta',
        sources: {
          webm: '/movies/zalecenia.webm',
          mp4: '/movies/zalecenia.mp4',
        },
      },
    },
    {
      step: 4,
      title: 'Dalsza praca ze skórą',
      description: 'Stała opieka i korekta planu w miarę postępów.',
      icon: 'refresh',
      video: {
        poster: '/movies/efekty-poster.webp',
        alt: 'Dalsza opieka i praca nad kondycją skóry',
        sources: {
          webm: '/movies/efekty.webm',
          mp4: '/movies/efekty.mp4',
        },
      },
    },
  ],
}
