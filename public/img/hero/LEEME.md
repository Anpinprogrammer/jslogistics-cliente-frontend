# Fotos del carrusel del Hero

**Son fotos de ejemplo** (de Wikimedia Commons) para ver cómo queda la portada. Antes de publicar, reemplázalas por fotos propias de JS Logistics, conservando los nombres (`camiones`, `mensajero`, `centro`, `bodega`), o cambia la lista `DIAPOSITIVAS` en `src/components/HeroCarrusel.tsx`.

| Archivo | Muestra |
|---|---|
| `camiones`  | camiones de carga en autopista |
| `mensajero` | furgoneta de reparto de paquetes |
| `centro`    | centro de distribución |
| `bodega`    | terminal de carga nocturna con grúas |

Cada foto va en **dos tamaños WebP**: `<nombre>-1920.webp` (computador) y `<nombre>-1280.webp` (celular). El navegador baja solo la que le sirve, y el carrusel pide cada foto cuando le va llegando el turno. Recomendado: horizontales, calidad 60–70 (las fotos van detrás de un velo oscuro, así que no se nota), menos de 300 KB la de 1920 y de 120 KB la de 1280. Se pueden convertir en https://squoosh.app.

## Créditos (licencias de las fotos de ejemplo)

- `camiones`: "Truck on Highway Bridge", Destroducks, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Truck_on_Highway_Bridge.jpg
- `mensajero`: "RAM ProMaster parcel delivery van", MobiusDaXter, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:RAM_ProMaster_parcel_delivery_van.jpg
- `centro`: "Daiwa Logistics Tosu Logistics Center", Peka, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Daiwa_Logistics_Tosu_Logistics_Center.jpg
- `bodega`: "Colombo Express in Altenwerder at night", Martin Damboldt, CC0. https://commons.wikimedia.org/wiki/File:Colombo_Express_in_Altenwerder_at_night-799096.jpeg

Las CC BY-SA exigen dar crédito y compartir igual si se publican; por eso conviene cambiarlas por fotos propias.
