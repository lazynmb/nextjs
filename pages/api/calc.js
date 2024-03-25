// pages/api/calc.js
import fs from "fs";
import path, { parse } from "path";
import cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import nextConnect from "next-connect";
import { IncomingForm } from "formidable";

// Supabase client initialization
const supabase = createClient(
  "https://vzirtldrmuzpurjjcsrf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aXJ0bGRybXV6cHVyampjc3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5NTcyODUwNywiZXhwIjoyMDExMzA0NTA3fQ.sQmREUFOAqP5tclU1Uc3pGJtjYl3i7uQmgB82TSIXLI"
);

export function findLatestHtmlFile(dirPath) {
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".html"));
  const sortedByDate = files
    .map((filename) => ({
      name: filename,
      time: fs.statSync(path.join(dirPath, filename)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  return sortedByDate.length ? sortedByDate[0].name : null;
}

export function calcFromPairs(positivePairs) {
  let totalNet = 0;
  let totalVAT = 0;
  let totalBrutto = 0;

  positivePairs.forEach((pairs) => {
    const brutto = Object.values(pairs)[0];
    const net = brutto / 1.23;
    const vat = brutto - net;
    totalNet += net;
    totalVAT += vat;
    totalBrutto += brutto;
  });

  return {
    totalNet: totalNet.toFixed(2),
    totalVAT: totalVAT.toFixed(2),
    totalBrutto: totalBrutto.toFixed(2),
    positivePairs,
  };
}

export function calcFromNegativePairs(negativePairs, positivePairs) {
  let totalVATNegative = 0;
  let totalBruttoNegative = 0;
  let totalNettoNegative = 0;

  const sortedNegativePairsArray = Object.entries(negativePairs).sort((a, b) => a[1] - b[1]);

  negativePairs.forEach((pair) => {
    const bruttoNegative = Object.values(pair)[0];
    const netNegative = bruttoNegative / 1.23;
    const vatNegative = bruttoNegative - netNegative;
    totalVATNegative += vatNegative;
    totalBruttoNegative += bruttoNegative;
    totalNettoNegative += netNegative;
  });

  // Przekształcenie stringa na liczbę, aby wykonać operacje matematyczną
  var totalVATPositiveAccess = calcFromPairs(positivePairs);
  var totalVATPositive = totalVATPositiveAccess.totalVAT;
  let totalVATNettoNegative = parseFloat(totalVATPositive) + totalVATNegative;
  let totalNewNettoNegative = parseFloat(totalNettoNegative);

  return {
    totalVATNegative: totalVATNegative.toFixed(2),
    totalBruttoNegative: totalBruttoNegative.toFixed(2),
    totalVATNettoNegative: totalVATNettoNegative.toFixed(2),
    totalNewNettoNegative: totalNewNettoNegative.toFixed(2),
    negativePairs,
  };
}

export function countIncome(totalNetto, totalNettoNegative) {
  // Konwersja ciągów znaków na liczby zmiennoprzecinkowe
  let totalNettoNum = parseFloat(totalNetto);
  let totalNettoNegativeNum = parseFloat(totalNettoNegative);

  // Dodawanie wartości liczbowych
  let totalIncome = totalNettoNum + totalNettoNegativeNum;
  return { totalIncome: totalIncome.toFixed(2) };
}

export async function parseHtmlAndExtractData(filePath) {
  let dataBuffer;
  console.log(filePath);

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    console.log("przetwarzam URL");
    // Jeśli argument to URL, pobieramy dane i przekształcamy je na Buffer
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać danych z URL: ${filePath}`);
    }
    const data = await response.arrayBuffer(); // Pobieranie danych jako ArrayBuffer
    dataBuffer = Buffer.from(data); // Konwersja ArrayBuffer na Buffer
  } else {
    // W przeciwnym razie odczytujemy zawartość pliku
    dataBuffer = fs.readFileSync(filePath, "utf8");
    console.log("przetwarzam plik lokalny parseHtmlAndExtractData");
  }

  const $ = cheerio.load(dataBuffer);
  let pairs = [];
  let negPairs = [];

  $("table")
    .eq(4)
    .find("tr")
    .slice(1)
    .each(function () {
      const col2 = $(this).find("td").eq(1).text().trim();
      let col5 = $(this)
        .find("td")
        .eq(4)
        .text()
        .trim()
        .replace("PLN", "")
        .trim();
      col5 = col5
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^0-9.-]/g, "");
      const col5AsFloat = parseFloat(col5);

      if (!isNaN(col5AsFloat)) {
        if (col5AsFloat >= 0) {
          pairs.push({ [col2]: col5AsFloat }); // Dodajemy do listy wartości dodatnich
        } else {
          negPairs.push({ [col2]: col5AsFloat }); // Dodajemy do listy wartości ujemnych
        }
      }
    });

  // Teraz zwracamy obie listy
  console.log(pairs, negPairs);
  return { positivePairs: pairs, negativePairs: negPairs };
  
}

export async function categories(filePath) {
  let dataBuffer;
  console.log(filePath);

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    console.log("przetwarzam URL");
    // Jeśli argument to URL, pobieramy dane i przekształcamy je na Buffer
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać danych z URL: ${filePath}`);
    }
    const data = await response.arrayBuffer(); // Pobieranie danych jako ArrayBuffer
    dataBuffer = Buffer.from(data); // Konwersja ArrayBuffer na Buffer
  } else {
    // W przeciwnym razie odczytujemy zawartość pliku
    dataBuffer = fs.readFileSync(filePath, "utf8");
    console.log("przetwarzam plik lokalny kategorie");
  }

  const $ = cheerio.load(dataBuffer);

  let bramka = [];
  let bramkaDetail = {};
  let zaplaconyVat = [];
  let zaplaconyVatDetail = {};
  let dochodowy = [];
  let dochodowyDetail = {};
  let subskrypcje = [];
  let subskrypcjeDetail = {};
  let czynsze = [];
  let czynszeDetail = {};
  let uslugi = [];
  let uslugiDetail = {};
  let wyplaty = [];
  let wyplatyDetail = {};
  let ZUS = [];
  let ZUSDetail = {};
  let pozostale = [];
  let pozostaleDetail = {};

  $("table")
    .eq(4)
    .find("tr")
    .slice(1)
    .each(function () {
      const col2 = $(this).find("td").eq(1).text().trim();
      let col5 = $(this)
        .find("td")
        .eq(4)
        .text()
        .trim()
        .replace("PLN", "")
        .trim();
      col5 = col5
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^0-9.-]/g, "");
      const col5AsFloat = parseFloat(col5);
      let classified = false;
      const bramkaStrings = ["MELEMENTS"];
      const dochodowyStrings = [
        "PIT-4R",
        "PIT4R"
      ];
      const ZUSStrings = ["ZAKŁAD UBEZPIECZEŃ SPOŁECZNYCH"];
      const zaplaconyVatStrings = ["VAT-7"];
      const subskrypcjeStrings = [
        "AUTO-TUNE",
        "YOUTUBE",
        "THE MASTERS",
        "SLATE",
        "PLUGIN",
        "DROPBOX",
        "ADOBE",
        "SPLICE",
        "BENEFIT",
        "UNIVERSAL AUDIO",
        "PLAYSTATION",
        "WAVES",
        "HEROKU",
        "VERCEL",
        "MIRO",
        "CHATGPT",
        "SUPABASE",
        "PADDLE.NET",
        "CHATGPT",
        "GOOGLE",
      ];
      const czynszeStrings = ["LUKASIEWICZ", "WOJSKOWA"];
      const uslugiStrings = [
        "P4 SP.",
        "ABCGO",
        "PIASTPOL",
        "JUWENTUS",
        "ORANGE",
        "ABCGO",
        "WE3STUDIO",
      ];
      const wyplatyStrings = [
        "ŁOŚ JONATAN",
        "JONATAN ŁOŚ",
        "IWAN DOMINIK",
        "DOMINIK IWAN",
        "CYBULSKI SZYMON",
        "SZYMON CYBULSKI",
        "LITKOWIEC BRAJAN",
        "BRAJAN LITKOWIEC",
        "PALARCZYK DOMINIK",
        "DOMINIK PALARCZYK",
        "DREWNIAK KORNELIUSZ",
        "KORNELIUSZ DREWNIAK",
        "PAJDZIK WIKTOR",
        "WIKTOR PAJDZIK",
        "KRZEMIŃSKI SEBASTIAN",
        "SEBASTIAN KRZEMIŃSKI",
        "MICKIEWICZ PAWEŁ",
        "PAWEŁ MICKIEWICZ",
        "ROZWADOWSKI JAKUB",
        "JAKUB ROZWADOWSKI",
        "MADEJ SANDRA",
        "SANDRA MADEJ",
        "WRÓBLEWSKI ŁUKASZ",
        "ŁUKASZ WRÓBLEWSKI",
        "OSTROWSKI HUBERT",
        "HUBERT OSTROWSKI",
        "NOWICKI KAROL",
        "KAROL NOWICKI",
        "KOWALCZYK MACIEJ",
        "MACIEJ KOWALCZYK",
        "KAKIETEK MARIUSZ",
        "MARIUSZ KAKIETEK",
      ];

      if (bramkaStrings.some((str) => col2.includes(str)) && col5AsFloat >= 0) {
        bramka.push(col5AsFloat);
        classified = true;
        if (!bramkaDetail[col2]) {
          bramkaDetail[col2] = [col5AsFloat];
        } else {
          bramkaDetail[col2].push(col5AsFloat);
        }
      } else if (
        dochodowyStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        dochodowy.push(col5AsFloat);
        classified = true;
        if (!dochodowyDetail[col2]) {
          dochodowyDetail[col2] = [col5AsFloat];
        } else {
          dochodowyDetail[col2].push(col5AsFloat);
        }
      } else if (
        ZUSStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        ZUS.push(col5AsFloat);
        classified = true;
        if (!ZUSDetail[col2]) {
          ZUSDetail[col2] = [col5AsFloat];
        } else {
          ZUSDetail[col2].push(col5AsFloat);
        }
      } else if (
        subskrypcjeStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        subskrypcje.push(col5AsFloat);
        classified = true;
        if (!subskrypcjeDetail[col2]) {
          subskrypcjeDetail[col2] = [col5AsFloat];
        } else {
          subskrypcjeDetail[col2].push(col5AsFloat);
        }
      } else if (
        czynszeStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        czynsze.push(col5AsFloat);
        classified = true;
        if (!czynszeDetail[col2]) {
          czynszeDetail[col2] = [col5AsFloat];
        } else {
          czynszeDetail[col2].push(col5AsFloat);
        }
      } else if (
        zaplaconyVatStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        zaplaconyVat.push(col5AsFloat);
        classified = true;
        if (!zaplaconyVatDetail[col2]) {
          zaplaconyVatDetail[col2] = [col5AsFloat];
        } else {
          zaplaconyVatDetail[col2].push(col5AsFloat);
        }
      }else if (
        uslugiStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        uslugi.push(col5AsFloat);
        classified = true;
        if (!uslugiDetail[col2]) {
          uslugiDetail[col2] = [col5AsFloat];
        } else {
          uslugiDetail[col2].push(col5AsFloat);
        }
      } else if (
        wyplatyStrings.some((str) => col2.includes(str)) &&
        col5AsFloat <= 0
      ) {
        wyplaty.push(col5AsFloat);
        classified = true;
        if (!wyplatyDetail[col2]) {
          wyplatyDetail[col2] = [col5AsFloat];
        } else {
          wyplatyDetail[col2].push(col5AsFloat);
        }
      }
      if (!classified && col5AsFloat < 0) {
        pozostale.push(col5AsFloat);
        
        // Dodajemy do pozostaleDetail
        if (!pozostaleDetail[col2]) {
          pozostaleDetail[col2] = [col5AsFloat];
        } else {
          pozostaleDetail[col2].push(col5AsFloat);
        }
      }
    });
  
  // Tutaj masz pozostale jako sumę i pozostaleDetail z detalami
  console.log(pozostale); // Powinno wyświetlić sumę wszystkich nieklasyfikowanych transakcji
  console.log(pozostaleDetail);


  let allExp = {
    bramka,
    zaplaconyVat,
    dochodowy,
    subskrypcje,
    czynsze,
    uslugi,
    wyplaty,
    pozostale,
  };

  let allExpDetail = {
    pozostaleDetail,
    wyplatyDetail,
  };

  let result = { allExp, allExpDetail };
  return result;
}

