export type GameType = "memory" | "tts" | "wordsearch";

export async function saveProgress(input: {
  babId: string;
  game: GameType;
  score: number;
  seconds: number;
}): Promise<boolean> {
  try {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bab_id: input.babId,
        jenis_game: input.game,
        skor: Math.max(0, Math.min(100, Math.round(input.score))),
        waktu: Math.max(0, Math.min(86400, Math.round(input.seconds)))
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
