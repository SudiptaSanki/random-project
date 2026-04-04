import 'react-native-get-random-values';
import '@ethersproject/shims';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Alert, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ethers } from 'ethers';
import contractInfo from './constants/contractInfo.json';

// Pull credentials blindly from .env
const PRIVATE_KEY = process.env.EXPO_PUBLIC_WALLET_KEY;
const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL;

export default function App() {
  const [viewState, setViewState] = useState('home');
  const [crisisLevel, setCrisisLevel] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [verifyProgress, setVerifyProgress] = useState(0);

  // Dynamic Web3 State
  const [reputationScore, setReputationScore] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    fetchBlockchainData();
  }, [viewState]);

  const fetchBlockchainData = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      setWalletAddress(wallet.address);

      const sbtContract = new ethers.Contract(
        contractInfo.ResponderSBT.address,
        contractInfo.ResponderSBT.abi,
        wallet
      );

      // Fetch Real Blockchain Data
      const [avgScore, count] = await sbtContract.getResponderRank(wallet.address);
      setReputationScore(Number(avgScore) || 0);

      const badgeIds = await sbtContract.getResponderBadges(wallet.address);
      const fetchedBadges = [];
      for (let i = 0; i < badgeIds.length; i++) {
         const data = await sbtContract.badgeData(badgeIds[i]);
         // data returns struct [tier, score, responder]
         fetchedBadges.push(`${data[0]} 🏅 (Score: ${data[1]})`);
      }
      if (fetchedBadges.length === 0) fetchedBadges.push("No Badges Yet - Be A Hero!");
      setEarnedBadges(fetchedBadges);
    } catch (e) {
      console.log("Web3 Error: Make sure Hardhat Node is running!", e);
      setEarnedBadges(["Blockchain Disconnected"]);
    }
  };

  const executeBlockchainMint = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      const sbtContract = new ethers.Contract(
        contractInfo.ResponderSBT.address,
        contractInfo.ResponderSBT.abi,
        wallet
      );
      
      // Calculate a random high score for the demo (75-99)
      const aiScore = Math.floor(Math.random() * (99 - 75 + 1) + 75);
      
      const tx = await sbtContract.assignBadge(wallet.address, aiScore);
      await tx.wait(); // Wait for confirmation
      console.log("Successfully Minted SBT on Hardhat!");
    } catch(e) {
      console.error(e);
    }
  };

  const startEmergencyFlow = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();

    Alert.alert(
      "Emergency Type",
      "Please select the crisis severity:",
      [
        { text: "Minor Crisis", onPress: () => triggerCamera('MINOR') },
        { text: "Major Crisis", onPress: () => triggerCamera('MAJOR'), style: 'destructive' },
        { text: "Cancel", style: 'cancel' }
      ]
    );
  };

  const triggerCamera = async (level) => {
    setCrisisLevel(level);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      
      // Hit python backend optionally
      try {
        await fetch(`http://192.168.1.34:8000/api/emergency/trigger`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ severity: level, user_id: walletAddress || 'demo' })
        });
      } catch(e) {}
      
      startVerificationSimulation();
    }
  };

  const startVerificationSimulation = () => {
    setViewState('scanning');
    setVerifyProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setVerifyProgress(progress);
      if (progress >= 50) {
        clearInterval(interval);
        executeBlockchainMint(); // Interacts with smart contract!
        setTimeout(() => triggerGlobalAlert(), 1500);
      }
    }, 400); 
  };

  const triggerGlobalAlert = () => {
    setViewState('verified');
    Alert.alert(
      "🚨 VERIFIED EMERGENCY 🚨", 
      "AI & 48 Guardians within 500m have confirmed!" +
      "\n\nSending mass-vibration alert to 2km radius." +
      "\nMedical Team Dispatched!" +
      "\n\nYou just earned a new Web3 SBT Badge!"
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <MaterialCommunityIcons name="shield-alert-outline" color="#ef4444" size={28} />
        <Text style={styles.headerTitle}>FireCare</Text>
      </View>
      <TouchableOpacity style={styles.profileBadge} onPress={() => setViewState(viewState === 'profile' ? 'home' : 'profile')}>
        <MaterialCommunityIcons name={viewState === 'profile' ? "home" : "account-circle"} color="#fbbf24" size={28} />
      </TouchableOpacity>
    </View>
  );

  const renderHome = () => (
    <View style={styles.centerContainer}>
      <Animated.View style={[styles.sosWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.sosButton}>
          <TouchableOpacity activeOpacity={0.8} onPress={startEmergencyFlow} style={styles.sosTouchable}>
            <MaterialCommunityIcons name="alarm-light" color="white" size={64} />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>HOLD FOR EMERGENCY</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <Text style={styles.profileTitle}>My Web3 Profile</Text>
      
      <View style={styles.glassCard}>
        <MaterialCommunityIcons name="wallet" color="#3b82f6" size={24} />
        <Text style={styles.cardHighlight}>Connected Wallet</Text>
        <Text style={styles.cardBody}>{walletAddress}</Text>
      </View>

      <View style={styles.glassCard}>
        <MaterialCommunityIcons name="star-circle" color="#fbbf24" size={24} />
        <Text style={styles.cardHighlight}>Live Reputation Points (On-Chain)</Text>
        <Text style={styles.cardBody}>{reputationScore} PTS AVG</Text>
      </View>

      <View style={styles.glassCard}>
        <MaterialCommunityIcons name="medal" color="#ef4444" size={24} />
        <Text style={styles.cardHighlight}>Soulbound Tokens (SBTs)</Text>
        {earnedBadges.map((badge, i) => (
          <Text key={i} style={styles.badgeListText}>{badge}</Text>
        ))}
      </View>

      <TouchableOpacity onPress={() => setViewState('home')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );

  const renderScanning = () => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="radar" color="#3b82f6" size={80} />
      <Text style={styles.scanningText}>Alerting 50 nearest people...</Text>
      <Text style={styles.scanningSub}>AI Scene Analysis in progress.</Text>
      {capturedImage && (<Image source={{ uri: capturedImage }} style={styles.previewImage} />)}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${(verifyProgress / 50) * 100}%` }]} />
      </View>
      <Text style={styles.verifyCount}>{verifyProgress} / 50 Guardians Verified</Text>
    </View>
  );

  const renderVerified = () => (
    <View style={styles.centerContainer}>
       <MaterialCommunityIcons name="check-decagram" color="#10b981" size={100} />
       <Text style={styles.successText}>Crisis Authenticated</Text>
       <Text style={styles.successSub}>Alerting all phones within 2km radius.</Text>
       <View style={[styles.glassCard, {marginTop: 30, backgroundColor: 'rgba(239, 68, 68, 0.2)'}]}>
         <MaterialCommunityIcons name="ambulance" color="#fca5a5" size={32} />
         <Text style={[styles.cardHighlight, {color: 'white', marginTop: 10}]}>Medical & Support Teams En Route</Text>
         <Text style={styles.cardBody}>Calculating shortest navigation path...</Text>
       </View>
       <TouchableOpacity onPress={() => setViewState('home')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Return to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginTop: 50 }}>
        {renderHeader()}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {viewState === 'home' && renderHome()}
          {viewState === 'profile' && renderProfile()}
          {viewState === 'scanning' && renderScanning()}
          {viewState === 'verified' && renderVerified()}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, borderRadius: 24, marginHorizontal: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 20
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  profileBadge: { padding: 4 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sosWrapper: { width: 250, height: 250, borderRadius: 125, padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.15)', justifyContent: 'center', alignItems: 'center' },
  sosButton: { width: '100%', height: '100%', borderRadius: 125, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 20, borderWidth: 4, borderColor: '#fca5a5', backgroundColor: '#dc2626' },
  sosTouchable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sosText: { color: 'white', fontSize: 48, fontWeight: '900', marginTop: 8 },
  sosSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  profileContainer: { padding: 20 },
  profileTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  glassCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 15, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  cardHighlight: { color: '#a78bfa', fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  cardBody: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  badgeListText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  backButton: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 100, alignItems: 'center', marginTop: 20 },
  backButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  scanningText: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
  scanningSub: { color: '#94a3b8', fontSize: 16, marginTop: 8, marginBottom: 30, textAlign: 'center' },
  previewImage: { width: 200, height: 200, borderRadius: 16, marginBottom: 30, borderWidth: 2, borderColor: '#3b82f6' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: '#1e293b', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 10 },
  verifyCount: { color: '#60a5fa', fontSize: 16, marginTop: 15, fontWeight: '600' },
  successText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 20 },
  successSub: { color: '#94a3b8', fontSize: 16, marginTop: 8, textAlign: 'center' },
});
