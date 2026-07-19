import type {
  PublicService,
  ServiceArea,
  ServiceCategory,
  ServiceId,
  ServiceSource,
  ServiceSpecializationId,
} from '@app-types/types'

const serviceSources: ServiceSource[] = [
  // OPRAWA OKA
  {
    id: 'service-henna-brwi-z-regulacja',
    name: 'Henna brwi z regulacją',
    catalogCategory: 'Oprawa oka',
    price: 60,
    duration: 40,
    isNext: false,
    description:
      'Koloryzacja i nadanie kształtu brwiom dla podkreślenia spojrzenia.',
    forWho:
      'Osoby chcące podkreślić brwi, nadać im wyrazisty kolor i kształt bez codziennego makijażu.',
    contraindications: [
      'Alergia na hennę lub inne składniki preparatu',
      'Stany zapalne, infekcje lub rany w okolicach brwi',
      'Świeżo opalona lub złuszczająca się skóra',
      'Choroby skóry w okolicach brwi (np. egzema, łuszczyca)',
      'Skóra nadmiernie wrażliwa lub podrażniona po innych zabiegach kosmetycznych',
    ],
  },
  {
    id: 'service-farbka-z-regulacja',
    name: 'Farbka z regulacją',
    catalogCategory: 'Oprawa oka',
    price: 80,
    duration: 40,
    isNext: false,
    description: 'Delikatniejsze farbowanie brwi farbką z regulacją łuku.',
    forWho: 'Idealne dla osób szukających naturalnego efektu.',
    contraindications: [
      'Alergia na składniki farby',
      'Podrażnienia lub infekcje skóry w obrębie łuku brwiowego',
      'Choroby skóry (np. atopowe zapalenie skóry, egzema)',
      'Świeże blizny lub mikrourazy w miejscu zabiegu',
      'Ciężka nadwrażliwość skóry na kosmetyki',
    ],
  },
  {
    id: 'service-regulacja-brwi',
    name: 'Regulacja brwi',
    catalogCategory: 'Oprawa oka',
    price: 30,
    duration: 20,
    isNext: false,
    description:
      'Nadanie odpowiedniego kształtu brwiom poprzez usunięcie zbędnych włosków.',
    forWho:
      'Osoby, które chcą nadać brwiom odpowiedni kształt lub utrzymać ich regularny wygląd.',
    contraindications: [
      'Stany zapalne lub infekcje w okolicy brwi',
      'Świeże rany, skaleczenia, mikrourazy',
      'Choroby dermatologiczne (łuszczyca, AZS)',
      'Przebyte zabiegi laserowe lub złuszczające w tym obszarze w ostatnich dniach',
    ],
  },
  {
    id: 'service-laminacja-brwi-regulacja-bez-koloryzacji',
    name: 'Laminacja brwi + regulacja (bez koloryzacji)',
    catalogCategory: 'Oprawa oka',
    price: 110,
    duration: 60,
    isNext: false,
    description: 'Utrwalenie kształtu brwi bez zmiany ich koloru.',
    forWho:
      'Osoby z niesfornymi, rosnącymi w różnych kierunkach brwiami – dla uzyskania gładkiego, pełniejszego efektu.',
    contraindications: [
      'Ciąża i karmienie piersią (ostrożnie)',
      'Alergie na składniki preparatów do laminacji',
      'Stany zapalne skóry, infekcje bakteryjne lub wirusowe',
      'Skóra bardzo cienka, wrażliwa, podrażniona lub poparzona',
      'Choroby autoimmunologiczne ze zmianami skórnymi',
      'Świeże zabiegi złuszczające',
      'Skłonność do reakcji alergicznych',
    ],
  },
  {
    id: 'service-laminacja-brwi-regulacja-koloryzacja',
    name: 'Laminacja brwi + regulacja + koloryzacja',
    catalogCategory: 'Oprawa oka',
    price: 150,
    duration: 60,
    isNext: false,
    description: 'Trwałe ułożenie i koloryzacja brwi wraz z ich regulacją.',
    forWho:
      'Osoby chcące uzyskać efekt pełnych, zadbanych brwi bez konieczności codziennego makijażu.',
    contraindications: [
      'Ciąża i karmienie piersią (ostrożnie)',
      'Alergie na składniki preparatów do laminacji',
      'Stany zapalne skóry, infekcje',
      'Skóra bardzo wrażliwa/podrażniona',
      'Choroby autoimmunologiczne',
      'Świeże zabiegi złuszczające',
      'Skłonność do uczuleń kontaktowych',
    ],
  },
  {
    id: 'service-lifting-rzes-farbka',
    name: 'Lifting rzęs + farbka',
    catalogCategory: 'Oprawa oka',
    price: 150,
    duration: 90,
    isNext: false,
    description:
      'Podkręcenie i przyciemnienie naturalnych rzęs bez użycia maskary.',
    forWho:
      'Dla osób, które chcą uzyskać efekt otwartego oka i naturalnego podkręcenia.',
    note: 'Wymagana jest pierwsza konsultacja kosmetologiczna.',
    recommendedTests: [
      'Morfologia z rozmazem',
      'Ferrytyna',
      'Żelazo',
      'Witamina D3',
      'Witamina B12',
      'Glukoza',
      'Insulina',
      'TSH',
      'FT3',
      'FT4',
      'Lipidogram',
      'CRP',
      'OB',
    ],
    contraindications: [
      'Infekcje oka (np. zapalenie spojówek, jęczmień, gradówka)',
      'Choroby oczu (jaskra, zaćma – konsultacja lekarska)',
      'Alergie na składniki preparatów',
      'Skłonność do łzawienia lub nadmierna wrażliwość oczu',
      'Uszkodzenia naskórka lub rany w okolicy powiek',
      'Skóra bardzo cienka lub z egzemą',
      'Niedawne zabiegi okulistyczne',
      'Ciąża (ryzyko nadwrażliwości)',
      'Soczewki kontaktowe w czasie zabiegu (zdjąć na czas zabiegu)',
    ],
  },
  {
    id: 'service-laminacja-brwi-lifting-rzes',
    name: 'Laminacja brwi + lifting rzęs',
    catalogCategory: 'Oprawa oka',
    price: 250,
    duration: 120,
    isNext: false,
    description:
      'Zabieg łączący trwałe ułożenie brwi oraz podkręcenie i przyciemnienie rzęs, zapewniający efekt zadbanej oprawy oka bez codziennego makijażu.',
    forWho:
      'Dla osób, które chcą uzyskać pełniejsze, ułożone brwi oraz efektowny wachlarz naturalnych rzęs.',
    contraindications: [
      'Alergia na składniki preparatów do laminacji lub liftingu',
      'Infekcje i stany zapalne oczu',
      'Choroby skóry i powiek (egzema, łuszczyca, AZS, opryszczka)',
      'Uszkodzenia skóry wokół oczu i brwi',
      'Skóra bardzo wrażliwa lub reaktywna',
      'Nadmierne wypadanie rzęs',
      'Ciąża i karmienie piersią',
      'Noszenie soczewek kontaktowych (zdjąć przed zabiegiem)',
      'Przewlekłe choroby oczu (konsultacja lekarska)',
    ],
  },

  // TRYCHOLOGIA
  {
    id: 'service-pierwsza-konsultacja-trychologiczna',
    name: 'Pierwsza konsultacja trychologiczna',
    catalogCategory: 'Trychologia',
    price: 200,
    duration: 60,
    isNext: false,
    description:
      'Szczegółowy wywiad zdrowotny i pielęgnacyjny, analiza skóry głowy (trichoskopia), dobór indywidualnego planu terapii oraz – w razie potrzeby – zalecenia do dalszej diagnostyki.',
    preparation: [
      'Nie myj głowy w dniu wizyty',
      'Brak peelingu skóry głowy 7 dni przed',
      'Nie farbuj włosów tydzień przed',
      'Bez kosmetyków stylizujących w dniu wizyty',
    ],
    recommendedTests: [
      'Morfologia',
      'Ferrytyna',
      'Żelazo',
      'Witamina D3',
      'Witamina B12',
      'TSH/FT3/FT4',
      'Glukoza i insulina',
      'OB/CRP',
      'GGTP',
      'Lipidogram',
    ],
  },
  {
    id: 'service-zabieg-trychologiczny-dobrany-indywidualnie',
    name: 'Zabieg trychologiczny dobrany indywidualnie',
    catalogCategory: 'Trychologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg dobierany indywidualnie na podstawie konsultacji – może obejmować oczyszczanie, peeling, terapie przeciwłojotokowe, przeciwzapalne, nawilżające, wzmacniające cebulki lub stymulujące porost.',
    note: 'Wymagana wcześniejsza konsultacja trychologiczna.',
    contraindications: [
      'Ostre stany zapalne i infekcje skóry głowy',
      'Alergia na składniki preparatów',
      'Świeże rany, poparzenia lub uszkodzenia skóry',
    ],
  },
  {
    id: 'service-rekonstrukcja-lodygi-wlosa-joico',
    name: 'Rekonstrukcja łodygi włosa – JOICO',
    catalogCategory: 'Trychologia',
    price: 200,
    duration: 90,
    isNext: false,
    description:
      'Zabieg regenerujący i wzmacniający łodygę włosa oparty na produktach JOICO – bez ingerencji w skórę głowy.',
    forWho:
      'Suche, łamliwe, rozjaśniane, farbowane lub często stylizowane włosy.',
    contraindications: [
      'Alergia na składniki preparatów',
      'Otwarte rany na skórze głowy',
      'Nadwrażliwość na zapachy',
    ],
  },
  {
    id: 'service-mezoterapia-iglowa-skory-glowy',
    name: 'Mezoterapia igłowa skóry głowy',
    catalogCategory: 'Trychologia',
    price: 550,
    duration: 60,
    isNext: true,
    description:
      'Manualne wstrzyknięcie substancji aktywnych w skórę głowy w celu poprawy jej kondycji i stymulacji mieszków włosowych do wzrostu.',
    note: 'Konieczna wcześniejsza konsultacja trychologiczna.',
    contraindications: [
      'Choroby autoimmunologiczne',
      'Alergia na składniki preparatu',
      'Ciąża i karmienie piersią',
      'Czynne infekcje lub stany zapalne skóry głowy',
      'Nowotwory (w trakcie i po leczeniu – wymagana zgoda lekarza)',
      'Zaburzenia krzepnięcia krwi, leki rozrzedzające krew',
      'Opryszczka, łuszczyca w fazie zaostrzenia',
      'Gorączka, infekcja ogólnoustrojowa',
      'Skłonność do blizn przerostowych (keloidów)',
      'Niewyrównane choroby przewlekłe',
    ],
  },

  // KOSMETOLOGIA
  {
    id: 'service-oczyszczanie-wodorowe',
    name: 'Oczyszczanie wodorowe',
    catalogCategory: 'Kosmetologia',
    price: 250,
    duration: 60,
    isNext: false,
    description:
      'Nowoczesna, wieloetapowa terapia oczyszczająca z aktywnym wodorem: dogłębne oczyszczenie, neutralizacja wolnych rodników, dotlenienie i rozjaśnienie skóry.',
    effects: [
      'oczyszczenie porów',
      'odświeżenie i dotlenienie',
      'wygładzenie struktury naskórka',
      'poprawa kolorytu',
      'zmniejszenie widoczności zaskórników',
    ],
    contraindications: [
      'Czynna opryszczka',
      'Infekcje bakteryjne i wirusowe skóry',
      'Choroby nowotworowe',
      'Otwarte rany i uszkodzenia skóry',
      'Świeżo wykonane zabiegi laserowe/mezoterapia',
      'Aktywny trądzik',
      'Uczulenie na substancje używane podczas zabiegu (rzadkie)',
    ],
  },
  {
    id: 'service-mezoterapia-mikroiglowa-ampulka',
    name: 'Mezoterapia mikroigłowa + ampułka',
    catalogCategory: 'Kosmetologia',
    price: 350,
    duration: 120,
    isNext: true,
    description:
      'Kontrolowane mikronakłuwanie skóry z wprowadzaniem indywidualnie dobranych substancji aktywnych; poprawia gęstość, nawilża, rozjaśnia przebarwienia i redukuje zmarszczki.',
    note: 'Wymagana pierwsza konsultacja kosmetologiczna przed zabiegiem.',
    forWho:
      'Oznaki starzenia, przebarwienia, nierówna struktura skóry, utrata jędrności, trądzik, rozszerzone pory.',
    contraindications: [
      'Ciąża i karmienie piersią',
      'Aktywny trądzik ropowiczy lub zapalny',
      'Opryszczka, stany zapalne skóry',
      'Choroby autoimmunologiczne',
      'Nowotwory',
      'Tendencja do blizn przerostowych',
      'Przyjmowanie leków przeciwzakrzepowych',
      'Zaburzenia krzepnięcia',
    ],
  },
  {
    id: 'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem',
    name: 'Pierwsza konsultacja kosmetologiczna z zabiegiem',
    catalogCategory: 'Kosmetologia',
    price: 350,
    duration: 120,
    isNext: false,
    description:
      'Wywiad kosmetologiczny, analiza skóry, ocena pielęgnacji i stylu życia, plan terapii gabinetowej oraz rekomendacje pielęgnacji domowej + zabieg dobrany do potrzeb skóry.',
    includes: [
      'analiza skóry i stylu życia',
      'ustalenie celów pielęgnacyjnych',
      'zabieg dobrany do aktualnych potrzeb skóry',
      'plan terapii gabinetowej i domowej',
    ],
    preparation: ['Brak peelingów 3–5 dni przed', 'Unikaj opalania i solarium'],
    recommendedTests: [
      'Morfologia z rozmazem',
      'Ferrytyna',
      'Żelazo',
      'Witamina D3',
      'Witamina B12',
      'Glukoza',
      'Insulina',
      'TSH',
      'FT3',
      'FT4',
      'Lipidogram',
      'CRP',
      'OB',
    ],
    contraindications:
      'Brak przeciwwskazań do samej konsultacji; przeciwwskazania do zabiegów omawiane na wizycie.',
  },
  {
    id: 'service-zabieg-kosmetologiczny-dobrany-indywidualnie',
    name: 'Zabieg kosmetologiczny dobrany indywidualnie',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg dobierany na miejscu na podstawie aktualnego stanu skóry: nawilżający, kojący, oczyszczający, regenerujący, rozjaśniający, przeciwtrądzikowy lub przeciwstarzeniowy.',
    forWho:
      'Dla każdego, kto chce zadbać o skórę twarzy – najlepiej po pierwszej konsultacji.',
    contraindications: [
      'Aktywne infekcje skórne (bakteryjne, wirusowe, grzybicze)',
      'Przerwana ciągłość naskórka',
      'Reakcje alergiczne lub poparzenia',
      'Uczulenie na składniki aktywne używane podczas zabiegu',
      'Ciąża i karmienie piersią (w zależności od użytych substancji)',
      'Aktywne stany zapalne (np. trądzik ropowiczy)',
      'Choroby autoimmunologiczne (np. łuszczyca, toczeń – konsultacja przed zabiegiem)',
      'Stosowanie silnych peelingów, retinolu, kwasów – odstawić 5–7 dni przed',
    ],
  },
  {
    id: 'service-eksfoliacja-kwasami',
    name: 'Eksfoliacja kwasami',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg złuszczający dostosowany indywidualnie do potrzeb skóry – może obejmować redukcję niedoskonałości, poprawę struktury naskórka, rozjaśnienie przebarwień, regulację pracy gruczołów łojowych, działanie anti-aging oraz wspomaganie procesów regeneracyjnych.',
    forWho:
      'Dla osób zmagających się z niedoskonałościami, przebarwieniami, szarą i zmęczoną cerą, drobnymi zmarszczkami, nierówną teksturą skóry oraz nadmiernym wydzielaniem sebum.',
    note: 'Dla osób po pierwszej konsultacji – kontynuacja terapii. Wymagana jest pierwsza konsultacja kosmetologiczna.',
    contraindications: [
      'Choroby nowotworowe',
      'Ciąża i karmienie',
      'Infekcje skóry',
      'Świeże opalanie',
      'Nadwrażliwość na składniki aktywne',
      'Opryszczka',
      'Leczenie retinoidami doustnymi (należy odczekać min. 6 miesięcy po zakończeniu terapii)',
      'Aktywne stany zapalne (np. trądzik ropowiczy – zabieg może być przeciwwskazany lub wymagać innej formy terapii)',
      'Choroby autoimmunologiczne (np. łuszczyca, toczeń – konsultacja przed zabiegiem)',
      'Stosowanie silnych peelingów, retinolu, kwasów – należy odstawić min. 5–7 dni przed wizytą',
    ],
  },
  {
    id: 'service-terapia-tradziku-kolejny-zabieg',
    name: 'Terapia trądziku – kolejny zabieg',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg dobrany w ramach rozpoczętej terapii, ukierunkowany na redukcję zmian trądzikowych, stanów zapalnych, zaskórników oraz wyciszenie skóry.',
    forWho:
      'Dla osób z trądzikiem pospolitym, hormonalnym, dorosłych, z trądzikiem zapalnym i niezapalnym.',
    note: 'Wymagana jest pierwsza konsultacja kosmetologiczna, aby ocenić typ trądziku i wdrożyć odpowiedni plan terapii.',
    recommendedTests: [
      'morfologia z rozmazem',
      'ferrytyna',
      'żelazo',
      'witamina D3',
      'witamina B12',
      'glukoza',
      'insulina',
      'TSH',
      'FT3',
      'FT4',
      'lipidogram',
      'CRP',
      'OB',
      '(opcjonalnie: testosteron, androstendion, DHEA-S)',
    ],
    contraindications: [
      'ostre infekcje skórne',
      'przyjmowanie leków (izotretynoina) – wymagane odczekanie po kuracji',
      'bardzo zaawansowany stan zapalny skóry – terapia ustalana indywidualnie',
      'ciąża i laktacja (część zabiegów niewskazana)',
      'choroby autoimmunologiczne (np. łuszczyca, toczeń – konsultacja przed zabiegiem)',
      'stosowanie silnych peelingów, retinolu, kwasów – należy odstawić min. 5–7 dni przed wizytą',
    ],
  },

  {
    id: 'service-redukcja-przebarwien',
    name: 'Redukcja przebarwień',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 120,
    isNext: true,
    description:
      'Zabieg rozjaśniający przebarwienia posłoneczne, hormonalne i pozapalne; wyrównanie kolorytu i wsparcie regeneracji.',
    forWho:
      'Osoby z nierównym kolorytem skóry, plamami pigmentacyjnymi, śladami po trądziku.',
    contraindications: [
      'Świeża opalenizna',
      'Ciąża i laktacja',
      'Aktywna opryszczka',
      'Choroby skóry (łuszczyca, AZS)',
      'Alergie na składniki złuszczające',
      'Bardzo wrażliwa skóra',
      'Nowotwory',
    ],
  },
  {
    id: 'service-zabieg-regeneracyjny',
    name: 'Zabieg regeneracyjny',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg odbudowujący barierę hydrolipidową, poprawiający nawilżenie, elastyczność i komfort skóry (kontynuacja terapii).',
    forWho: 'Cery suche, reaktywne, podrażnione, odwodnione.',
    contraindications: [
      'Czynne infekcje skóry',
      'Uczulenie na składniki',
      'Przerwana ciągłość naskórka',
      'Leczenie retinoidami doustnymi (odstęp 6 mies.)',
      'Ciąża i karmienie (zależnie od substancji)',
      'Aktywne stany zapalne',
      'Choroby autoimmunologiczne',
      'Silne peelingi/retinol/kwasy 5–7 dni przed',
    ],
  },
  {
    id: 'service-zabieg-regeneracyjny-dla-kobiet-w-ciazy',
    name: 'Zabieg regeneracyjny dla kobiet w ciąży',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Terapia skupiona na przywróceniu odpowiedniego poziomu nawilżenia, wzmocnieniu bariery ochronnej skóry i regeneracji naskórka – także dla osób w trakcie leczenia izotekiem i kobiet w ciąży.',
    forWho:
      'Dla cer odwodnionych, szarych, pozbawionych blasku lub osłabionych po silnych kuracjach, również dla przyszłych mam.',
    contraindications: [
      'Czynne stany zapalne',
      'Reakcje alergiczne na składniki kosmetyczne',
      'Świeże zabiegi laserowe lub złuszczające',
    ],
  },
  {
    id: 'service-dzialanie-przeciwstarzeniowe',
    name: 'Działanie przeciwstarzeniowe',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Zabieg anti-aging dopasowany do etapu terapii: regeneracja, ujędrnianie, poprawa owalu, nawilżenie i wsparcie kolagenu.',
    forWho:
      'Osoby z oznakami starzenia, spadkiem jędrności, zmarszczkami i zmęczoną cerą.',
    contraindications: [
      'Choroby nowotworowe',
      'Ciąża i karmienie',
      'Infekcje skóry',
      'Świeże opalanie',
      'Nadwrażliwość na składniki aktywne',
      'Opryszczka',
      'Leczenie retinoidami doustnymi (odstęp 6 mies.)',
      'Aktywne stany zapalne',
      'Choroby autoimmunologiczne',
      'Silne peelingi/retinol/kwasy 5–7 dni przed',
    ],
  },
  {
    id: 'service-zabieg-nawilzajacy-odbudowujacy',
    name: 'Zabieg nawilżający / odbudowujący',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: true,
    description:
      'Kontynuacja terapii skupionej na przywróceniu nawilżenia, wzmocnieniu bariery ochronnej i regeneracji naskórka (także dla kobiet w ciąży i osób w trakcie leczenia izotretynoiną).',
    forWho:
      'Cery odwodnione, szare, pozbawione blasku lub osłabione po silnych kuracjach.',
    contraindications: [
      'Czynne stany zapalne',
      'Reakcje alergiczne na składniki kosmetyczne',
      'Świeże zabiegi laserowe lub złuszczające',
    ],
  },
  {
    id: 'service-zabieg-oczyszczajacy',
    name: 'Zabieg oczyszczający',
    catalogCategory: 'Kosmetologia',
    price: 300,
    duration: 90,
    isNext: false,
    description:
      'Indywidualnie dobrana terapia głębokiego oczyszczenia porów, redukcji zaskórników i normalizacji pracy gruczołów łojowych.',
    forWho:
      'Skóra tłusta/mieszana z tendencją do zaskórników; skóra szara, ziemista, niedotleniona; łojotok, rozszerzone pory; każdy potrzebujący odświeżenia.',
    contraindications: [
      'Aktywna opryszczka',
      'Infekcje bakteryjne, wirusowe lub grzybicze skóry',
      'Otwarte rany, skaleczenia, świeże blizny',
      'Skóra po intensywnym opalaniu lub poparzeniu',
      'Leczenie retinoidami doustnymi (odstęp 6 mies.)',
      'Ciąża i karmienie piersią (w zależności od substancji)',
      'Aktywne stany zapalne (np. trądzik ropowiczy)',
      'Choroby autoimmunologiczne (np. łuszczyca, toczeń – konsultacja przed zabiegiem)',
      'Silne peelingi, retinol, kwasy – odstawić 5–7 dni przed',
    ],
  },
  // ONLINE
  {
    id: 'service-konsultacja-trychologiczna-online',
    name: 'Konsultacja trychologiczna online',
    catalogCategory: 'Online',
    price: 160,
    duration: 60,
    isNext: false,
    description:
      'Podczas konsultacji trychologicznej online przeprowadzany jest szczegółowy wywiad zdrowotny i pielęgnacyjny, analiza aktualnych objawów oraz nawyków pielęgnacyjnych, a także – jeśli to możliwe – ocena skóry głowy i włosów na podstawie przesłanych wcześniej zdjęć. Na tej podstawie opracowywany jest indywidualny plan pielęgnacji i terapii, dostosowany do Twoich potrzeb. W razie potrzeby przekazuję również zalecenia dotyczące dalszej diagnostyki laboratoryjnej lub konsultacji lekarskiej.',
    forWho:
      'Dla osób, które zauważają nadmierne wypadanie włosów, łysienie (telogenowe, androgenowe, plackowate i inne), osłabienie i przerzedzenie włosów, przetłuszczanie się skóry głowy, suchość, świąd lub łuszczenie skóry głowy, łupież, łojotok, stany zapalne, łuszczycę skóry głowy, uczucie napięcia, pieczenia lub swędzenia, problemy z odrostem włosów po ciąży, stresie, chorobie.',
    note: 'Konsultacja online to doskonałe rozwiązanie, jeśli nie możesz pojawić się osobiście, a chcesz uzyskać wskazówki, wsparcie w interpretacji wyników badań lub plan pielęgnacji domowej.',
    preparation: [
      'Przygotuj dobrej jakości zdjęcia skóry głowy i włosów (z różnych ujęć, w naturalnym świetle) – najlepiej dzień po myciu głowy',
      'Zapisz lub miej pod ręką listę kosmetyków, których obecnie używasz',
      'Jeśli posiadasz wyniki badań laboratoryjnych, przygotuj je do omówienia (można je wcześniej przesłać)',
      'Zadbaj o spokojne miejsce i stabilne połączenie internetowe',
    ],
    recommendedTests: [
      'Morfologia',
      'Ferrytyna',
      'Żelazo',
      'Witamina D3',
      'Witamina B12',
      'TSH, FT3, FT4 (panel tarczycowy)',
      'Glukoza i insulina',
      'OB, CRP',
      'GGTP',
      'Lipidogram',
    ],
  },
  {
    id: 'service-konsultacja-kosmetologiczna-online',
    name: 'Konsultacja kosmetologiczna online',
    catalogCategory: 'Online',
    price: 180,
    duration: 60,
    isNext: false,
    description:
      'To pierwszy krok do świadomej i skutecznej pielęgnacji skóry – bez wychodzenia z domu. Podczas konsultacji kosmetologicznej online przeprowadzam szczegółowy wywiad kosmetologiczny, analizę skóry na podstawie przesłanych zdjęć w świetle dziennym, omówienie aktualnej pielęgnacji i stylu życia, a następnie przygotowuję indywidualny plan pielęgnacji domowej oraz – jeśli to potrzebne – rekomendacje dalszej diagnostyki lub terapii gabinetowej.',
    forWho:
      'Dla każdego, kto chce poprawić wygląd i kondycję skóry, dobrać odpowiednią pielęgnację domową, zrozumieć przyczyny problemów skórnych (np. trądzik, przebarwienia, suchość, nadwrażliwość), uzyskać wsparcie kosmetologa.',
    note: 'Spotkanie online to doskonałe rozwiązanie dla osób, które chcą poprawić kondycję skóry, dobrać pielęgnację, zrozumieć przyczynę problemów lub przygotować się do późniejszej wizyty stacjonarnej. Jest to propozycja dla osób, które nie mają możliwości dotarcia stacjonarnie.',
    preparation: [
      'Zrób kilka zdjęć twarzy w świetle dziennym (bez makijażu): przód, profil, zbliżenie na problematyczne miejsca',
      'Przygotuj listę lub zdjęcia kosmetyków, których używasz',
      'Jeśli masz wyniki badań laboratoryjnych, możesz je przesłać przed spotkaniem',
      'Zadbaj o spokojne miejsce i stabilne połączenie internetowe',
    ],
    recommendedTests: [
      'Morfologia z rozmazem',
      'Ferrytyna',
      'Żelazo',
      'Witamina D3',
      'Witamina B12',
      'Glukoza',
      'Insulina',
      'TSH, FT3, FT4',
      'Lipidogram',
      'CRP',
      'OB',
      '(Opcjonalnie przy podejrzeniu zaburzeń hormonalnych – Testosteron, Androstendion, DHEA-S)',
    ],
    includes: [
      'indywidualny plan pielęgnacji domowej (krok po kroku)',
      'rekomendacje produktów dopasowanych do Twojej skóry',
      'wskazówki żywieniowe i stylu życia wspierające skórę',
      'ewentualne zalecenia do dalszej diagnostyki lub terapii gabinetowej',
    ],
  },
]

