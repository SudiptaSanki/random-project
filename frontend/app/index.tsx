import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Siren, MapPin, ShieldAlert, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function Index() {
  const [pulseAnim] = useState(new Animated.Value(1));

  const pulseSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // Trigger emergency API call here
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <ShieldAlert color="#ef4444" size={28} />
          <Text style={styles.headerTitle}>FireCare</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge}>
          <Text style={styles.badgeText}>SBT: HERO 🥇</Text>
        </TouchableOpacity>
      </BlurView>

      {/* Main SOS Button Context */}
      <View style={styles.centerContainer}>
        <Animated.View style={[styles.sosWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#ef4444', '#991b1b']}
            style={styles.sosButton}
          >
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={pulseSOS}
              style={styles.sosTouchable}
            >
              <Siren color="white" size={64} />
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubtext}>HOLD FOR EMERGENCY</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Info Cards below */}
      <View style={styles.bottomSection}>
        <BlurView intensity={30} tint="dark" style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <MapPin color="#3b82f6" size={24} />
            <Text style={styles.cardTitle}>Nearby Responders</Text>
          </View>
          <Text style={styles.cardHighlight}>50 Guardians within 5km</Text>
          <Text style={styles.cardBody}>AI and local guardians are on standby to verify and route necessary emergency services.</Text>
        </BlurView>

        <TouchableOpacity activeOpacity={0.7}>
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.actionButton}>
             <Navigation color="white" size={20} />
             <Text style={styles.actionText}>View Active Alerts Map</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  profileBadge: {
    backgroundColor: 'rgba(255,165,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.5)',
  },
  badgeText: {
    color: '#fbbf24',
    fontWeight: '700',
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosWrapper: {
    width: 250,
    height: 250,
    borderRadius: 125,
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButton: {
    width: '100%',
    height: '100%',
    borderRadius: 125,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 4,
    borderColor: '#fca5a5',
  },
  sosTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    color: 'white',
    fontSize: 48,
    fontWeight: '900',
    marginTop: 8,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  glassCard: {
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cardHighlight: {
    color: '#a78bfa',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 100,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
