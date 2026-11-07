import prefixer from 'postcss-prefix-selector';

/**
 * El portal "clásico" del cliente usa los estilos de la app actual (js-logistics/app/css/estilos.css) tal cual.
 * Para que no choquen con Tailwind ni con la landing, todas sus reglas se encierran dentro de `.clasico`:
 * `:root`, `html` y `body` pasan a ser el propio contenedor `.clasico`.
 * Solo se transforma el archivo clasico.css; el resto del CSS no se toca.
 */
const soloClasico = (archivo = '') => /[\\/]clasico\.css$/.test(archivo);

export default {
  plugins: [
    prefixer({
      prefix: '.clasico',
      transform(prefix, selector, prefijado, archivo) {
        if (!soloClasico(archivo)) return selector;
        if (selector.startsWith('.clasico')) return selector;
        // :root, html y body → el contenedor. `:root[data-theme="dark"]` → `.clasico[data-theme="dark"]`
        const raiz = selector.match(/^(?::root|html|body)((?:\[[^\]]+\]|:not\([^)]*\)|::?[a-z-]+)*)(.*)$/);
        if (raiz) return `${prefix}${raiz[1]}${raiz[2]}`;
        return prefijado;
      },
    }),
    (await import('tailwindcss')).default({ config: './tailwind.config.cjs' }),
    (await import('autoprefixer')).default(),
  ],
};
