// Single source of truth for demo medication image paths.
// Vite serves `public/` at the site root, so these resolve to `public/mock/<file>`.
// The pill images are dropped in by hand for the demo; until then the UI falls back
// gracefully (see the DemoImage component), so a missing file never breaks the app.

// One entry per day of a real 7-day "복용 완료(taken)" 인증 photo set: first-person
// smartphone photos of emptied medicine pouches. day7 is the most recent.
export type DemoDay = {
  id: string;
  path: string;
  mgmtNo: string; // 관리번호
  slot: '아침' | '점심' | '저녁';
  takenAtLabel: string; // '6월 26일 오전 8:10'
  status: 'taken';
};

export const DEMO_DAYS: readonly DemoDay[] = [
  { id: 'day1', path: '/mock/day1.jpg', mgmtNo: '001-A', slot: '아침', takenAtLabel: '6월 26일 오전 8:10', status: 'taken' },
  { id: 'day2', path: '/mock/day2.jpg', mgmtNo: '002-A', slot: '점심', takenAtLabel: '6월 27일 오후 12:40', status: 'taken' },
  { id: 'day3', path: '/mock/day3.jpg', mgmtNo: '003-A', slot: '저녁', takenAtLabel: '6월 28일 오후 7:30', status: 'taken' },
  { id: 'day4', path: '/mock/day4.jpg', mgmtNo: '004-A', slot: '아침', takenAtLabel: '6월 29일 오전 8:10', status: 'taken' },
  { id: 'day5', path: '/mock/day5.jpg', mgmtNo: '005-A', slot: '점심', takenAtLabel: '6월 30일 오후 12:40', status: 'taken' },
  { id: 'day6', path: '/mock/day6.jpg', mgmtNo: '006-A', slot: '저녁', takenAtLabel: '7월 1일 오후 7:30', status: 'taken' },
  { id: 'day7', path: '/mock/day7.jpg', mgmtNo: '007-B', slot: '저녁', takenAtLabel: '7월 2일 오후 7:30', status: 'taken' },
] as const;

// Kept for backward compatibility with existing consumers; re-pointed at real
// pouch images from the 7-day set. pill* paths stay as-is (no files provided yet).
export const DEMO_IMG = {
  dosePouch: DEMO_DAYS[0].path, // pouch photo (day1)
  doseOrganizer: '/mock/day3.jpg', // pouch photo (day3)
  pillWhite: '/mock/pill-white.jpg',
  pillYellow: '/mock/pill-yellow.jpg',
  pillBlue: '/mock/pill-blue.jpg',
  taken: '/mock/day4.jpg', // taken/emptied pouch photo (day4)
} as const;
