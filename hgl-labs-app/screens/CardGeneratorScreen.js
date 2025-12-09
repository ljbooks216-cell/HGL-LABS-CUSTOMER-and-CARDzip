import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import Header from '../components/Header';
import { getJobCounter, saveJobCounter, saveCard } from '../utils/storage';
import { generateCertificatePDF } from '../utils/exportUtils';

const ITEMS = [
  'Ring', 'Earring', 'Tops', 'Necklace', 'Chain', 'Bangle',
  'Pendant', 'Bracelet', 'Nose Pin', 'Anklet', 'Mangalsutra', 'Coin', 'Other'
];

const PURITY_OPTIONS = [
  { label: '24K (999)', value: '24K (999)' },
  { label: '22K (916)', value: '22K (916)' },
  { label: '18K (750)', value: '18K (750)' },
  { label: '14K (585)', value: '14K (585)' },
  { label: 'Silver 999', value: 'Silver 999' },
  { label: 'Silver 925', value: 'Silver 925' },
];

const TYPE_OPTIONS = ['LS / FS', 'LS Only', 'FS Only', 'Both'];

const QR_LINK = 'https://hgl-labs.com/verify/';

export default function CardGeneratorScreen() {
  const [jobCounter, setJobCounter] = useState(1);
  const [selectedItem, setSelectedItem] = useState('');
  const [customItem, setCustomItem] = useState('');
  const [purity, setPurity] = useState('');
  const [weight, setWeight] = useState('');
  const [pieces, setPieces] = useState('1');
  const [type, setType] = useState('LS / FS');
  const [description, setDescription] = useState('');
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadJobCounter();
  }, []);

  const loadJobCounter = async () => {
    const counter = await getJobCounter();
    setJobCounter(counter);
  };

  const pickImage = async (setImage) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const generateCard = async () => {
    const itemValue = selectedItem === 'Other' ? customItem.trim() : selectedItem;
    
    if (!itemValue) {
      Alert.alert('Required', 'Please select an item');
      return;
    }
    
    if (!purity) {
      Alert.alert('Required', 'Please select purity');
      return;
    }

    const jobNo = `HGL${String(jobCounter).padStart(5, '0')}`;
    const today = new Date().toLocaleDateString('en-IN');

    const data = {
      jobNo,
      jobCounter,
      date: today,
      item: itemValue || '-',
      purity: purity || '-',
      weight: weight || '-',
      pieces: pieces || '1',
      type: type || '-',
      description: description || '-',
      frontPhoto,
      backPhoto,
      qrValue: QR_LINK + jobCounter,
    };

    setCardData(data);
    setShowPreview(true);

    const cardRecord = {
      jobNo: jobCounter,
      date: today,
      item: data.item,
      karat: data.purity,
      weight: data.weight,
      pieces: data.pieces,
      type: data.type,
      desc: data.description,
      status: 'Issued',
    };

    await saveCard(cardRecord);
    await saveJobCounter(jobCounter);
    setJobCounter(jobCounter + 1);
  };

  const handleExportPDF = async () => {
    if (!cardData) return;
    setExporting(true);
    const success = await generateCertificatePDF(cardData);
    setExporting(false);
    if (!success) {
      Alert.alert('Export Error', 'Failed to generate PDF');
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedItem('');
    setCustomItem('');
    setPurity('');
    setWeight('');
    setPieces('1');
    setType('LS / FS');
    setDescription('');
    setFrontPhoto(null);
    setBackPhoto(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header subtitle="Certificate Generator" />

        <View style={styles.jobBadge}>
          <Ionicons name="document-text" size={18} color="#b8860b" />
          <Text style={styles.jobBadgeText}>Next Job: {`HGL${String(jobCounter).padStart(5, '0')}`}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="diamond" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Article Details</Text>
          </View>

          <Text style={styles.label}>Select Item <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {ITEMS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, selectedItem === item && styles.chipSelected]}
                onPress={() => setSelectedItem(item)}
              >
                <Text style={[styles.chipText, selectedItem === item && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedItem === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Specify item name"
              value={customItem}
              onChangeText={setCustomItem}
              placeholderTextColor="#999"
            />
          )}

          <Text style={styles.label}>Select Purity <Text style={styles.required}>*</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {PURITY_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.chip, purity === p.value && styles.chipSelected]}
                onPress={() => setPurity(p.value)}
              >
                <Text style={[styles.chipText, purity === p.value && styles.chipTextSelected]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Gross Weight (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>No. of Pieces</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={pieces}
                onChangeText={setPieces}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <Text style={styles.label}>Marking Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {TYPE_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipSelected]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Item Photos</Text>
          </View>
          
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setFrontPhoto)}>
              {frontPhoto ? (
                <Image source={{ uri: frontPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image" size={36} color="#b8860b" />
                  <Text style={styles.photoLabel}>Front View</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setBackPhoto)}>
              {backPhoto ? (
                <Image source={{ uri: backPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image" size={36} color="#b8860b" />
                  <Text style={styles.photoLabel}>Back View</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Description</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Item description, special features, stone details, etc."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={generateCard}>
          <Ionicons name="qr-code" size={22} color="#fff" />
          <Text style={styles.generateBtnText}>Generate Certificate</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal visible={showPreview} animationType="slide" onRequestClose={closePreview}>
        <ScrollView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Certificate Preview</Text>
            <TouchableOpacity onPress={closePreview} style={styles.closeIconBtn}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.certificate}>
            <View style={styles.certHeader}>
              <Text style={styles.certCompany}>HINDUSTAN GEMOLOGICAL LABORATORY</Text>
              <Text style={styles.certTagline}>Accurate. Confidential. Integrity</Text>
              <View style={styles.hallmarkBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
                <Text style={styles.hallmarkText}>HGL HALLMARKED</Text>
              </View>
            </View>

            <View style={styles.certBody}>
              <View style={styles.certRow}>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Job Number</Text>
                  <Text style={styles.certValue}>{cardData?.jobNo}</Text>
                </View>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Date of Issue</Text>
                  <Text style={styles.certValue}>{cardData?.date}</Text>
                </View>
              </View>

              <View style={styles.certDivider} />

              <View style={styles.certRow}>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Article</Text>
                  <Text style={styles.certValue}>{cardData?.item}</Text>
                </View>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Purity</Text>
                  <Text style={[styles.certValue, styles.purityValue]}>{cardData?.purity}</Text>
                </View>
              </View>

              <View style={styles.certRow}>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Gross Weight</Text>
                  <Text style={styles.certValue}>{cardData?.weight} g</Text>
                </View>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Pieces</Text>
                  <Text style={styles.certValue}>{cardData?.pieces}</Text>
                </View>
                <View style={styles.certField}>
                  <Text style={styles.certLabel}>Marking</Text>
                  <Text style={styles.certValue}>{cardData?.type}</Text>
                </View>
              </View>

              {(cardData?.frontPhoto || cardData?.backPhoto) && (
                <View style={styles.photoContainer}>
                  {cardData?.frontPhoto && (
                    <Image source={{ uri: cardData.frontPhoto }} style={styles.certPhoto} />
                  )}
                  {cardData?.backPhoto && (
                    <Image source={{ uri: cardData.backPhoto }} style={styles.certPhoto} />
                  )}
                </View>
              )}

              {cardData?.description && cardData.description !== '-' && (
                <>
                  <View style={styles.certDivider} />
                  <Text style={styles.certLabel}>Description</Text>
                  <Text style={styles.certDescription}>{cardData?.description}</Text>
                </>
              )}

              <View style={styles.qrSection}>
                <View style={styles.qrBox}>
                  {cardData?.qrValue && (
                    <QRCode value={cardData.qrValue} size={100} />
                  )}
                </View>
                <Text style={styles.qrText}>Scan to verify authenticity</Text>
              </View>
            </View>

            <View style={styles.certFooter}>
              <Text style={styles.footerText}>www.hgl-labs.com | info@hgl-labs.com</Text>
              <Text style={styles.footerText}>+91 44 48553527 | Chennai, India</Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.exportBtn, exporting && styles.exportBtnDisabled]} 
              onPress={handleExportPDF}
              disabled={exporting}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.exportBtnText}>{exporting ? 'Exporting...' : 'Export as PDF'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.newBtn} onPress={closePreview}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.newBtnText}>Create New Certificate</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  jobBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff8e7',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0e0c0',
  },
  jobBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#b8860b',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginBottom: 5,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#b8860b',
    borderColor: '#b8860b',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    height: 140,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLabel: {
    marginTop: 8,
    color: '#b8860b',
    fontWeight: '600',
    fontSize: 13,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b8860b',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#b8860b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeIconBtn: {
    padding: 5,
  },
  certificate: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#b8860b',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  certHeader: {
    backgroundColor: '#b8860b',
    padding: 25,
    alignItems: 'center',
  },
  certCompany: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  certTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    marginTop: 5,
  },
  hallmarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  hallmarkText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 13,
  },
  certBody: {
    padding: 20,
  },
  certRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  certField: {
    flex: 1,
  },
  certLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  certValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  purityValue: {
    color: '#b8860b',
    fontSize: 17,
    fontWeight: '700',
  },
  certDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 15,
  },
  certPhoto: {
    width: 130,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  certDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 5,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  qrBox: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  qrText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  certFooter: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  previewActions: {
    paddingHorizontal: 15,
    gap: 12,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066b3',
    padding: 15,
    borderRadius: 12,
  },
  exportBtnDisabled: {
    backgroundColor: '#999',
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 12,
  },
  newBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
