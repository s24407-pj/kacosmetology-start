# Kierunek wizualny Ka.Cosmetology

## Teza wizualna

Ka.Cosmetology ma być spokojną, osobistą i wiarygodną stroną gabinetu, w
której fotografia, typografia i oddech między sekcjami prowadzą od rozpoznania
potrzeby do wyboru specjalizacji i kontaktu, bez estetyki katalogu komponentów.

## Droga odwiedzającej osoby

- `/`: rozpoznanie marki, osoby prowadzącej i lokalizacji; wybór między
  kosmetologią, oprawą oka i trychologią; poznanie podejścia, opinii oraz danych
  kontaktowych; przejście do Booksy.
- `/kosmetologia`: zrozumienie zakresu opieki nad skórą, rozpoznanie własnej
  potrzeby, poznanie polecanych pierwszych kroków i pełnej oferty, rezerwacja.
- `/oprawa-oka`: zobaczenie naturalnego kierunku stylizacji, rozpoznanie
  oczekiwanego efektu, wybór usługi i rezerwacja.
- `/trychologia`: zrozumienie konsultacyjnego charakteru opieki, rozpoznanie
  problemu skóry głowy lub włosów, wybór konsultacji bądź zabiegu i rezerwacja.
- `/galeria`: obejrzenie rzeczywistych efektów i gabinetu, następnie przejście
  do kontaktu lub Booksy.
- strony usług: potwierdzenie zakresu, czasu i ceny usługi, sprawdzenie wymogu
  konsultacji oraz podjęcie jednej decyzji o rezerwacji.

## Hierarchia treści

Pierwszy ekran identyfikuje specjalizację, krótko objaśnia jej wartość i daje
jedną główną akcję. Dalej pojawiają się kolejno potrzeby klientki, rekomendowany
pierwszy krok, pełna oferta i spokojne domknięcie. Strona główna zachowuje
narrację: orientacja, specjalizacje, podejście, zaufanie, kontakt.

## Typografia i odstępy

Pozostają obecne fonty, skala nagłówków, kolory i tokeny. Nagłówki wyznaczają
rytm i mają krótkie wiersze; tekst opisowy używa ograniczonej szerokości.
Sekcje korzystają ze wspólnego komponentu `Section`, a ich wewnętrzne odstępy
opierają się na istniejącej skali Tailwind. Grupowanie jest budowane głównie
przez wyrównanie, linie podziału i białą przestrzeń. Karty są zarezerwowane dla
usług i wcześniejszego, rozpoznawalnego układu Kontaktu.

## Strategia obrazu

Wykorzystywane są istniejące materiały gabinetu i trzy ciepłe, bliskie kadry
ilustracyjne dla landingów specjalizacji. Zdjęcia nie przedstawiają
specjalistki, klientek ani efektów Ka.Cosmetology. Każdy obraz ma responsywne
warianty WebP, jawne wymiary i opis alternatywny. Na telefonie fotografia
następuje po treści i CTA; na dużym ekranie równoważy blok tekstowy. Źródła i
licencje są zapisane w `docs/image-sources.md`.

## Strategia interakcji

Nawigacja używa semantycznych linków trasowych, a rezerwacja prowadzi wprost do
Booksy i jasno komunikuje otwarcie zewnętrznej strony. Menu mobilne zachowuje
pełnoekranowy charakter, obsługę Escape, pułapkę fokusu i przywrócenie fokusu.
Stany hover i focus korzystają z istniejącego koloru akcji i krótkich przejść,
które są wyłączane przy `prefers-reduced-motion`.

## Ponowne użycie systemu

Wykorzystywane są istniejące `Section`, `SectionHeader`, `Heading`, `Text`,
`Button`, `BooksyLink`, `ServiceCard`, `PageHero`, tokeny powierzchni, obramowań
i cieni, helpery obrazów responsywnych oraz konwencje fokusu z nawigacji.
Kontakt przywraca wcześniejszą kompozycję dwóch powierzchni: danych kontaktowych
i godzin otwarcia, zachowując nowe kotwice, analitykę, voucher i CTA Booksy.

## Referencje kontrolne

- wcześniejsza implementacja sekcji Kontakt z bieżącej historii repozytorium:
  kompozycja, grupowanie informacji, ikony i zachowanie responsywne;
- istniejący hero, sekcja „O mnie” i galeria Ka.Cosmetology: tożsamość marki,
  typografia, rytm pionowy i sposób pracy z prawdziwymi materiałami;
- zaakceptowane fotografie Unsplash wymienione w `docs/image-sources.md`:
  rodzaj kadru i charakter ilustracji dla trzech specjalizacji.