export function sumExpensesByCategory(data) {
  const allExp = data.allExp; // Zakładam, że allExp jest pierwszym kluczem w przekazanym obiekcie
  let totalExpensesSum = {};

  // Iteracja przez kategorie w obiekcie allExp
  for (let category in allExp) {
    let categoryTotal = 0; // Suma dla bieżącej kategorii

    // Iteracja przez wydatki w danej kategorii
    allExp[category].forEach(expense => {
      categoryTotal += parseFloat(expense); // Dodawanie wartości wydatku do sumy kategorii
    });
    totalExpensesSum[category] = categoryTotal.toFixed(2); // Formatowanie sumy do dwóch miejsc po przecinku
  }

  return totalExpensesSum; // Zwrócenie obiektu z sumami dla każdej kategorii
}

export async function fileName(filePath) {
  let dataBuffer;
  console.log(filePath);

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    console.log("przetwarzam URL");
    // Jeśli argument to URL, pobieramy dane i przekształcamy je na Buffer
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Nie udało się pobrać danych z URL: ${filePath}`);
    }
    const data = await response.arrayBuffer(); // Pobieranie danych jako ArrayBuffer
    dataBuffer = Buffer.from(data); // Konwersja ArrayBuffer na Buffer
  } else {
    // W przeciwnym razie odczytujemy zawartość pliku
    dataBuffer = fs.readFileSync(filePath, "utf8");
    console.log("przetwarzam plik lokalny");
  }
  const $ = cheerio.load(dataBuffer);
  const text = $("td > font").text();
  const regex = /za okres od (\d{4}-\d{2}-\d{2}) do (\d{4}-\d{2}-\d{2})/;
  const matches = regex.exec(text);
  if (matches[1] && matches[2]) {
    // Wykorzystanie wyodrębnionego roku i miesiąca bezpośrednio jako nazwy pliku
    const safeFileName = matches[1] + " - " + matches[2];
    let newFileName = safeFileName.replace(/[\/\\?%*:|"<>]/g, "_");
    const startDate = matches[1].split("-");
    const year = parseInt(startDate[0]);
    const month = parseInt(startDate[1]);
    console.log(newFileName, month, year);
    return { newFileName, month, year };
  }
}


export async function checkIfFullMonth(filePath) {
    let dataBuffer;
  
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      console.log("przetwarzam URL");
      // Jeśli argument to URL, pobieramy dane i przekształcamy je na Buffer
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Nie udało się pobrać danych z URL: ${filePath}`);
      }
      const data = await response.arrayBuffer(); // Pobieranie danych jako ArrayBuffer
      dataBuffer = Buffer.from(data); // Konwersja ArrayBuffer na Buffer
    } else {
      // W przeciwnym razie odczytujemy zawartość pliku
      dataBuffer = fs.readFileSync(filePath, "utf8");
    //   console.log("przetwarzam plik lokalny parseHtmlAndExtractData");
    }
  
    const $ = cheerio.load(dataBuffer);
    const text = $('td > font').text();
    const regex = /za okres od (\d{4}-\d{2}-\d{2}) do (\d{4}-\d{2}-\d{2})/;
    const matches = regex.exec(text);

    if (matches && matches[1] && matches[2]) {
        const startDate = new Date(matches[1]);
        const endDate = new Date(matches[2]);
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        console.log('daysInMonth', daysInMonth);
        const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
        console.log('duration', duration);
        if (duration === daysInMonth){
            return true;
        } else {
            return false;
        }

    
    
}};


