import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatarArea}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={56} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.nome || 'Usuário'}</Text>
        {!!user?.email && <Text style={styles.email}>{user?.email}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <View style={styles.row}><Text style={styles.label}>Nome:</Text><Text style={styles.value}>{user?.nome || '—'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{user?.email || '—'}</Text></View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out" size={18} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', padding: 20 },
  avatarArea: { alignItems: 'center', marginTop: 40, marginBottom: 24 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E88E5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '700', color: '#1E2A33' },
  email: { fontSize: 14, color: '#4A5A66', marginTop: 4 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#334', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 70, fontWeight: '600', color: '#556' },
  value: { flex: 1, color: '#223' },
  footer: { marginTop: 'auto', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, alignItems: 'center', gap: 8 },
  logoutText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
});
