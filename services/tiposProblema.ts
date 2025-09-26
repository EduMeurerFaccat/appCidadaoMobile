import api from './api';

export interface TipoProblemaDTO {
  id: number | string;
  nome: string; // backend presumido
  codigo?: string; // se existir
  ativo?: boolean;
}

export async function fetchTiposProblemaAtivos(): Promise<{ label: string; value: string }[]> {
  const resp = await api.get('/tipos-problema/ativos');
  // Normaliza resposta: aceita array de objetos ou strings
  const raw = resp.data as any[];
  return raw.map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    // label amigável; value deve ser SEMPRE o id (string) quando existir
    const label = item.nome || item.label || item.descricao || 'Tipo';
    const value = item?.id != null ? String(item.id) : (item.codigo || item.value || item.nome || '');
    return { label, value };
  });
}