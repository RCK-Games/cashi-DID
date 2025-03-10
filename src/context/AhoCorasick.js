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
    question: '¿Qué es Cashi?',
    keywords: ['que', 'es', 'cashi'],
    min: 3
  },
  {
    question: '¿Cómo funciona?',
    keywords: ['como', 'funciona', 'cashi'],
    min: 2
  },
  {
    question: '¿Tengo que pagar por usar Cashi?',
    keywords: ['tengo', 'pagar', 'por', 'para', 'usar', 'usarlo', 'cashi', 'debo', 'necesito'],
    min: 4
  },
  {
    question: '¿Cómo creo una cuenta de Cashi?',
    keywords: ['como', 'creo', 'una', 'cuenta', 'cashi', 'crear'],
    min: 3
  },
  {
    question: '¿Cómo verifico mi cuenta?',
    keywords: ['como', 'verifico', 'mi', 'la', 'cuenta', 'cashi', 'verificar'],
    min: 3
  },
  {
    question: '¿Qué pasa si olvido mi NIP?',
    keywords: ['que', 'pasa', 'olvido', 'olvide', 'nip', 'numero', 'secreto'],
    min: 3
  },
  {
    question: '¿Cómo accedo a mi cuenta?',
    keywords: ['como', 'ingreso', 'accedo', 'cuenta', 'iniciar', 'inicio', 'sesion', 'acceder'],
    min: 3
  },
  {
    question: '¿Cómo cargar saldo en Cashi?',
    keywords: ['como', 'carga', 'lleno', 'agrego', 'saldo', 'cuenta', 'dinero', 'cargo', 'meto'],
    min: 4
  },
  {
    question: '¿Puedo obtener un reembolso del saldo cargado?',
    keywords: ['puedo', 'obtener', 'reembolso', 'saldo', 'cargado', 'quiero', 'agregado', 'dinero'],
    min: 4
  },
  {
    question: '¿Cómo pago con Cashi en una tienda?',
    keywords: ['como', 'pago', 'tienda', 'cashi', 'pagar'],
    min: 3
  },
  {
    question: '¿Puedo hacer un pago parcial con Cashi?',
    keywords: ['puedo', 'hacer', 'pago', 'pagar', 'parcial', 'partes', 'cashi'],
    min: 5
  },
  {
    question: '¿Puedo pagar en línea con Cashi?',
    keywords: ['puedo', 'pagar', 'linea', 'internet', 'con', 'cashi'],
    min: 4
  },
  {
    question: '¿Puedo devolver artículos que compré en una tienda y que pagué con Cashi?',
    keywords: ['puedo', 'devolver', 'productos', 'cosas', 'articulos', 'compre', 'consegui', 'tienda', 'pague', 'cashi'],
    min: 6
  },
  {
    question: '¿Puedo devolver artículos que compré en línea y que pagué con Cashi?',
    keywords: ['puedo', 'devolver', 'productos', 'cosas', 'articulos', 'compre', 'consegui', 'internet', 'linea', 'telefono', 'pague', 'cashi'],
    min: 7
  },
  {
    question: '¿Puedo realizar el pago en tienda utilizando mi tarjeta de crédito o débito dentro de la app de Cashi?',
    keywords: ['puedo', 'realizar', 'hacer', 'pago', 'pagar', 'tarjeta', 'mi', 'credito', 'debito', 'con', 'app', 'aplicacion', 'cashi'],
    min: 10
  },
  {
    question: '¿Puedo realizar el pago parcial de un pedido en línea con Cashi?',
    keywords: ['puedo', 'hacer', 'realizar', 'pago', 'parcial', 'partes', 'pedido', 'pedi', 'internet', 'aplicacion', 'app', 'con', 'pague', 'cashi'],
    min: 7
  },
  {
    question: '¿Puedo utilizar Cashi para realizar el pago de pedidos en línea con orden impresa?',
    keywords: ['puedo', 'usar', 'utilizar', 'pago', 'paquete', 'pedido', 'pedi', 'internet', 'aplicacion', 'app', 'orden', 'impresa', 'impreso', 'linea', 'pedidos'],
    min: 7
  },
  {
    question: '¿Cómo puedo obtener el 2% de bonificación por mis compras realizadas en línea pagando con Cashi?',
    keywords: ['como', 'puedo', 'obtener', 'conseguir', 'lograr', 'bonificacion', 'vuelto', 'por', 'comprar', 'compras', 'hechas', 'realizadas', 'internet', 'linea', 'cashi', 'pagar', 'pagando', 'regreso'],
    min: 8
  },
  {
    question: '¿Puedo pagar cualquier producto en línea con Cashi?',
    keywords: ['pagar', 'pagando', 'cualquier', 'que', 'sea', 'internet', 'linea', 'cashi', 'app', 'aplicacion', 'producto'],
    min: 6
  },
  {
    question: '¿En cuánto tiempo puedo ver mi saldo reflejado en mi app?',
    keywords: ['cuanto', 'tarda', 'tiempo', 'puedo', 'ver', 'visualizar', 'saldo', 'app', 'aplicacion', 'cashi', 'reflejado'],
    min: 6
  }
];


export function AhoCorasickInterface(str){
  return findMostSimilar(removeAcentos(str), preguntas);
}


