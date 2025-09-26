import ImagesCarousel from '@/components/ImagesCarousel';
import LeafletMap, { LeafletMarker } from '@/components/LeafletMap';
import { ThemedTextArea } from '@/components/ThemedTextArea';
import { useAuth } from '@/contexts/AuthContext';
import { CommentDTO, getProblemComments, postProblemComment } from '@/services/comments';
import { distanceMeters, fetchNearbyProblems, ProblemDTO } from '@/services/problems';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, PanResponder, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ProblemItem = ProblemDTO;

export default function ProblemasProximosScreen() {
  const { user } = useAuth();
  const initialFallback = { latitude: -23.55052, longitude: -46.633308 };
  const mapRef = useRef(null);
  const [region, setRegion] = useState<{ latitude: number; longitude: number } | null>(initialFallback);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recenterTick, setRecenterTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const selectedProblem = problems.find(p => p.id === selectedId) || null;
  // comentários
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  // scroll topo
  const scrollRef = useRef<ScrollView | null>(null);
  const lastYRef = useRef(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const onScroll = useCallback((e: any) => {
    const threshold = 220;
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    const dy = y - (lastYRef.current || 0);
    if (y > threshold && dy > 2) {
      setShowScrollTop(true);
    }
    if (dy < -2 || y <= threshold) {
      setShowScrollTop(false);
    }
    lastYRef.current = y;
  }, []);
  // drag to close
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        // Captura apenas quando puxar para baixo e scroll está no topo
        return gesture.dy > 4 && (lastYRef.current || 0) <= 0;
      },
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        const shouldClose = gesture.dy > 120 || gesture.vy > 1.2;
        if (shouldClose) {
          Animated.timing(translateY, { toValue: 400, duration: 180, useNativeDriver: true }).start(() => setSelectedId(null));
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;
  // reset ao abrir
  useEffect(() => {
    if (selectedProblem) {
      translateY.setValue(0);
    }
  }, [selectedProblem, translateY]);
  // helpers de avatar
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase() || name[0].toUpperCase();
  };
  const getAvatarColor = (id?: number | null, name?: string | null) => {
    const palette = ['#6C63FF','#1E88E5','#2E7D32','#F4511E','#8E24AA','#00897B','#3949AB','#D81B60'];
    let seed = 0;
    if (typeof id === 'number') seed = id;
    else if (name) seed = name.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    return palette[seed % palette.length];
  };

  const loadComments = useCallback(async (problemId: string | number, targetPage = 0) => {
    const isMore = targetPage > 0;
    try {
      if (isMore) setLoadingMore(true); else setLoadingComments(true);
      const data = await getProblemComments(problemId, targetPage, 4);
      setComments(prev => targetPage === 0 ? data.content : [...prev, ...data.content]);
      setPage(data.number);
      setHasMore(!data.last);
    } catch (e) {
      console.log('Erro ao carregar comentários', e);
    } finally {
      if (isMore) setLoadingMore(false); else setLoadingComments(false);
    }
  }, []);

  const resetAndLoadComments = useCallback(async (problemId: string | number) => {
    setComments([]);
    setPage(0);
    setHasMore(true);
    await loadComments(problemId, 0);
  }, [loadComments]);

  useEffect(() => {
    if (selectedProblem) {
      resetAndLoadComments(selectedProblem.id);
    } else {
      // limpamos estado ao fechar
      setComments([]);
      setPage(0);
      setHasMore(true);
      setNewComment('');
    }
  }, [selectedProblem, resetAndLoadComments]);
  // Removidos estados de timeout/mapReady

  // Pega localização do usuário
  useEffect(() => {
    (async () => {
      try {
  console.log('[ProblemasProximos] solicitando permissão localização');
  const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
          setError('Permissão negada');
          setLoading(false);
          return;
        }
  const current = await Location.getCurrentPositionAsync({});
  const initialRegion = { latitude: current.coords.latitude, longitude: current.coords.longitude };
  setRegion(initialRegion);
  console.log('[ProblemasProximos] posição inicial', initialRegion);
  await fetchProblems(initialRegion.latitude, initialRegion.longitude);
      } catch (e: any) {
        console.log(e);
        setError('Erro ao obter localização.');
      } finally {
        setLoading(false);
      }
    })();
  // Timeout removido
  }, []);

  const fetchProblems = useCallback(async (lat: number, lng: number) => {
    console.log('[ProblemasProximos] fetchProblems lat/lng', lat, lng);
    setFetching(true);
    setError(null);
    try {
  const raw = await fetchNearbyProblems({ latitude: lat, longitude: lng, raio: 2000 });
  const filtered = raw.filter(p => distanceMeters(lat, lng, p.latitude, p.longitude) <= 2000);
  console.log('[ProblemasProximos] recebidos=', raw.length, 'dentroRaio=', filtered.length);
  setProblems(filtered);
    } catch (err) {
  console.log('Falha ao buscar problemas.', err);
  setError('Não foi possível carregar os problemas.');
    } finally { setFetching(false); }
  }, []);

  const recenter = async () => {
    try {
  console.log('[ProblemasProximos] recenter acionado');
  const current = await Location.getCurrentPositionAsync({});
      const r = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setRegion(r);
      setRecenterTick(t => t + 1); // força recarga visual
      fetchProblems(r.latitude, r.longitude);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível recenter o mapa.');
    }
  };

  return (
    <View style={styles.container}>
  {region && (
        <LeafletMap
          center={region}
          zoom={15}
          recenterTrigger={recenterTick}
          markers={problems.map<LeafletMarker>(p => ({
            id: p.id,
            latitude: p.latitude,
            longitude: p.longitude,
            title: p.titulo,
            description: p.descricao,
            color: (p.status?.toString().toUpperCase() === 'RESOLVIDO') ? '#2E7D32' : '#1E88E5'
          }))}
          onMarkerPress={(id) => setSelectedId(id)}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Carregando mapa...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {(() => {
        const topOffset = (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0) + 8;
        return (
          <View style={[styles.topBar, { top: topOffset }]}> 
            <TouchableOpacity style={styles.refreshButton} onPress={recenter}>
              <Ionicons name="locate" size={20} color="#1E88E5" />
              <Text style={styles.refreshButtonText}>Minha posição</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.refreshButton, fetching && { opacity: 0.6 }]}
              disabled={fetching || !region}
              onPress={() => { if (region) { fetchProblems(region.latitude, region.longitude); } }}
            >
              <Ionicons name="refresh" size={20} color="#1E88E5" />
              <Text style={styles.refreshButtonText}>{fetching ? 'Atualizando...' : 'Atualizar'}</Text>
            </TouchableOpacity>
          </View>
        );
      })()}

      {!loading && !error && !fetching && problems.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Nenhum problema encontrado neste raio.</Text>
        </View>
      )}
  {/* DebugBox removido */}

      {/* Bottom Sheet / Modal simples */}
      <Modal
        visible={!!selectedProblem}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedId(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSelectedId(null)} />
  <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
          {selectedProblem && (
            <ScrollView ref={scrollRef} style={{ flex: 1 }} onScroll={onScroll} scrollEventThrottle={16}>
              <View style={styles.titleRow}>
                <Text style={styles.sheetTitle} numberOfLines={1} ellipsizeMode="tail">{selectedProblem.titulo}</Text>
                {selectedProblem.status?.toString().toUpperCase() === 'RESOLVIDO' && (
                  <View style={styles.resolvedBadge}> 
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.resolvedText}>Resolvido</Text>
                  </View>
                )}
              </View>
              <View style={styles.imageWrapper}>
                <ImagesCarousel images={selectedProblem.imagens || []} height={200} />
              </View>
              <Text style={styles.sheetLabel}>Descrição</Text>
              <Text style={styles.sheetText}>{selectedProblem.descricao || '—'}</Text>
              {selectedProblem.tipo && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.sheetLabel}>Tipo</Text>
                  <Text style={styles.sheetBadge}>{selectedProblem.tipo}</Text>
                </View>
              )}

              {/* Novo comentário no topo */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sheetLabel}>Comentar</Text>
                <ThemedTextArea
                  colorScheme="light"
                  borderStyle="soft"
                  placeholder="Escreva seu comentário"
                  value={newComment}
                  onChangeText={setNewComment}
                  editable={!submittingComment}
                />
                <TouchableOpacity
                  style={[styles.commentButton, submittingComment && { opacity: 0.6 }]}
                  disabled={submittingComment || !newComment.trim()}
                  onPress={async () => {
                    if (!selectedProblem || !newComment.trim()) return;
                    try {
                      setSubmittingComment(true);
                      // Exige autenticação para comentar
                      if (!user) {
                        Alert.alert(
                          'Faça login',
                          'Você precisa estar autenticado para comentar.',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Ir para login', onPress: () => router.push('/(auth)/login') },
                          ]
                        );
                        return;
                      }
                      await postProblemComment(selectedProblem.id, newComment.trim());
                      setNewComment('');
                      await resetAndLoadComments(selectedProblem.id);
                    } catch (e: any) {
                      const status = e?.response?.status;
                      const backendMsg = e?.response?.data?.message || e?.message;
                      if (status === 401) {
                        Alert.alert('Sessão expirada', 'Faça login novamente para comentar.');
                      } else if (status === 403) {
                        Alert.alert('Sem permissão', backendMsg || 'Seu usuário não tem permissão para comentar.');
                      } else {
                        Alert.alert('Erro', backendMsg || 'Falha ao enviar comentário');
                      }
                    } finally { setSubmittingComment(false); }
                  }}
                >
                  <Text style={styles.commentButtonText}>{submittingComment ? 'Enviando...' : 'Comentar'}</Text>
                </TouchableOpacity>
              </View>

              {/* Comentários listados */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sheetLabel}>Comentários</Text>
                {loadingComments && page === 0 && <ActivityIndicator style={{ marginVertical: 8 }} color="#1E88E5" />}
                {comments.map((c) => {
                  const initials = getInitials(c.autorNome);
                  const bg = getAvatarColor(c.autorId, c.autorNome);
                  return (
                    <View key={c.id} style={styles.commentItem}>
                      <View style={{ flexDirection: 'row' }}>
                        <View style={[styles.avatar, { backgroundColor: bg }]}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeaderRow}>
                            <Text style={styles.commentAuthor}>{c.autorNome || 'Anônimo'}</Text>
                            <Text style={styles.commentMeta}>{new Date(c.criadoEm).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
                          </View>
                          <View style={styles.commentBubble}>
                            <Text style={styles.commentText}>{c.texto}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
                {!loadingComments && comments.length === 0 && (
                  <Text style={{ color: '#666' }}>Seja o primeiro a comentar.</Text>
                )}
                {hasMore && !loadingMore && (
                  <TouchableOpacity style={styles.loadMoreCircle} onPress={async () => {
                    if (!selectedProblem) return;
                    await loadComments(selectedProblem.id, page + 1);
                  }}>
                    <Ionicons name="add" size={22} color="#fff" />
                  </TouchableOpacity>
                )}
                {loadingMore && (
                  <ActivityIndicator style={{ marginTop: 12, alignSelf: 'center' }} color="#1E88E5" />
                )}
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
          <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setSelectedId(null)}>
            <Text style={styles.sheetCloseText}>Fechar</Text>
          </TouchableOpacity>
          {showScrollTop && (
            <TouchableOpacity
              accessibilityLabel="Voltar ao topo"
              style={styles.scrollTopBtn}
              onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            >
              <Ionicons name="chevron-up" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#1E88E5', fontWeight: '600' },
  errorBox: {
    position: 'absolute',
    top: 110,
    left: 12,
    right: 12,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  errorText: { color: '#e53935', textAlign: 'center' },
  topBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  refreshButtonText: { marginLeft: 6, color: '#1E88E5', fontWeight: '600' },
  // debugBox removido
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#222' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sheetImage: { width: '100%', height: 180, borderRadius: 12, backgroundColor: '#eee', marginBottom: 12 },
  sheetImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', color: '#555', marginBottom: 4 },
  sheetText: { fontSize: 15, lineHeight: 20, color: '#333' },
  imageWrapper: { marginVertical: 12 },
  sheetBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#1E88E5', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, overflow: 'hidden', fontSize: 12 },
  resolvedBadge: { alignSelf: 'flex-end', backgroundColor: '#2E7D32', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 8 },
  resolvedText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  commentItem: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0' },
  commentAuthor: { fontWeight: '600', color: '#222' },
  commentText: { color: '#333', marginTop: 2 },
  commentMeta: { color: '#777', fontSize: 12, marginTop: 2 },
  loadMoreBtn: { marginTop: 8, alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1E88E5' },
  loadMoreText: { color: '#1E88E5', fontWeight: '600' },
  loadMoreCircle: { marginTop: 8, alignSelf: 'center', width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E88E5', alignItems: 'center', justifyContent: 'center' },
  commentButton: { marginTop: 10, backgroundColor: '#1E88E5', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  commentButtonText: { color: '#fff', fontWeight: '600' },
  // avatar e layout
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: '700' },
  commentContent: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentBubble: { marginTop: 4, backgroundColor: '#f3f6ff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  scrollTopBtn: { position: 'absolute', right: 16, bottom: 76, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30,136,229,0.9)', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  sheetCloseBtn: { marginTop: 8, backgroundColor: '#1E88E5', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  sheetCloseText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  emptyBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  emptyText: { color: '#333', fontSize: 14, fontWeight: '500' },
});

// Estilo de mapa (opcional, simples)
const mapStyle = [] as any[];
