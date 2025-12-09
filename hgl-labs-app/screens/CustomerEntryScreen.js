import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { saveCustomer } from '../utils/storage';

const ITEMS = [
  'Ring', 'Earring', 'Tops', 'Necklace', 'Chain', 'Bangle',
  'Pendant', 'Bracelet', 'Nose Pin', 'Anklet', 'Mangalsutra', 'Coin', 'Other'
];

const STATUS_OPTIONS = ['Received', 'Testing', 'Marking', 'Ready', 'Delivered'];

export default function CustomerEntryScreen() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([{ item: '', customItem: '', qty: '1' }]);
  const [status, setStatus] = useState('Received');
  const [remarks, setRemarks] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const addItemRow = () => {
    setItems([...items, { item: '', customItem: '', qty: '1' }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter customer name');
      return;
    }

    const validItems = [];
    let total = 0;

    items.forEach((row) => {
      const qty = parseInt(row.qty) || 0;
      if (row.item && qty > 0) {
        const itemName = row.item === 'Other' ? (row.customItem || 'Custom') : row.item;
        validItems.push(qty > 1 ? `${itemName} x${qty}` : itemName);
        total += qty;
      }
    });

    if (validItems.length === 0) {
      Alert.alert('Required', 'Please add at least one item');
      return;
    }

    const now = new Date();
    const customer = {
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      name: name.trim(),
      mobile: mobile.trim() || '-',
      address: address.trim() || '-',
      items: validItems.join(', '),
      total,
      status,
      remarks: remarks.trim() || '-',
    };

    const success = await saveCustomer(customer);
    if (success) {
      setSaveStatus(`Saved! ${name} - ${total} pcs`);
      setName('');
      setMobile('');
      setAddress('');
      setItems([{ item: '', customItem: '', qty: '1' }]);
      setStatus('Received');
      setRemarks('');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      Alert.alert('Error', 'Failed to save customer record');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header subtitle="Customer Entry" />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Customer Details</Text>
          </View>
          
          <Text style={styles.label}>Customer Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter address (optional)"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={2}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="diamond" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Items Given for Testing</Text>
          </View>
          
          {items.map((row, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemLabel}>Item {index + 1}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {ITEMS.map((itemOption) => (
                  <TouchableOpacity
                    key={itemOption}
                    style={[
                      styles.itemChip,
                      row.item === itemOption && styles.itemChipSelected
                    ]}
                    onPress={() => updateItem(index, 'item', itemOption)}
                  >
                    <Text style={[
                      styles.itemChipText,
                      row.item === itemOption && styles.itemChipTextSelected
                    ]}>
                      {itemOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {row.item === 'Other' && (
                <TextInput
                  style={styles.customInput}
                  placeholder="Specify item name"
                  value={row.customItem}
                  onChangeText={(text) => updateItem(index, 'customItem', text)}
                  placeholderTextColor="#999"
                />
              )}
              
              <View style={styles.qtyRow}>
                <View style={styles.qtyContainer}>
                  <Text style={styles.qtyLabel}>Quantity:</Text>
                  <TextInput
                    style={styles.qtyInput}
                    placeholder="1"
                    value={row.qty}
                    onChangeText={(text) => updateItem(index, 'qty', text)}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                
                {items.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItemRow(index)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addItemRow}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Another Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={20} color="#b8860b" />
            <Text style={styles.cardTitle}>Status & Remarks</Text>
          </View>

          <Text style={styles.label}>Current Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, status === s && styles.statusChipSelected]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.statusChipText, status === s && styles.statusChipTextSelected]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions or notes"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={2}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>Save Customer Record</Text>
        </TouchableOpacity>

        {saveStatus ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={styles.successText}>{saveStatus}</Text>
          </View>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    marginBottom: 6,
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
    color: '#333',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginBottom: 10,
  },
  itemRow: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#b8860b',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b8860b',
    marginBottom: 8,
  },
  itemChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  itemChipSelected: {
    backgroundColor: '#b8860b',
    borderColor: '#b8860b',
  },
  itemChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  itemChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  qtyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 10,
  },
  qtyInput: {
    width: 80,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  removeBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066b3',
    padding: 14,
    borderRadius: 10,
    marginTop: 5,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  statusChipSelected: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  statusChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  statusChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveBtn: {
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
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 15,
    backgroundColor: '#d4edda',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  successText: {
    color: '#155724',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