// async function processDocuments(directoryPath) {
//     const files = fs.readdirSync(directoryPath);

//     files.forEach(file => {
//         const filePath = path.join(directoryPath, file);
//         // Sprawdź, czy ścieżka jest plikiem
//         if (fs.statSync(filePath).isFile()) {
//             const htmlContent = fs.readFileSync(filePath, 'utf8');
//             const $ = cheerio.load(htmlContent);
//             const text = $('td > font').text();

//             const regex = /za okres od (\d{4}-\d{2}-\d{2}) do (\d{4}-\d{2}-\d{2})/;
//             const matches = regex.exec(text);
//             if (matches[1] && matches[2]) {
//                 // Przygotowanie tekstu na nazwę pliku (zastąpienie lub usunięcie niedozwolonych znaków)
//                 const safeFileName1 = matches[1].replace(/[\/\\?%*:|"<>]/g, '_');
//                 const safeFileName2 = matches[2].replace(/[\/\\?%*:|"<>]/g, '_') + '.html';
//                 const fullFileName = safeFileName1 + ' - ' + safeFileName2;

//                 const newFilePath = path.join(directoryPath, fullFileName);

//                 // Zmiana nazwy pliku
//                 fs.renameSync(filePath, newFilePath);
//                 console.log(`Zmieniono nazwę pliku na: ${newFilePath}`);
//             }

