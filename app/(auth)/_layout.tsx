import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Slot } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) return <Redirect href="/(tabs)" />;

  return <Slot />;
}
