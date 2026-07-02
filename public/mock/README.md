# Demo medication images

Drop generated image files into this folder using the **exact** filenames below.
They are wired into the demo via `src/lib/demoImages.ts`. Until a file exists the UI
falls back gracefully (emoji / shape placeholder or hidden image), so nothing breaks
while the files are missing.

| Filename             | What goes there                                   | Shows up in                                                                 |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `dose-pouch.jpg`     | 약봉지 복약 사진 (a medication pouch)              | CameraPage 예시 quick-pick; Done / Dashboard / Gallery (봉지 dose photo)    |
| `dose-organizer.jpg` | 약통(칸) — pill organizer with compartments       | CameraPage 예시 quick-pick; Gallery / Dashboard (칸 dose photo)             |
| `pill-white.svg`     | 흰색 동그란 약 (a single white round pill)         | MedicationPhotoPage / DosePage pill list (흰색 동그란 약)                    |
| `pill-yellow.svg`    | 노란색 긴 약 (a single yellow oval pill)           | MedicationPhotoPage / DosePage pill list (노란색 긴 약)                      |
| `pill-blue.svg`      | 파란색 캡슐 (a single blue capsule)                | MedicationPhotoPage / DosePage pill list (파란색 캡슐)                       |
| `pill-placeholder.svg` | 기본 약 이미지 placeholder                       | Missing medication image fallback                                           |
| `taken.jpg`          | 빈 봉지 + 물컵 (empty pouch next to a water glass) | Gallery / Dashboard (완료된 dose photo)                                     |

Notes:
- Any image format the browser can render works; the demo paths currently use `.jpg` for pouch photos and `.svg` for pill illustrations.
- Recommended: roughly square, ~640px, small enough for a quick demo load.
- No files are committed here — this README just documents the expected drop-in names.
