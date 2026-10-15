# Własne grafiki (kolejny etap)

Tutaj będzie można umieszczać własne sprite'y:
- `characters/` — animacje postaci / spritesheet PNG
- `terrain/` — kafelki terenu (np. grass.png, water.png, mountain.png)
- `buildings/` — domy, farmy, sklepy i inne budowle

Aktualnie obiekty rysowane są proceduralnie w `src/game/GameScene.ts`.
Aby dodać grafikę, użyj `this.load.image(...)` / `this.load.spritesheet(...)` w `preload()`
i renderuj ją obiektami Image/Sprite albo przez tilemapę w Phaserze.
Polecam kafelki 32x32 lub 48x48. Aktualna siatka logiczna gry ma CELL=20,
więc sprite'y należy odpowiednio skalować albo zmienić stałą CELL.
