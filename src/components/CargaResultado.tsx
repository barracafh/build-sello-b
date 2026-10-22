import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { esLenta, pasoEn } from "@/lib/carga";
import { diccionario, type Idioma } from "@/i18n";

// Hueco con la forma de la tarjeta del resultado mientras se comprueba.
// La línea de pasos no es una región viva: el anuncio lo hace AnalizarMensaje una sola vez.
export function CargaResultado({
  transcurrido,
  idioma = "es",
}: {
  transcurrido: number;
  idioma?: Idioma;
}) {
  const t = diccionario(idioma).carga;
  return (
    <Card className="gap-0 py-0 text-lg">
      <div className="px-6 py-6 md:px-8 md:py-8">
        <Skeleton className="h-9 w-48 max-w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-4 h-6 w-3/4" />
      </div>
      <div className="px-6 py-6 md:px-8 md:py-8">
        <p className="font-medium">{pasoEn(transcurrido, t.pasos)}</p>
        {esLenta(transcurrido) && (
          <p className="mt-1 text-base text-(--text-secondary)">
            {t.lenta}
          </p>
        )}
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-5/6" />
      </div>
    </Card>
  );
}
