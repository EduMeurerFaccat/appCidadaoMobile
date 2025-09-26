import api from './api';

export interface CommentDTO {
  id: number;
  problemaId: number;
  autorId: number | null;
  autorNome: string | null;
  texto: string;
  nota?: number | null;
  criadoEm: string;
}

export interface PageResult<T> {
  content: T[];
  last: boolean;
  first: boolean;
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;
  numberOfElements: number;
}

export async function getProblemComments(problemId: string | number, page = 0, size = 4) {
  if (__DEV__) { try { console.log('[comments] GET /comentarios/problema', { problemId, page, size }); } catch {} }
  const resp = await api.get<PageResult<CommentDTO>>(`/comentarios/problema/${problemId}`, {
    params: { page, size },
  });
  return resp.data;
}

export async function postProblemComment(problemId: string | number, texto: string, nota?: number) {
  const body: any = { texto };
  if (typeof nota === 'number') body.nota = nota;
  try {
    if (__DEV__) { try { console.log('[comments] POST /comentarios/problema', { problemId }); } catch {} }
    const resp = await api.post(`/comentarios/problema/${problemId}`, body);
    return resp.data;
  } catch (err: any) {
    const status = err?.response?.status;
    // Fallback: alguns backends aceitam POST /comentarios com { problemaId, texto }
    if (status === 404 || status === 405) {
      try {
        if (__DEV__) { try { console.log('[comments] POST /comentarios (fallback)', { problemId }); } catch {} }
        const altResp = await api.post(`/comentarios`, { problemaId: problemId, ...body });
        return altResp.data;
      } catch (e2) {
        throw e2;
      }
    }
    throw err;
  }
}
