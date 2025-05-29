const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let wordEntries = [];
let endings = [];

function loadWordEntries() {
  try {
    const filePath = path.join(__dirname, 'grunnord_forklaring.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    wordEntries = fileContent
      .split('\n')
      .filter(line => line.trim() && line.includes('=>'))
      .map(line => {
        const [word, ...htmlParts] = line.split('=>');
        return {
          word: word.trim(),
          explanation: htmlParts.join('=>').trim()
        };
      })
      .filter(entry => entry.word && entry.explanation);
    
    console.log(`Loaded ${wordEntries.length} word entries`);
  } catch (error) {
    console.error('Error loading word entries:', error);
    process.exit(1);
  }
}

function loadEndings() {
  try {
    const filePath = path.join(__dirname, 'endings.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    endings = fileContent
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
    
    console.log(`Loaded ${endings.length} endings`);
  } catch (error) {
    console.error('Error loading endings:', error);
    process.exit(1);
  }
}

app.use(express.static('public'));

app.get('/api/random-word', (req, res) => {
  if (wordEntries.length === 0) {
    return res.status(500).json({ error: 'No word entries available' });
  }
  
  if (endings.length === 0) {
    return res.status(500).json({ error: 'No endings available' });
  }
  
  const randomWordIndex = Math.floor(Math.random() * wordEntries.length);
  const randomEndingIndex = Math.floor(Math.random() * endings.length);
  
  const randomEntry = wordEntries[randomWordIndex];
  const randomEnding = endings[randomEndingIndex];
  
  const combinedName = randomEntry.word + randomEnding;
  
  res.json({ 
    word: combinedName.toUpperCase(),
    explanation: randomEntry.explanation 
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

loadWordEntries();
loadEndings();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});