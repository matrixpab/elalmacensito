import { getStoreConfiguracion } from '@/lib/data/store';
import ConfiguracionForm from './ConfiguracionForm';

export default async function ConfiguracionPage() {
  const config = await getStoreConfiguracion();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest-800">Configuración General</h1>
      <p className="mt-1 text-sm text-forest-500">
        Gestioná el número de WhatsApp para pedidos, integraciones de analítica e información de envíos.
      </p>

      <ConfiguracionForm config={config} />
    </div>
  );
}
