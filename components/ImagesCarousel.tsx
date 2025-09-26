import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  images: string[];
  height?: number;
  onImagePress?: (index: number) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ImagesCarousel: React.FC<Props> = ({ images, height = 200, onImagePress }) => {
  // Sanitiza e remove vazios
  const clean = (images || []).filter(Boolean).map(u => (typeof u === 'string' ? u.trim() : u));
  const [index, setIndex] = React.useState(0);
  const [errors, setErrors] = React.useState<Record<number, boolean>>({});
  const [loaded, setLoaded] = React.useState<Record<number, boolean>>({});
  // Animação simples de shimmer
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmer]);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      setIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  if (!clean.length) {
    return (
      <View style={[styles.placeholder, { height }]}> 
        <Text style={styles.placeholderText}>Sem imagens</Text>
      </View>
    );
  }

  return (
    <View style={{ height }}>
      <FlatList
        data={clean}
        keyExtractor={(item, i) => item + i}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index: i }) => {
          const failed = errors[i];
          const isLoaded = loaded[i];
          const width = SCREEN_WIDTH - 36;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (failed) {
                  // tenta novamente
                  setErrors(prev => ({ ...prev, [i]: false }));
                  setLoaded(prev => ({ ...prev, [i]: false }));
                } else { onImagePress?.(i); }
              }}
            >
              {failed ? (
                <View style={[styles.failedImage, { width, height }]}> 
                  <Text style={styles.failedText}>Falha ao carregar</Text>
                  <Text style={styles.failedHint}>Toque para tentar novamente</Text>
                </View>
              ) : (
                <View style={{ width, height, marginRight: 8 }}>
                  {!isLoaded && (
                    <View style={styles.loadingWrapper}>
                      <Animated.View
                        style={[styles.shimmerBlock, {
                          opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] })
                        }]}
                      />
                      <ActivityIndicator size="small" color="#1E88E5" style={styles.loadingSpinner} />
                    </View>
                  )}
                  <Image
                    source={{ uri: item }}
                    style={{ position: 'absolute', top: 0, left: 0, width, height, borderRadius: 14, backgroundColor: 'transparent' }}
                    resizeMode="cover"
                    onError={(e) => {
                      console.log('[ImagesCarousel] erro ao carregar', item, e.nativeEvent?.error);
                      setErrors(prev => ({ ...prev, [i]: true }));
                    }}
                    onLoad={() => {
                      setLoaded(prev => ({ ...prev, [i]: true }));
                      console.log('[ImagesCarousel] carregada', item);
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        style={{ flexGrow: 0 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.dotsContainer}>
        {clean.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#1E88E5',
  },
  placeholder: {
    borderRadius: 14,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#666' }
  ,failedImage: {
    borderRadius: 14,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginRight: 8
  },
  failedText: { color: '#c62828', fontWeight: '600', marginBottom: 4 },
  failedHint: { fontSize: 11, color: '#444' },
  loadingWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shimmerBlock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5'
  },
  loadingSpinner: {
    position: 'absolute'
  }
});

export default ImagesCarousel;