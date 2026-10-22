"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mufradat } from "@/lib/content";
import { normaliseArabic } from "@/lib/arabic";
import { saveProgress } from "@/lib/progress";

type Entry = { id: string; answer: string; clue: string; emoji: string; arti: string };
type Placement = Entry & { row: number; col: number; horizontal: boolean };
type Puzzle = { size: number; grid: string[][]; placements: Placement[] };

function canPlace(grid: string[][], word: string, row: number, col: number, horizontal: boolean, requireCross = true) {
  const size = grid.length;
  let overlaps = 0;
  for (let i = 0; i < word.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col - i : col;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const current = grid[r][c];
    if (current && current !== word[i]) return false;
    if (current === word[i]) overlaps++;
    if (!current) {
      if (horizontal && ((r > 0 && grid[r - 1][c]) || (r < size - 1 && grid[r + 1][c]))) return false;
      if (!horizontal && ((c > 0 && grid[r][c - 1]) || (c < size - 1 && grid[r][c + 1]))) return false;
    }
  }
  const beforeRow = horizontal ? row : row - 1;
  const beforeCol = horizontal ? col + 1 : col;
  const afterRow = horizontal ? row : row + word.length;
  const afterCol = horizontal ? col - word.length : col;
  if (beforeRow >= 0 && beforeRow < size && beforeCol >= 0 && beforeCol < size && grid[beforeRow][beforeCol]) return false;
  if (afterRow >= 0 && afterRow < size && afterCol >= 0 && afterCol < size && grid[afterRow][afterCol]) return false;
  return requireCross ? overlaps === 1 : overlaps === 0;
}

function writeWord(grid: string[][], word: string, row: number, col: number, horizontal: boolean) {
  for (let i = 0; i < word.length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col - i : col;
    grid[r][c] = word[i];
  }
}

function buildCrossword(words: Mufradat[]): Puzzle {
  const size = 15;
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const entries: Entry[] = words
    .map((word) => ({
      id: word.id,
      answer: normaliseArabic(word.tanpa_harakat || word.arab),
      clue: `${word.emoji} ${word.arti}`,
      emoji: word.emoji,
      arti: word.arti
    }))
    .filter((word) => word.answer.length > 1 && word.answer.length <= 9)
    .sort((a, b) => b.answer.length - a.answer.length)
    .slice(0, 9);

  const placements: Placement[] = [];
  const first = entries[0];
  if (first) {
    const row = Math.floor(size / 2);
    const col = Math.floor(size / 2) + first.answer.length - 1;
    writeWord(grid, first.answer, row, col, true);
    placements.push({ ...first, row, col, horizontal: true });
  }

  for (const entry of entries.slice(1)) {
    let placed = false;
    for (const existing of placements) {
      if (placed) break;
      for (let k = 0; k < existing.answer.length && !placed; k++) {
        const er = existing.horizontal ? existing.row : existing.row + k;
        const ec = existing.horizontal ? existing.col - k : existing.col;
        const letter = existing.answer[k];
        for (let i = 0; i < entry.answer.length && !placed; i++) {
          if (entry.answer[i] !== letter) continue;
          const horizontal = !existing.horizontal;
          const row = horizontal ? er : er - i;
          const col = horizontal ? ec + i : ec;
          if (canPlace(grid, entry.answer, row, col, horizontal, true)) {
            writeWord(grid, entry.answer, row, col, horizontal);
            placements.push({ ...entry, row, col, horizontal });
            placed = true;
          }
        }
      }
    }
  }
  return { size, grid, placements };
}

const ARABIC_KEYS = Array.from("ابتثجحخدذرزسشصضطظعغفقكلمنهوي");

