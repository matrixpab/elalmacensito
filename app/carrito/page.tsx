import CartView from '@/components/CartView';
import { getConfiguracion } from '@/lib/data/queries';

export default async function CarritoPage() {
  const config = await getConfiguracion();
  return <CartView whatsappNumero={config.whatsapp_numero} />;
}
