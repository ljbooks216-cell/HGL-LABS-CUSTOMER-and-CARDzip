import React, { useState, useEffect, useRef } from 'react';
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
import { getJobCounter, saveJobCounter, saveCard } from '../utils/storage';

const ITEMS = [
  'Ring', 'Earring', 'Tops', 'Necklace', 'Chain', 'Bangle',
  'Pendant', 'Bracelet', 'Nose Pin', 'Anklet', 'Other'
];

const PURITY_OPTIONS = [
  '24K (999)', '22K (916)', '18K (750)', '14K (585)'
];

const TYPE_OPTIONS = ['LS / FS', 'LS', 'FS', 'Both'];

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
    
    const jobNo = `HGL${String(jobCounter).padStart(5, '0')}`;
    const today = new Date().toLocaleDateString('en-IN');

    const data = {
      jobNo,
      jobCounter,
      date: today,
      item: itemValue || '-',
      purity: purity || '-',
      weight: weight || '-',
      pieces: pieces || '-',
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
    };

    await saveCard(cardRecord);
    await saveJobCounter(jobCounter);
    setJobCounter(jobCounter + 1);
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
        <View style={styles.header}>
          <Text style={styles.title}>Hindustan Gemological Laboratory</Text>
          <Text style={styles.subtitle}>Card Generator with QR</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Item</Text>
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
              placeholder="Custom item name"
              value={customItem}
              onChangeText={setCustomItem}
            />
          )}

          <Text style={styles.label}>Select Purity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {PURITY_OPTIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, purity === p && styles.chipSelected]}
                onPress={() => setPurity(p)}
              >
                <Text style={[styles.chipText, purity === p && styles.chipTextSelected]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Weight (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Pieces</Text>
              <TextInput
                style={styles.input}
                placeholder="Pieces"
                value={pieces}
                onChangeText={setPieces}
                keyboardType="numeric"
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setFrontPhoto)}>
              {frontPhoto ? (
                <Image source={{ uri: frontPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#b8860b" />
                  <Text style={styles.photoLabel}>Front Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setBackPhoto)}>
              {backPhoto ? (
                <Image source={{ uri: backPhoto }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#b8860b" />
                  <Text style={styles.photoLabel}>Back Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={generateCard}>
          <Ionicons name="qr-code" size={20} color="#fff" />
          <Text style={styles.generateBtnText}>Generate Card</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal visible={showPreview} animationType="slide" onRequestClose={closePreview}>
        <ScrollView style={styles.previewContainer}>
          <View style={styles.cardPreview}>
            <View style={styles.cardHeader}>
              <Text style={styles.hallmark}>HGL HALLMARKED</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Job No:</Text>
                <Text style={styles.cardValue}>{cardData?.jobNo}</Text>
                <Text style={styles.cardLabel}>Date:</Text>
                <Text style={styles.cardValue}>{cardData?.date}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Article:</Text>
                <Text style={styles.cardValue}>{cardData?.item}</Text>
                <Text style={[styles.cardValue, styles.goldText]}>{cardData?.purity}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Gross Wt:</Text>
                <Text style={styles.cardValue}>{cardData?.weight} g</Text>
                <Text style={styles.cardLabel}>Pcs:</Text>
                <Text style={styles.cardValue}>{cardData?.pieces}</Text>
                <Text style={styles.cardLabel}>Marking:</Text>
                <Text style={styles.cardValue}>{cardData?.type}</Text>
              </View>

              <View style={styles.photoContainer}>
                {cardData?.frontPhoto && (
                  <Image source={{ uri: cardData.frontPhoto }} style={styles.cardPhoto} />
                )}
                {cardData?.backPhoto && (
                  <Image source={{ uri: cardData.backPhoto }} style={styles.cardPhoto} />
                )}
              </View>

              <Text style={styles.cardLabel}>Description:</Text>
              <Text style={styles.cardDescription}>{cardData?.description}</Text>

              <View style={styles.qrContainer}>
                {cardData?.qrValue && (
                  <QRCode value={cardData.qrValue} size={100} />
                )}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Hindustan Gemological Laboratory - Chennai</Text>
                <Text style={styles.footerText}>+91 44 48553527 | info@hgl-labs.com | www.hgl-labs.com</Text>
              </View>
            </View>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.closeBtn} onPress={closePreview}>
              <Text style={styles.closeBtnText}>Close & Create New</Text>
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
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b8860b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#b8860b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b8860b',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b8860b',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: '#b8860b',
    borderColor: '#b8860b',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    height: 150,
    borderWidth: 2,
    borderColor: '#b8860b',
    borderRadius: 12,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  photoLabel: {
    marginTop: 5,
    color: '#b8860b',
    fontWeight: '600',
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
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  cardPreview: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#b8860b',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#b8860b',
    alignItems: 'center',
  },
  hallmark: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#b8860b',
  },
  cardContent: {
    padding: 20,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  cardValue: {
    color: '#333',
    marginRight: 15,
  },
  goldText: {
    color: '#b8860b',
    fontWeight: 'bold',
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  cardPhoto: {
    width: '45%',
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  cardDescription: {
    color: '#333',
    marginTop: 5,
    marginBottom: 15,
  },
  qrContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  previewActions: {
    marginTop: 20,
  },
  closeBtn: {
    backgroundColor: '#777',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});