type ServicePublicMetadata = Pick<
  PublicService,
  | 'area'
  | 'category'
  | 'requiresPriorConsultation'
  | 'featured'
  | 'relatedServiceIds'
>

const COSMETOLOGY_CONSULTATION_ID =
  'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem' as const
const TRICHOLOGY_CONSULTATION_ID =
  'service-pierwsza-konsultacja-trychologiczna' as const

function getPublicMetadata(source: ServiceSource): ServicePublicMetadata {
  const isTrichology =
    source.catalogCategory === 'Trychologia' ||
    source.id === 'service-konsultacja-trychologiczna-online'
  const area: ServiceArea = isTrichology ? 'trichology' : 'cosmetology'
  const category: ServiceCategory =
    source.catalogCategory === 'Oprawa oka'
      ? 'eye-styling'
      : source.catalogCategory === 'Trychologia'
        ? 'trichology'
        : source.catalogCategory === 'Online'
          ? 'online'
          : 'cosmetology'
  const requiresPriorConsultation =
    source.isNext || source.id === 'service-lifting-rzes-farbka'
  const consultationId = isTrichology
    ? TRICHOLOGY_CONSULTATION_ID
    : COSMETOLOGY_CONSULTATION_ID
  const featuredIds: ServiceId[] = [
    COSMETOLOGY_CONSULTATION_ID,
    'service-oczyszczanie-wodorowe',
    TRICHOLOGY_CONSULTATION_ID,
    'service-zabieg-trychologiczny-dobrany-indywidualnie',
  ]

  return {
    area,
    category,
    requiresPriorConsultation,
    featured: featuredIds.includes(source.id),
    relatedServiceIds: requiresPriorConsultation
      ? [consultationId]
      : source.id === consultationId
        ? []
        : [consultationId],
  }
}

