# AI Civilization 3.3 — klimat, mieszkańcy i wojny

## Start
Otwórz katalog projektu w PowerShell (nie `C:\Windows\System32`):

```powershell
npm.cmd install --include=dev
npm.cmd run build
npm.cmd run dev
```

## Zmiany
- Mieszkańca można wybrać na mapie i wydać mu rozkaz pójścia do domu albo gaszenia pożaru.
- Rozmnażanie można włączać i wyłączać. Przy suszy nie pada, wysychają brzegi wód i rozszerza się pustynia.
- Państwa mają wyraźne kolory, a wojna jest oznaczona na mapie i w panelu dyplomacji.
- Usunięto koszary, farmy i rynek z gry; pozostały domy jako schronienie oraz pola jako naturalny teren do zbiorów.
- Drogi i mosty używają przezroczystych skórek z załączników; przezroczyste drzewa leżą na zwykłym podłożu, a kamienne kafelki nie dostają dodatkowego trójkąta.
- Mieszkańcy przy niskiej energii idą do pola sąsiadującego z domem, następnie znikają, odpoczywają i wychodzą przed drzwi; można sprawdzić ich obecność w panelu domów.
- Domy są nieprzechodnie i obowiązuje odstęp między budynkami.
- Głód, epidemia i pożar zwiększają realną śmiertelność. Płonący NPC umiera po około 15 krokach symulacji (~5,25 s przy 1x).
- Gaszenie jest ograniczone i wymaga wielu prób. Ogień rozchodzi się na sąsiednie łatwopalne pola.
- Klany bez żywych mieszkańców są usuwane z symulacji po upływie dnia.
- Koty i psy wykorzystują kadry wycięte z dostarczonych plansz. Są to różne pozy/odmiany, a nie profesjonalne sekwencje ruchu: efekt klatkowy wymaga przyszłego sprite sheeta.
- **Zwierzęta (3.3):** każdy kot/pies ma stałą rasę (kadry arkusza to różne rasy, wcześniej animacja je przełączała). Ruch = lekkie podskoki. Kadry oczyszczone z okruchów sąsiednich kadrów i dziur przezroczystości (oryginały: `*-sheet.orig.png`).
- **Tekstury terenu:** trawa, woda (przesuwana fazowo = efekt płynięcia), piasek i kamień z dostarczonych plansz, jako atlasy 16×16 kafelków (`public/assets/terrain/*-atlas.png`). Trawa była próbkowana i zredukowana do palety, co usuwa znak wodny Adobe Stock.
- **Wydajność:** teren rysowany do RenderTexture tylko przy zmianie mapy; wyszukiwanie budynków w `passable()` przez Set; UI odświeżane tylko gdy symulacja działa; wykres memoizowany.

## Ważne
Prawa do wykorzystania przesłanych grafik w publicznym repozytorium należy potwierdzić przed publikacją.
