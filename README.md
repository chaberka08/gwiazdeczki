# AI Civilization 3.1 – poprawiona wersja eksperymentalna

Projekt React + TypeScript + Phaser 3.

## Instalacja Windows PowerShell

Rozpakuj projekt **poza OneDrive**, np. `C:\Projects\AI-Civilization-3-Fixed`. Otwórz dokładnie ten folder w VS Code.

```powershell
npm.cmd install --include=dev
npm.cmd run build
npm.cmd run dev
```

Otwórz adres wyświetlony przez Vite. Jeśli `npm run build` pokazuje błąd, prześlij jego pełną treść.

## Poprawki 3.1

- Budowa blokuje nakładanie się budynków i wymusza odstęp co najmniej 1 wolnego kafelka.
- Wolniejszy rozwój: niższa populacja początkowa, rzadsze narodziny i kontrola kosztów i odstępu rozbudowy.
- Pożary zapalają drzewa, uprawy i budynki, niszczą obiekty i mogą rozprzestrzeniać się zależnie od pogody.
- Mieszkańcy w pobliżu pożaru uciekają lub próbują go gasić w zależności od cech i roli.
- Ulepszona transmisja epidemii i czasowa odporność po wyzdrowieniu.
- Render postaci i zwierząt używa płynnej interpolacji do kolejnej pozycji logicznej.
- Prawdziwy przesłany sprite drzewa, przesłane arkusze postaci, odrębne grafiki obiektów budynków stworzone na potrzeby projektu.
- Edytor map, dyplomacja, zwierzęta, zapis/wczytywanie pozostają z wersji 3.0.

## Ważne ograniczenia

To wersja rozwojowa. Animacja ruchu jest wygładzona wizualnie, ale nadal oparta na siatce; ogień i epidemia używają uproszczonych algorytmów. Pełna kompilacja UI nie została potwierdzona w środowisku budowania z powodu niedostępności pakietów npm. Silnik TypeScript został skompilowany i przetestowany niezależnie. Kot i pies korzystają z tymczasowych sprite'ów; nie umieszczamy stockowych grafik ze znakami wodnymi w publicznej paczce.

Nie nadpisuj swojego starego katalogu przed przetestowaniem tej wersji.
