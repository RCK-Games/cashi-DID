export function badWordsChecker(texto) {
  const palabrasBaneadas = ['sexo', 'matar', 'muerte'];
  const palabrasDelTexto = texto.toLowerCase().split(/\s+/);
  
  return palabrasBaneadas.some(palabra => 
      palabrasDelTexto.includes(palabra.toLowerCase())
  );
}