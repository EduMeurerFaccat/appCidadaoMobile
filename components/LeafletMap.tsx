import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export type LeafletMarker = {
  id: string | number;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
};

type Props = {
  center: { latitude: number; longitude: number };
  markers?: LeafletMarker[];
  selectable?: boolean;
  onSelectPoint?: (lat: number, lng: number) => void;
  onMarkerPress?: (id: string | number) => void;
  onCenterChange?: (lat: number, lng: number) => void;
  style?: any;
  zoom?: number;
  recenterTrigger?: number;
  reportCenterOnMove?: boolean;
  continuousCenter?: boolean; // emite centro também durante o movimento
};

const LeafletMap: React.FC<Props> = ({ center, markers = [], selectable, onSelectPoint, onMarkerPress, onCenterChange, style, zoom = 16, recenterTrigger, reportCenterOnMove, continuousCenter }) => {
  // Congela centro inicial quando estamos reportando movimento (evita recriar mapa e perder zoom/pinch)
  const initialCenterRef = useRef(center);
  const effectiveCenter = reportCenterOnMove ? initialCenterRef.current : center;

  // Quando recenterTrigger muda, permitimos redefinir o centro inicial (ex: após obter GPS) e recriamos o mapa
  useEffect(() => {
    if (reportCenterOnMove && typeof recenterTrigger !== 'undefined') {
      initialCenterRef.current = center;
    }
  }, [recenterTrigger, reportCenterOnMove, center]);
  const markersJs = useMemo(() => {
    if (!markers.length) {
      return 'window.ReactNativeWebView.postMessage(JSON.stringify({type:"debug", stage:"no-markers"}));';
    }
    const serialized = JSON.stringify(markers.map(m => ({
      id: m.id,
      lat: m.latitude,
      lng: m.longitude,
      title: m.title || '',
      description: m.description || '',
      color: m.color || '#1E88E5'
    })));
    return `const MARKERS=${serialized};\n`+
      `window.ReactNativeWebView.postMessage(JSON.stringify({type:\"debug\", stage:\"adding-markers\", count:MARKERS.length}));\n`+
      `MARKERS.forEach(m=>{ const icon = L.divIcon({className:'custom-pin', html: '<div style="width:26px;height:26px;transform:translate(-13px,-26px);"><svg width="26" height="26" viewBox="0 0 24 24"><path fill="' + m.color + '" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5Z"/></svg></div>'}); const marker=L.marker([m.lat,m.lng],{icon}); marker.addTo(map); marker.on('click', ()=> window.ReactNativeWebView.postMessage(JSON.stringify({type:'marker-click', id:m.id}))); });\n`+
      `window.ReactNativeWebView.postMessage(JSON.stringify({type:\"debug\", stage:\"markers-added\"}));`;
  }, [markers]);

  const html = useMemo(() => {
    const centerEvents = reportCenterOnMove ? (
      continuousCenter
        ? "map.on('move', ()=>{ const c=map.getCenter(); window.ReactNativeWebView.postMessage(JSON.stringify({type:'center', latitude:c.lat, longitude:c.lng}));}); map.on('moveend', ()=>{ const c=map.getCenter(); window.ReactNativeWebView.postMessage(JSON.stringify({type:'center', latitude:c.lat, longitude:c.lng}));});"
        : "map.on('moveend', ()=>{ const c=map.getCenter(); window.ReactNativeWebView.postMessage(JSON.stringify({type:'center', latitude:c.lat, longitude:c.lng}));});"
    ) : '';
    return `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no,width=device-width'/><link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/><style>html,body,#map{height:100%;margin:0;padding:0}.leaflet-control-attribution{display:none} .leaflet-control-zoom{display:none !important}</style></head><body><div id='map'></div><script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script><script>try { const map=L.map('map',{zoomControl:false}).setView([${effectiveCenter.latitude},${effectiveCenter.longitude}],${zoom}); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,attribution:'© OpenStreetMap'}).addTo(map); ${markersJs} ${selectable ? `let sel=null;function setSel(lat,lng){ if(sel){map.removeLayer(sel);} sel=L.marker([lat,lng]).addTo(map); window.ReactNativeWebView.postMessage(JSON.stringify({type:'point',latitude:lat,longitude:lng}));};map.on('click',e=>setSel(e.latlng.lat,e.latlng.lng));` : ''} ${centerEvents} window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug', stage:'loaded'})); } catch(err){ window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug', stage:'error', message:String(err)})); }</script></body></html>`;
  }, [reportCenterOnMove, continuousCenter, /* congelar quando ativo */ reportCenterOnMove ? null : center.latitude, reportCenterOnMove ? null : center.longitude, markersJs, selectable, zoom, recenterTrigger, effectiveCenter.latitude, effectiveCenter.longitude]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'point' && onSelectPoint) {
        onSelectPoint(data.latitude, data.longitude);
      } else if (data.type === 'center' && onCenterChange) {
        onCenterChange(data.latitude, data.longitude);
      } else if (data.type === 'marker-click' && onMarkerPress) {
        onMarkerPress(data.id);
      } else if (data.type === 'debug') {
        console.log('[LeafletMap debug]', data);
      }
    } catch (err) {
      console.log('[LeafletMap parse error]', err);
    }
  };

  // Evita recriar WebView a cada movimento quando reportCenterOnMove ativo
  const webKey = `${reportCenterOnMove ? 'static' : center.latitude.toFixed(5)+','+center.longitude.toFixed(5)}|${markers.length}|${recenterTrigger ?? 0}`;
  return (
    <View style={[styles.container, style]}>
      {!center && <ActivityIndicator style={StyleSheet.absoluteFill} />}
      <WebView
        key={webKey}
        originWhitelist={['*']}
        style={StyleSheet.absoluteFill}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default LeafletMap;
