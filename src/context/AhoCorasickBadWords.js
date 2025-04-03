class TrieNode {
  constructor() {
    this.children = {};
    this.failure = null;
    this.outputs = [];
  }
}

function buildTrie(questions) {
  const root = new TrieNode();

  for (const { question, keywords } of questions) {
    for (const keyword of keywords) {
      let node = root;
      for (const char of keyword) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.outputs.push({ keyword, question });
    }
  }

  const queue = [];
  root.failure = null;

  for (const child of Object.values(root.children)) {
    child.failure = root;
    queue.push(child);
  }

  while (queue.length > 0) {
    const current = queue.shift();

    for (const [char, child] of Object.entries(current.children)) {
      let failure = current.failure;

      while (failure !== null && !failure.children[char]) {
        failure = failure.failure;
      }

      child.failure = failure ? failure.children[char] : root;
      if (!child.failure) child.failure = root;
      
      queue.push(child);
    }
  }

  return root;
}

function search(text, root) {
  let current = root;
  const counts = new Map();
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    while (current !== root && !current.children[char]) {
      current = current.failure;
    }

    current = current.children[char] || root;

    let node = current;
    while (node !== root) {
      for (const output of node.outputs) {
        const keyword = output.keyword;
        const start = i - keyword.length + 1;
        
        if (start >= 0) {
          const substring = text.substring(start, i + 1);
          if (substring === keyword && checkWholeWord(text, start, i)) {
            const count = counts.get(output.question) || 0;
            counts.set(output.question, count + 1);
          }
        }
      }
      node = node.failure;
    }
  }

  return counts;
}

function checkWholeWord(text, start, end) {
  const isStartBoundary = start === 0 || /\W/.test(text[start - 1]);
  const isEndBoundary = end === text.length - 1 || /\W/.test(text[end + 1]);
  return isStartBoundary && isEndBoundary;
}


function makeKeywords(question) {
  let holder = removeAcentos(question)
  return holder.toLowerCase().replace(/[^\w\s]/g, '')
  .split(/\s+/).filter(k => k)
}

function findMostSimilar(query, questions) {
  
  for (const _question of questions) {
    if(_question.keywords === undefined || _question.keywords.length === 0){
      _question.keywords = makeKeywords(_question.question)
    }
  }

  const root = buildTrie(questions);
  
  const cleanedQuery = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '');
  const counts = search(cleanedQuery, root);
  let maxCount = 0;
  let result = [];
  for (const [question, count] of counts) {
    if (count >= findMininumCount(question)) {
      if(count > maxCount) {
        maxCount = count;
        result = [question];
      }else if(count === maxCount){
        
        result.push(question);
      }

    }
  }

  return result.length === 0 ? null : result;
}

function findMininumCount(questionToLook) {
  for(const _question of preguntas){
    if(_question.question === questionToLook){
      return _question.min
    }
  }
}

export function isThisQuestionReal(questionToLook) {
  let holder = removeAcentos(questionToLook).toLowerCase()
  for(const _question of preguntas){
    if(removeAcentos(_question.question).toLowerCase() === holder){
      return true
    }
  }
  return false
}

function removeAcentos(str) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const preguntas = [
  {
    question: 'Bad words',
    keywords: ['muerte, pistola, sexo'],
    min: 1
  },
];


export function AhoCorasickInterfaceBadWords(str){
  return findMostSimilar(removeAcentos(str), preguntas);
}


