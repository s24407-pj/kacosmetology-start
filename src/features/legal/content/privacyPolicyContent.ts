import type { BusinessProfile } from '@app-types/types'
import { getPrimarySalonLocation } from '@data/business'

export type PrivacyPolicyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: readonly string[] }

export interface PrivacyPolicySection {
  id: string
  title: string
  blocks: readonly PrivacyPolicyBlock[]
}

const formatAddress = (profile: BusinessProfile) => {
  const { address } = getPrimarySalonLocation(profile)
  return `${address.streetAddress}, ${address.postalCode} ${address.locality}`
}

/** Data wejścia w życie bieżącej wersji dokumentu (publiczna treść). */
export const PRIVACY_POLICY_EFFECTIVE_DATE = '15 września 2026 r.'

export function getPrivacyPolicySections(
  profile: BusinessProfile,
): readonly PrivacyPolicySection[] {
  const { brand, legalEntity } = profile
  const location = getPrimarySalonLocation(profile)
  const address = formatAddress(profile)

  return [
    {
      id: 'administrator',
      title: 'Administrator danych',
      blocks: [
        {
          type: 'paragraph',
          text: `Administratorem danych osobowych przetwarzanych w związku z korzystaniem z witryny ${brand.siteUrl} jest ${legalEntity.legalName} (indywidualna działalność gospodarcza), NIP ${legalEntity.nip}, REGON ${legalEntity.regon}, z siedzibą pod adresem ${address}.`,
        },
        {
          type: 'paragraph',
          text: `W sprawach ochrony danych osobowych możesz skontaktować się z nami e-mailem: ${brand.email} lub telefonicznie: ${location.phone}.`,
        },
      ],
    },
    {
      id: 'zakres',
      title: 'Zakres Polityki',
      blocks: [
        {
          type: 'paragraph',
          text: `Niniejsza Polityka prywatności opisuje zasady przetwarzania danych osobowych oraz stosowania plików cookies i podobnych technologii w serwisie internetowym ${brand.name} dostępnym pod adresem ${brand.siteUrl}.`,
        },
        {
          type: 'paragraph',
          text: 'Dokument dotyczy wyłącznie działań związanych z witryną. Nie zastępuje odrębnych informacji o przetwarzaniu danych w gabinecie (np. kartoteka klienta) ani polityk prywatności zewnętrznych dostawców usług, do których możesz zostać przekierowany.',
        },
      ],
    },
    {
      id: 'cele',
      title: 'Cele i podstawy prawne przetwarzania',
      blocks: [
        {
          type: 'paragraph',
          text: 'Przetwarzamy dane osobowe w następujących celach i na następujących podstawach prawnych (art. 6 ust. 1 RODO):',
        },
        {
          type: 'list',
          items: [
            `Kontakt e-mailowy lub telefoniczny zainicjowany przez Ciebie (m.in. poprzez odnośniki mailto i tel na stronie) — art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy / wykonanie umowy) lub lit. f (uzasadniony interes polegający na odpowiedzi na zapytanie).`,
            `Umożliwienie rezerwacji wizyty poprzez przekierowanie do zewnętrznego systemu Booksy (${location.bookingUrl}) — art. 6 ust. 1 lit. b RODO; dalsze przetwarzanie odbywa się u Booksy zgodnie z ich regulaminem i polityką prywatności.`,
            `Zapewnienie działania i bezpieczeństwa witryny oraz zapamiętanie Twoich wyborów dotyczących cookies (niezbędne pliki i podobne technologie) — art. 6 ust. 1 lit. f RODO (uzasadniony interes: sprawne i bezpieczne działanie serwisu).`,
            `Statystyka ruchu w ujęciu zbiorczym za pomocą cookieless Plausible Analytics (self-hosted) — art. 6 ust. 1 lit. f RODO (uzasadniony interes: zrozumienie, jak korzystacie z witryny, bez profilowania reklamowego).`,
            `Analityka z użyciem Google Analytics — wyłącznie po wyrażeniu zgody w banerze cookies (kategoria „Analityczne”) — art. 6 ust. 1 lit. a RODO.`,
            `Marketing i pomiar kampanii (Google Ads, Meta Pixel, OpenAI Pixel) — wyłącznie po wyrażeniu zgody (kategoria „Marketingowe”) — art. 6 ust. 1 lit. a RODO.`,
          ],
        },
      ],
    },
    {
      id: 'kategorie',
      title: 'Kategorie danych',
      blocks: [
        {
          type: 'paragraph',
          text: 'W zależności od tego, jak korzystasz z witryny, możemy przetwarzać:',
        },
        {
          type: 'list',
          items: [
            'Dane podane w korespondencji e-mail lub rozmowie telefonicznej (np. imię, treść zapytania, numer telefonu, adres e-mail).',
            'Dane techniczne związane z wizytą na stronie (np. adres IP w logach serwera, typ przeglądarki, przybliżona lokalizacja na poziomie zagregowanym — w zakresie wynikającym z konfiguracji narzędzi).',
            'Identyfikatory cookies i podobnych technologii oraz zdarzenia analityczne/marketingowe — gdy wyrazisz na to zgodę.',
            'Parametry atrybucji kampanii przechowywane w sessionStorage przeglądarki (np. utm_*, gclid, fbclid, referrer) na potrzeby powiązania działań rezerwacyjnych z kampanią — bez osobnego konta użytkownika na stronie.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Na stronie nie prowadzimy kont użytkowników, formularza kontaktowego ani newslettera. Nie zbieramy danych wyłącznie przez pola formularza w witrynie.',
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies i podobne technologie',
      blocks: [
        {
          type: 'paragraph',
          text: 'Witryna korzysta z plików cookies oraz podobnych technologii. Kategorie odpowiadają ustawieniom w banerze zgód:',
        },
        {
          type: 'list',
          items: [
            'Niezbędne — zawsze aktywne. Obejmują m.in. zapis Twojej decyzji o zgodach w localStorage przeglądarki (klucz kacosmetology.consent), wymagany do działania mechanizmu zgód.',
            'Analityczne — Google Analytics. Skrypt Google tag ładuje się po zgodzie „Analityczne” lub „Marketingowe”; pomiar analityczny działa po zgodzie „Analityczne”.',
            'Marketingowe — Google Ads (ten sam Google tag co Analytics), Meta Pixel oraz OpenAI Pixel. Funkcje reklamowe Google oraz pixele Meta/OpenAI działają po zgodzie „Marketingowe”.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Niezależnie od kategorii zgód uruchamiamy cookieless Plausible Analytics (hostowane pod analytics.mflisik.ovh), które nie ustawia cookies reklamowych i służy do zagregowanej statystyki odwiedzin.',
        },
        {
          type: 'paragraph',
          text: 'Zgody możesz w każdej chwili zmienić lub cofnąć poprzez „Zarządzaj cookies” w stopce strony. Cofnięcie wcześniej udzielonej zgody na analitykę lub marketing może wymagać ponownego załadowania strony, aby wyłączyć już uruchomione skrypty.',
        },
      ],
    },
    {
      id: 'odbiorcy',
      title: 'Odbiorcy danych i narzędzia zewnętrzne',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dane mogą być powierzane lub udostępniane dostawcom usług wspierających działanie witryny i pomiar, w szczególności:',
        },
        {
          type: 'list',
          items: [
            'dostawcy hostingu i infrastruktury serwerowej witryny,',
            'Plausible Analytics (self-hosted) — statystyka ruchu,',
            'Google (Google Analytics) — po zgodzie na cookies analityczne,',
            'Google (Google Ads) — po zgodzie na cookies marketingowe,',
            'Meta Platforms — po zgodzie na cookies marketingowe,',
            'OpenAI — po zgodzie na cookies marketingowe,',
            `Booksy — gdy korzystasz z rezerwacji online (${location.bookingUrl}); Booksy jest niezależnym administratorem lub podmiotem przetwarzającym w zakresie własnej usługi.`,
          ],
        },
        {
          type: 'paragraph',
          text: 'Część dostawców (w szczególności Google, Meta, OpenAI) może przetwarzać dane poza Europejskim Obszarem Gospodarczym, w tym w USA. W takich przypadkach stosowane są mechanizmy przewidziane prawem — m.in. EU–US Data Privacy Framework (DPF) oraz standardowe klauzule umowne (SCC) — o ile wynikają ze statusu dostawcy, umów i ich dokumentacji.',
        },
      ],
    },
    {
      id: 'okres',
      title: 'Okres przechowywania',
      blocks: [
        {
          type: 'list',
          items: [
            'Decyzja o cookies — do czasu zmiany lub cofnięcia zgody albo wyczyszczenia danych lokalnych przeglądarki; przy zmianie wersji Polityki zgód wcześniejsza decyzja może zostać unieważniona.',
            'Parametry atrybucji w sessionStorage — do zamknięcia sesji przeglądarki lub wyczyszczenia pamięci sesji.',
            'Korespondencja e-mail / zapisy rozmów — przez czas potrzebny do obsługi sprawy, a następnie przez okres wynikający z przedawnienia roszczeń lub obowiązków prawnych.',
            'Dane w Booksy — zgodnie z polityką i umową Booksy.',
            'Dane w narzędziach analitycznych i marketingowych — zgodnie z konfiguracją tych narzędzi oraz okresem obowiązywania Twojej zgody.',
          ],
        },
      ],
    },
    {
      id: 'prawa',
      title: 'Twoje prawa',
      blocks: [
        {
          type: 'paragraph',
          text: 'Przysługują Ci prawa wynikające z RODO, w tym prawo do:',
        },
        {
          type: 'list',
          items: [
            'dostępu do danych,',
            'sprostowania danych,',
            'usunięcia danych („prawo do bycia zapomnianym”),',
            'ograniczenia przetwarzania,',
            'przenoszenia danych,',
            'sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie,',
            'cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania sprzed cofnięcia),',
            'wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).',
          ],
        },
        {
          type: 'paragraph',
          text: `Aby skorzystać z praw, napisz na ${brand.email} lub zadzwoń pod ${location.phone}.`,
        },
      ],
    },
    {
      id: 'zautomatyzowane-decyzje',
      title: 'Zautomatyzowane podejmowanie decyzji',
      blocks: [
        {
          type: 'paragraph',
          text: 'Dane przetwarzane w związku z witryną nie służą do podejmowania decyzji opartych wyłącznie na zautomatyzowanym przetwarzaniu, w tym profilowaniu, które wywoływałyby wobec Ciebie skutki prawne lub w podobny sposób istotnie na Ciebie wpływały (art. 13 ust. 2 lit. f RODO).',
        },
      ],
    },
    {
      id: 'dobrowolnosc',
      title: 'Dobrowolność podania danych',
      blocks: [
        {
          type: 'paragraph',
          text: 'Korzystanie z witryny i przeglądanie oferty nie wymaga podania danych osobowych. Podanie danych przy kontakcie lub rezerwacji jest dobrowolne, ale może być konieczne do odpowiedzi na zapytanie albo umówienia wizyty. Zgoda na cookies analityczne i marketingowe jest dobrowolna i nie jest warunkiem przeglądania treści strony.',
        },
      ],
    },
    {
      id: 'zmiany',
      title: 'Zmiany Polityki',
      blocks: [
        {
          type: 'paragraph',
          text: `Aktualna wersja Polityki prywatności obowiązuje od ${PRIVACY_POLICY_EFFECTIVE_DATE} W razie istotnych zmian zaktualizujemy treść tej strony. W przypadku zmiany wersji mechanizmu zgód cookies wcześniejsze wybory mogą zostać unieważnione, a baner pojawi się ponownie.`,
        },
      ],
    },
  ]
}
