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
import { saveCustomer } from '../utils/storage';

const ITEMS = [
  'Ring', 'Earring', 'Tops', 'Necklace', 'Chain', 'Bangle',
  'Pendant', 'Bracelet', 'Nose Pin', 'Anklet', 'Other'
];

export default function CustomerEntryScreen() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [items, setItems] = useState([{ item: '', customItem: '', qty: '1' }]);
  const [status, setStatus] = useState('');

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
      Alert.alert('Error', 'Please enter customer name');
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
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const now = new Date();
    const customer = {
      date: now.toLocaleDateString('en-IN'),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      name: name.trim(),
      mobile: mobile.trim() || '-',
      items: validItems.join(', '),
      total,
    };

    const success = await saveCustomer(customer);
    if (success) {
      setStatus(`Saved! ${name} - ${total} pcs`);
      setName('');
      setMobile('');
      setItems([{ item: '', customItem: '', qty: '1' }]);
      setTimeout(() => setStatus(''), 3000);
    } else {
      Alert.alert('Error', 'Failed to save customer');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hindustan Gemological Laboratory</Text>
          <Text style={styles.subtitle}>Customer Entry</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Given</Text>
          
          {items.map((row, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemSelect}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              </View>
              
              {row.item === 'Other' && (
                <TextInput
                  style={styles.customInput}
                  placeholder="Custom item name"
                  value={row.customItem}
                  onChangeText={(text) => updateItem(index, 'customItem', text)}
                />
              )}
              
              <View style={styles.qtyRow}>
                <TextInput
                  style={styles.qtyInput}
                  placeholder="Qty"
                  value={row.qty}
                  onChangeText={(text) => updateItem(index, 'qty', text)}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItemRow(index)}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addItemRow}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Customer Record</Text>
        </TouchableOpacity>

        {status ? (
          <View style={styles.statusContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            <Text style={styles.statusText}>{status}</Text>
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
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b8860b',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  itemRow: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itemSelect: {
    marginBottom: 10,
  },
  itemChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemChipSelected: {
    backgroundColor: '#b8860b',
    borderColor: '#b8860b',
  },
  itemChipText: {
    fontSize: 14,
    color: '#333',
  },
  itemChipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#b8860b',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b8860b',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  removeBtn: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#337ab7',
    padding: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  saveBtn: {
    backgroundColor: '#b8860b',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#d4edda',
    borderRadius: 8,
  },
  statusText: {
    color: '#28a745',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 30,
  },
});