export const services: PublicService[] = serviceSources.map((source) => {
  const isOnline = source.catalogCategory === 'Online'
  return {
    ...source,
    ...getPublicMetadata(source),
    slug: source.id.replace(/^service-/, ''),
    shortDescription: source.description,
    isPublished: true,
    hasDetailPage: !isOnline,
  }
})

export function getServiceById(
  serviceId: ServiceId,
): PublicService | undefined {
  return services.find((service) => service.id === serviceId)
}

export function getServicesByArea(area: ServiceArea): PublicService[] {
  return services.filter((service) => service.area === area)
}

export function getPublishedServices(): PublicService[] {
  return services.filter((service) => service.isPublished)
}

export function getPublicServiceBySlug(
  area: ServiceArea,
  slug: string,
): PublicService | undefined {
  return services.find(
    (service) =>
      service.area === area && service.slug === slug && service.isPublished,
  )
}

export function getDetailServiceBySlug(
  area: ServiceArea,
  slug: string,
): PublicService | undefined {
  const service = getPublicServiceBySlug(area, slug)
  return service?.hasDetailPage ? service : undefined
}

export function getDetailServiceBySpecializationSlug(
  specializationId: ServiceSpecializationId,
  slug: string,
): PublicService | undefined {
  return services.find(
    (service) =>
      service.category === specializationId &&
      service.slug === slug &&
      service.isPublished &&
      service.hasDetailPage,
  )
}

export function getRelatedServices(service: PublicService): PublicService[] {
  return service.relatedServiceIds.flatMap((serviceId) => {
    const related = getServiceById(serviceId)
    return related?.isPublished ? [related] : []
  })
}

export function getPublicServicePath(
  service: PublicService,
): string | undefined {
  if (!service.isPublished || !service.hasDetailPage) return undefined
  const specializationPath =
    service.category === 'eye-styling'
      ? 'oprawa-oka'
      : service.area === 'cosmetology'
        ? 'kosmetologia'
        : 'trychologia'
  return `/${specializationPath}/${service.slug}`
}
