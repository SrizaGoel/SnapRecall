import { quotes } from "../constants/quotes";

export const getDailyQuote = () => {
  const startDate = new Date("2026-07-04"); // Any fixed date

  const today = new Date();

  const daysPassed = Math.floor(
    (today - startDate) / (1000 * 60 * 60 * 24)
  );

  return quotes[daysPassed % quotes.length];
};