import api from './api';

export interface ProblemDTO {
  id: string | number;
  titulo: string;
  descricao?: string;
  latitude: number;
  longitude: number;
  tipo?: string;
  imagens: string[];
  status?: string; // e.g., 'RESOLVIDO'|'ABERTO'
  raw?: any;
}

interface FetchProblemsParams {
  latitude: number;
  longitude: number;
  raio?: number; // metros (converteremos para km)
}

// Normaliza diversas possíveis chaves vindas do backend
function extractImages(p: any): string[] {
  let list: string[] = [];
  // Prioridade: backend atual retorna p.fotos: [{id,url}|string|{caminho}]
  if (Array.isArray(p?.fotos)) {
    list = p.fotos
      .map((f: any) => {
        if (typeof f === 'string') { return f; }
        return f?.url || f?.caminho || f?.path || null;
      })
      .filter(Boolean) as string[];
  } else if (Array.isArray(p?.imagens)) { list = p.imagens.filter(Boolean); }
  else if (Array.isArray(p?.fotosUrls)) { list = p.fotosUrls.filter(Boolean); }
  else if (typeof p?.imagem === 'string') { list = [p.imagem]; }
  else if (typeof p?.imagemUrl === 'string') { list = [p.imagemUrl]; }
  else if (typeof p?.foto === 'string') { list = [p.foto]; }

  // Mantém URLs exatamente como recebidas (Azure já retorna absoluto). Filtra falsy.
  list = list.filter(Boolean);
  if (list.length === 0 && __DEV__) { console.log('[problems.extractImages] sem imagens para problema', p?.id); }
  if (__DEV__) { console.log('[problems.extractImages] imagens', p?.id, list); }
  return list;
}

export async function fetchNearbyProblems({ latitude, longitude, raio = 2000 }: FetchProblemsParams): Promise<ProblemDTO[]> {
  // Converte metros para quilômetros com 2 casas (endpoint espera raioKm)
  const raioKm = (raio / 1000).toFixed(2);
  if (__DEV__) { try { console.log('[problems] GET /problemas/proximos', { latitude, longitude, raioKm }); } catch {}
  }
  const resp = await api.get('/problemas/proximos', { params: { lat: latitude, lng: longitude, raioKm } });
  const data = Array.isArray(resp.data) ? resp.data : [];
  return data.map((p: any, idx: number) => {
    const lat = Number(p.latitude ?? p.lat ?? p.localizacao?.latitude ?? latitude);
    const lng = Number(p.longitude ?? p.lng ?? p.localizacao?.longitude ?? longitude);
    return {
      id: p.id ?? idx,
      titulo: p.titulo || p.nome || 'Problema',
      descricao: p.descricao,
      latitude: lat,
      longitude: lng,
      tipo: p.tipoProblemaNome || p.categoria || p.tipo || undefined,
  imagens: extractImages(p),
  status: p.status || p.situacao || p.estado || undefined,
      raw: p,
    } as ProblemDTO;
  });
}

export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const dLat = (bLat - aLat) * Math.PI / 180;
  const dLng = (bLng - aLng) * Math.PI / 180;
  const A = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  return R * c;
}
