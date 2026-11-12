/* Contenedor de los avisos (react-toastify) con su CSS. Va en un archivo aparte para que la portada no lo descargue
   al abrir: App.tsx lo monta cuando el navegador queda libre. Un aviso que salga antes queda en la cola de
   react-toastify y se muestra apenas se monta el contenedor. */
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './avisos.css';

export default function Avisos() {
  // El tema de cada aviso se toma de la clase `dark` al mostrarlo (utils/clientToast.ts).
  return <ToastContainer position="top-right" autoClose={3500} pauseOnHover newestOnTop limit={3} />;
}