//             if (matches[1] && matches[2]) {
//                 const startDate = new Date(matches[1]);
//                 const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1);

//             if (matches[1] === startDate.toISOString().split('T')[0] &&
//                 text.includes(endDate.toISOString().split('T')[0])) {
//                 const newFileName = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.html`;
//                 const newDirectoryPath = path.join(directoryPath, 'miesiace');
//                 if (!fs.existsSync(newDirectoryPath)) {
//                     fs.mkdirSync(newDirectoryPath);
//                 }
//                 const newFilePath = path.join(newDirectoryPath, newFileName);
//                 if (!fs.existsSync(newFilePath)) {
//                     fs.copyFileSync(filePath, newFilePath)
//                     fs.unlinkSync(filePath);
//                     console.log(`Przeniesiono plik ${file} do katalogu miesiace jako ${newFileName}`);
//                 } else {
//                     fs.unlinkSync(filePath);
//                     console.log(`Plik ${newFileName} już istnieje w katalogu miesiace. Pomijam.`);
//                 }
//             }
//         }}
//     });
// }
// Funkcja do przenoszenia plików do katalogu miesiace

export const config = {
  api: {
    bodyParser: false, // Wyłączenie domyślnego parsowania body przez Next.js
  },
};

export default async function handler(req, res) {
  try {
    const directoryPath = path.join(process.cwd(), "Doks"); // Użyj process.cwd() dla ścieżki bezwzględnej
    const latestFile = findLatestHtmlFile(directoryPath);

    if (!latestFile) {
      return res
        .status(404)
        .json({ message: "Nie znaleziono najnowszego pliku HTML" });
    }

    const filePath = path.join(directoryPath, latestFile);
    const { positivePairs, negativePairs } = await parseHtmlAndExtractData(
      filePath
    );
    const calcFromPairsResult = calcFromPairs(positivePairs);
    const calcFromNegativePairsResult = calcFromNegativePairs(
      negativePairs,
      positivePairs
    );
    const categoriesResults = await categories(filePath);
    const totalIncome = countIncome(
      calcFromPairsResult.totalNet,
      calcFromNegativePairsResult.totalNewNettoNegative
    );
    const totalAllExp = await categories(filePath);
    const totalExpensesCat = sumExpensesByCategory(totalAllExp.result.allExp);
    let isFullMonth =  await checkIfFullMonth(filePath);

    res
      .status(200)
      .json({
        isFullMonth,
        latestFile,
        totalExpensesCat,
        calcFromPairsResult,
        calcFromNegativePairsResult,
        categoriesResults,
        totalIncome,
        totalAllExp,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
