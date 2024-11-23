const randomQuote =
  scientistQuotes[Math.floor(Math.random() * scientistQuotes.length)];
document.querySelector(".quotes").textContent = randomQuote.quote;
document.querySelector(".quoteAuthor").textContent = randomQuote.author;
// document.querySelector(".dateQuoted").textContent = randomQuote.date;
document.querySelector(".authorField").textContent = randomQuote.field;
