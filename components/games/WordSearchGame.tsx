"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Mufradat } from "@/lib/content";
import { normaliseArabic } from "@/lib/arabic";
import { saveProgress } from "@/lib/progress";

type Cell = { row: number; col: number };
type Puzzle = { grid: string[][] };

const LETTERS = Array.from("ابتثجحخدذرزسشصضطظعغفقكلمنهويهة");

function makePuzzle(words: Mufradat[]): Puzzle {
  const size = 10;
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const directions = [
    { dr: 0, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: -1 }
  ];
  const terms = words
    .map((word) => normaliseArabic(word.tanpa_harakat || word.arab))
    .filter((word) => word.length > 0 && word.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const term of terms) {
    let placed = false;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const cells: Cell[] = [];
      let valid = true;
      for (let i = 0; i < term.length; i++) {
        const r = row + direction.dr * i;
        const c = col + direction.dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { valid = false; break; }
        if (grid[r][c] && grid[r][c] !== term[i]) { valid = false; break; }
        cells.push({ row: r, col: c });
      }
      if (valid) {
        cells.forEach((cell, i) => { grid[cell.row][cell.col] = term[i]; });
        placed = true;
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
  }
  return { grid };
}

export function WordSearchGame({ words, babId }: { words: Mufradat[]; babId: string }) {
  const puzzle = useMemo(() => makePuzzle(words), [words]);
  const [selected, setSelected] = useState<Cell[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<Cell[][]>([]);
  const [feedback, setFeedback] = useState("Pilih huruf sesuai urutan kata. Kata mendatar dibaca dari kanan ke kiri.");
  const startedAt = useRef(Date.now());
  const saved = useRef(false);
  const targets = useMemo(() => words.map((word) => ({
    id: word.id,
    value: normaliseArabic(word.tanpa_harakat || word.arab),
    clue: `${word.emoji} ${word.arti}`
  })), [words]);

  useEffect(() => {
    if (found.length === targets.length && targets.length > 0 && !saved.current) {
      saved.current = true;
      setFeedback("Selesai! Semua kata ditemukan. Jika akun dan database aktif, skor akan disimpan.");
      void saveProgress({ babId, game: "wordsearch", score: 100, seconds: (Date.now() - startedAt.current) / 1000 });
    }
  }, [found, targets.length, babId]);

  function chooseCell(row: number, col: number) {
    const cell = { row, col };
    const next = [...selected, cell];
    const candidate = next.map((point) => puzzle.grid[point.row][point.col]).join("");
    const target = targets.find((item) => item.value === candidate && !found.includes(item.id));
    if (target) {
      setFound((previous) => [...previous, target.id]);
      setFoundPaths((previous) => [...previous, next]);
      setSelected([]);
      setFeedback(`Benar! ${target.clue.replace(/^[^ ]+ /, "")} ditemukan.`);
      return;
    }
    const hasPrefix = targets.some((item) => !found.includes(item.id) && item.value.startsWith(candidate));
    if (hasPrefix) {
      setSelected(next);
      setFeedback("Teruskan memilih huruf berikutnya.");
    } else {
      const firstLetter = puzzle.grid[row][col];
      const startsAnother = targets.some((item) => !found.includes(item.id) && item.value.startsWith(firstLetter));
      setSelected(startsAnother ? [cell] : []);
      setFeedback("Belum cocok. Coba dari arah kanan ke kiri, menurun, atau diagonal.");
    }
  }

  const isSelected = (row: number, col: number) => selected.some((cell) => cell.row === row && cell.col === col);
  const isFound = (row: number, col: number) => foundPaths.some((path) => path.some((cell) => cell.row === row && cell.col === col));

  return (
    <div className="game-stack">
      <div className="notice">Grid 10×10. Pilih huruf berurutan; kata mendatar dimulai dari sisi kanan. Harakat tidak ditampilkan di grid.</div>
      <div className="wordsearch-layout">
        <div className="wordsearch-grid" role="group" aria-label="Grid pencari kata">
          {puzzle.grid.map((row, r) => row.map((letter, c) => (
            <button
              type="button"
              key={`${r}-${c}`}
              className={`letter-cell ${isSelected(r, c) ? "letter-cell-selected" : ""} ${isFound(r, c) ? "letter-cell-found" : ""}`}
              onClick={() => chooseCell(r, c)}
              aria-label={`Baris ${r + 1}, kolom ${c + 1}, huruf ${letter}`}
            >
              <span lang="ar" dir="rtl">{letter}</span>
            </button>
          )))}
        </div>
        <aside className="word-bank">
          <h3>Cari kata berikut</h3>
          {targets.map((target) => (
            <div key={target.id} className={`word-bank-item ${found.includes(target.id) ? "word-bank-found" : ""}`}>
              <span>{found.includes(target.id) ? "✓" : "○"}</span>
              <span>{target.clue}</span>
            </div>
          ))}
          <p className="small muted">{found.length} dari {targets.length} kata ditemukan</p>
        </aside>
      </div>
      <p className="game-feedback" role="status">{feedback}</p>
      <button className="button button-soft" onClick={() => {
        setSelected([]);
        setFound([]);
        setFoundPaths([]);
        setFeedback("Mulai lagi. Cari kata mendatar kanan-ke-kiri, menurun, atau diagonal.");
        startedAt.current = Date.now();
        saved.current = false;
      }}>Reset pilihan</button>
    </div>
  );
}
