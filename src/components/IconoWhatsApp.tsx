import type { SVGProps } from "react";
import { MessageCircle } from "lucide-react";

// Icono del botón de WhatsApp. Es el globo de Lucide y no el logotipo: los
// números del trazado del logotipo parecían un teléfono a la regla 5 de
// `buildnight revisar`. Va oculto a los lectores de pantalla: el texto del
// botón ya dice «WhatsApp».
export function IconoWhatsApp(props: SVGProps<SVGSVGElement>) {
  return <MessageCircle aria-hidden="true" focusable="false" {...props} />;
}