export function CrosswordGame({ words, babId }: { words: Mufradat[]; babId: string }) {
  const puzzle = useMemo(() => buildCrossword(words), [words]);
  const [activeId, setActiveId] = useState(puzzle.placements[0]?.id ?? "");
  const [answer, setAnswer] = useState("");
  const [solved, setSolved] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("Pilih petunjuk, susun jawaban menggunakan papan huruf Arab, lalu periksa.");
  const startedAt = useRef(Date.now());
  const saved = useRef(false);
  const active = puzzle.placements.find((entry) => entry.id === activeId);

  useEffect(() => {
    if (puzzle.placements.length > 0 && solved.length === puzzle.placements.length && !saved.current) {
      saved.current = true;
      setFeedback("Semua petunjuk terjawab. Jika akun dan database aktif, skor akan dikirim untuk disimpan.");
      void saveProgress({ babId, game: "tts", score: 100, seconds: (Date.now() - startedAt.current) / 1000 });
    }
  }, [solved, puzzle.placements.length, babId]);

  function selectEntry(id: string) {
    setActiveId(id);
    setAnswer("");
    setFeedback("Gunakan tombol huruf Arab di bawah untuk menjawab petunjuk.");
  }

  function checkAnswer() {
    if (!active) return;
    if (normaliseArabic(answer) === active.answer) {
      setSolved((previous) => previous.includes(active.id) ? previous : [...previous, active.id]);
      setFeedback(`Benar! ${active.arti}.`);
      const next = puzzle.placements.find((entry) => !solved.includes(entry.id) && entry.id !== active.id);
      if (next) {
        setActiveId(next.id);
        setAnswer("");
      }
    } else {
      setFeedback("Belum tepat. Periksa huruf dan coba lagi.");
    }
  }

  const isRevealed = (row: number, col: number) => puzzle.placements.some((entry) => {
    if (!solved.includes(entry.id)) return false;
    return Array.from(entry.answer).some((_, i) =>
      (entry.horizontal ? entry.row === row && entry.col - i === col : entry.row + i === row && entry.col === col)
    );
  });

  return (
    <div className="game-stack">
      <div className="notice">Grid silang dibuat otomatis dari mufradat bab. Pilih petunjuk untuk mengisi jawaban. Huruf pada grid ditampilkan tanpa harakat.</div>
      {puzzle.placements.length < 3 && (
        <div className="notice notice-warn">Jumlah persilangan yang terbentuk sedikit untuk bab ini. Tambahkan mufradat yang memiliki beberapa huruf sama agar grid lebih kaya.</div>
      )}
      <div className="crossword-grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }} aria-label="Papan teka-teki silang">
        {puzzle.grid.map((row, r) => row.map((letter, c) => (
          <div key={`${r}-${c}`} className={`crossword-cell ${letter ? "crossword-cell-active" : ""} ${isRevealed(r, c) ? "crossword-cell-revealed" : ""}`}>
            {letter && isRevealed(r, c) ? <span lang="ar" dir="rtl">{letter}</span> : ""}
          </div>
        )))}
      </div>

      <div className="crossword-clues">
        <h3>Petunjuk</h3>
        {puzzle.placements.map((entry, index) => (
          <button
            type="button"
            key={entry.id}
            className={`clue-button ${activeId === entry.id ? "clue-button-active" : ""} ${solved.includes(entry.id) ? "clue-button-solved" : ""}`}
            onClick={() => selectEntry(entry.id)}
          >
            <span className="clue-number">{index + 1}</span>
            <span>{entry.clue}</span>
            <span>{solved.includes(entry.id) ? "✓" : ""}</span>
          </button>
        ))}
      </div>

      {active && (
        <section className="answer-panel">
          <p className="muted small">Jawab petunjuk: <strong>{active.clue}</strong></p>
          <div className="answer-row">
            <input
              aria-label="Jawaban dalam huruf Arab"
              dir="rtl"
              lang="ar"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="اكتب هنا"
            />
            <button className="button button-primary" onClick={checkAnswer}>Periksa</button>
          </div>
          <div className="arabic-keyboard" aria-label="Papan huruf Arab">
            {ARABIC_KEYS.map((letter) => (
              <button key={letter} type="button" onClick={() => setAnswer((value) => value + letter)} lang="ar" dir="rtl">{letter}</button>
            ))}
            <button type="button" className="key-delete" onClick={() => setAnswer((value) => Array.from(value).slice(0, -1).join(""))}>⌫</button>
            <button type="button" className="key-delete" onClick={() => setAnswer("")}>Hapus</button>
          </div>
        </section>
      )}
      <p className="game-feedback" role="status">{feedback}</p>
      <p className="small muted">Terjawab: {solved.length} / {puzzle.placements.length}</p>
    </div>
  );
}
