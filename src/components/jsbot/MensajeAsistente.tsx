import { Fragment } from 'react';

/** Solo interpreta negritas, guías y listas; React escapa el resto, incluido cualquier HTML. */
function guias(texto: string) {
  return texto.split(/(\bJS-\d+\b)/g).map((parte, i) => /^JS-\d+$/.test(parte)
    ? <span key={i} className="rounded-md bg-sky-500/[0.12] px-1.5 py-0.5 font-mono text-xs font-bold text-sky-700 dark:text-sky-300">{parte}</span>
    : parte);
}

function enLinea(texto: string) {
  return texto.split(/(\*\*[^*\n]+\*\*)/g).map((parte, i) => parte.startsWith('**') && parte.endsWith('**') && parte.length > 4
    ? <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{guias(parte.slice(2, -2))}</strong>
    : <Fragment key={i}>{guias(parte)}</Fragment>);
}

type Bloque = { tipo: 'parrafo' | 'lista'; lineas: string[] };

export function MensajeAsistente({ texto }: { texto: string }) {
  const bloques: Bloque[] = [];
  let actual: Bloque | undefined;
  for (const linea of texto.replace(/\r\n?/g, '\n').split('\n')) {
    if (!linea.trim()) { actual = undefined; continue; }
    const item = /^\s*[-•]\s+(.+)$/.exec(linea);
    const tipo = item ? 'lista' : 'parrafo';
    if (!actual || actual.tipo !== tipo) {
      actual = { tipo, lineas: [] };
      bloques.push(actual);
    }
    actual.lineas.push(item ? item[1] : linea);
  }
  return <div className="space-y-2 leading-relaxed">
    {bloques.map((bloque, i) => bloque.tipo === 'lista'
      ? <ul key={i} className="list-disc space-y-2 pl-4 marker:text-sky-500">
          {bloque.lineas.map((linea, j) => <li key={j}>{enLinea(linea)}</li>)}
        </ul>
      : <p key={i}>{bloque.lineas.map((linea, j) => <Fragment key={j}>{j > 0 && <br />}{enLinea(linea)}</Fragment>)}</p>)}
  </div>;
}
