"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import type { Mufradat } from "@/lib/content";
import { saveProgress } from "@/lib/progress";
import { ArabicText } from "@/components/arabic-text";

type Card = {
  id: string;
  pairId: string;
  type: "picture" | "word";
  emoji: string;
  arab: string;
  arti: string;
};

function shuffle<T,>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(words: Mufradat[]): Card[] {
  return shuffle(words.flatMap((word) => [
    { id: `${word.id}-picture`, pairId: word.id, type: "picture" as const, emoji: word.emoji, arab: word.arab, arti: word.arti },
    { id: `${word.id}-word`, pairId: word.id, type: "word" as const, emoji: word.emoji, arab: word.arab, arti: word.arti }
  ]));
}

function speakArabic(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  window.speechSynthesis.speak(utterance);
}

export function MemoryGame({ words, babId }: { words: Mufradat[]; babId: string }) {
  const [cards, setCards] = useState<Card[]>(() => createDeck(words));
  const [selected, setSelected] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const startedAt = useRef(Date.now());
  const saved = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (matched.length === words.length && words.length > 0 && !saved.current) {
      saved.current = true;
      void saveProgress({
        babId,
        game: "memory",
        score: 100,
        seconds: (Date.now() - startedAt.current) / 1000
      });
      setNotice("Hebat! Semua pasangan berhasil ditemukan. Jika akun dan database aktif, skor dikirim untuk disimpan.");
    }
  }, [matched, words.length, babId]);

  function choose(card: Card) {
    if (matched.includes(card.pairId) || selected.includes(card.id) || selected.length >= 2) return;
    const next = [...selected, card.id];
    setSelected(next);
    if (next.length === 2) {
      const first = cards.find((item) => item.id === next[0]);
      if (first?.pairId === card.pairId) {
        setMatched((previous) => [...previous, card.pairId]);
        setSelected([]);
      } else {
        timer.current = setTimeout(() => setSelected([]), 850);
      }
    }
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    setCards(createDeck(words));
    setSelected([]);
    setMatched([]);
    setNotice("");
    saved.current = false;
    startedAt.current = Date.now();
  }

  return (
    <div className="game-stack">
      <div className="game-toolbar">
        <p>Pasangan ditemukan: <strong>{matched.length} / {words.length}</strong></p>
        <button className="button button-soft" onClick={restart}><RotateCcw size={16} /> Ulangi</button>
      </div>
      <div className="memory-grid">
        {cards.map((card) => {
          const isOpen = selected.includes(card.id) || matched.includes(card.pairId);
          return (
            <button
              type="button"
              key={card.id}
              className={`memory-card ${isOpen ? "memory-card-open" : ""} ${matched.includes(card.pairId) ? "memory-card-matched" : ""}`}
              onClick={() => choose(card)}
              aria-label={isOpen ? (card.type === "picture" ? card.arti : card.arab) : "Kartu tertutup"}
              aria-pressed={isOpen}
            >
              {isOpen ? (
                card.type === "picture" ? (
                  <><span className="memory-emoji" aria-hidden="true">{card.emoji}</span><span className="memory-meaning">{card.arti}</span></>
                ) : (
                  <><ArabicText className="memory-arabic">{card.arab}</ArabicText><span className="memory-meaning">{card.arti}</span></>
                )
              ) : <span className="memory-back" aria-hidden="true">؟</span>}
            </button>
          );
        })}
      </div>
      <div className="word-audio-list">
        {words.map((word) => (
          <div className="audio-word" key={word.id}>
            <span>{word.emoji} {word.arti}</span>
            <ArabicText>{word.arab}</ArabicText>
            <button className="icon-button" type="button" onClick={() => speakArabic(word.arab)} aria-label={`Dengarkan ${word.arti}`} title="Dengarkan pelafalan"><Volume2 size={18} /></button>
          </div>
        ))}
      </div>
      {matched.length === words.length && <div className="notice notice-success"><strong>⭐ Luar biasa!</strong> Kamu menemukan semua pasangan.</div>}
      {notice && <p className="small muted" role="status">{notice}</p>}
    </div>
  );
}
