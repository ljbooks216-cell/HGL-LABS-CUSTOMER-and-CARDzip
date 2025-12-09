import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCustomers, getCards, clearAllData } from '../utils/storage';

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [cards, setCards] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const customerData = await getCustomers();
    const cardData = await getCards();
    setCustomers(customerData);
    setCards(cardData);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all records? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await loadData();
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const renderCustomerTable = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.dateCol]}>Date</Text>
        <Text style={[styles.tableHeaderCell, styles.nameCol]}>Name</Text>
        <Text style={[styles.tableHeaderCell, styles.itemsCol]}>Items</Text>
        <Text style={[styles.tableHeaderCell, styles.totalCol]}>Total</Text>
      </View>
      
      {customers.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No customer records found</Text>
        </View>
      ) : (
        customers.map((customer, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
            <View style={styles.dateCol}>
              <Text style={styles.tableCell}>{customer.date}</Text>
              <Text style={styles.timeText}>{customer.time}</Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.tableCell}>{customer.name}</Text>
              <Text style={styles.mobileText}>{customer.mobile}</Text>
            </View>
            <Text style={[styles.tableCell, styles.itemsCol]}>{customer.items}</Text>
            <Text style={[styles.tableCell, styles.totalCol, styles.totalText]}>{customer.total}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderCardsTable = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.jobCol]}>Job No</Text>
        <Text style={[styles.tableHeaderCell, styles.dateCol2]}>Date</Text>
        <Text style={[styles.tableHeaderCell, styles.itemCol]}>Item</Text>
        <Text style={[styles.tableHeaderCell, styles.purityCol]}>Purity</Text>
        <Text style={[styles.tableHeaderCell, styles.wtCol]}>Wt</Text>
      </View>
      
      {cards.length === 0 ? (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No card records found</Text>
        </View>
      ) : (
        cards.map((card, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
            <Text style={[styles.tableCell, styles.jobCol, styles.jobText]}>
              HGL{String(card.jobNo).padStart(5, '0')}
            </Text>
            <Text style={[styles.tableCell, styles.dateCol2]}>{card.date}</Text>
            <Text style={[styles.tableCell, styles.itemCol]}>{card.item}</Text>
            <Text style={[styles.tableCell, styles.purityCol]}>{card.karat}</Text>
            <Text style={[styles.tableCell, styles.wtCol]}>{card.weight}g</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hindustan Gemological Laboratory</Text>
        <Text style={styles.subtitle}>View All Records</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'customers' && styles.activeTab]}
          onPress={() => setActiveTab('customers')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'customers' ? '#fff' : '#b8860b'} 
          />
          <Text style={[styles.tabText, activeTab === 'customers' && styles.activeTabText]}>
            Customers ({customers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
          onPress={() => setActiveTab('cards')}
        >
          <Ionicons 
            name="card" 
            size={20} 
            color={activeTab === 'cards' ? '#fff' : '#b8860b'} 
          />
          <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
            Cards ({cards.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b8860b']} />
        }
      >
        <View style={styles.section}>
          {activeTab === 'customers' ? renderCustomerTable() : renderCardsTable()}
        </View>

        {(customers.length > 0 || cards.length > 0) && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearData}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.clearBtnText}>Clear All Data</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b8860b',
    backgroundColor: '#fff',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#b8860b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b8860b',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#b8860b',
    overflow: 'hidden',
  },
  tableContainer: {
    minWidth: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#b8860b',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  dateCol: { flex: 1.2 },
  nameCol: { flex: 1.5 },
  itemsCol: { flex: 2, textAlign: 'left', paddingLeft: 5 },
  totalCol: { flex: 0.6 },
  jobCol: { flex: 1.2 },
  dateCol2: { flex: 1 },
  itemCol: { flex: 1 },
  purityCol: { flex: 1 },
  wtCol: { flex: 0.8 },
  timeText: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  mobileText: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  totalText: {
    fontWeight: 'bold',
    color: '#b8860b',
  },
  jobText: {
    fontWeight: 'bold',
    color: '#b8860b',
  },
  emptyRow: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});
