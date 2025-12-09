import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import { getCustomers, getCards, clearAllData } from '../utils/storage';
import { 
  generateCustomersPDF, 
  generateCardsPDF, 
  generateCustomersCSV, 
  generateCardsCSV 
} from '../utils/exportUtils';

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [cards, setCards] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    const customerData = await getCustomers();
    const cardData = await getCards();
    setCustomers(customerData.reverse());
    setCards(cardData.reverse());
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
      'Are you sure you want to delete all records? This action cannot be undone.',
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

  const handleExportPDF = async () => {
    setExporting(true);
    const success = activeTab === 'customers' 
      ? await generateCustomersPDF(filteredCustomers)
      : await generateCardsPDF(filteredCards);
    setExporting(false);
    if (!success) {
      Alert.alert('Export Error', 'Failed to generate PDF');
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    const success = activeTab === 'customers' 
      ? await generateCustomersCSV(filteredCustomers)
      : await generateCardsCSV(filteredCards);
    setExporting(false);
    if (!success) {
      Alert.alert('Export Error', 'Failed to generate CSV');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCards = cards.filter(c => 
    String(c.jobNo).includes(searchQuery) ||
    c.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.karat && c.karat.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#28a745';
      case 'Ready': return '#17a2b8';
      case 'Marking': return '#ffc107';
      case 'Testing': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const todayCustomers = customers.filter(c => c.date === new Date().toLocaleDateString('en-IN')).length;
  const todayCards = cards.filter(c => c.date === new Date().toLocaleDateString('en-IN')).length;

  const renderDashboard = () => (
    <View style={styles.dashboard}>
      <View style={styles.statCard}>
        <Ionicons name="people" size={28} color="#0066b3" />
        <Text style={styles.statNumber}>{customers.length}</Text>
        <Text style={styles.statLabel}>Total Customers</Text>
        <Text style={styles.statSubtext}>+{todayCustomers} today</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="card" size={28} color="#b8860b" />
        <Text style={styles.statNumber}>{cards.length}</Text>
        <Text style={styles.statLabel}>Cards Issued</Text>
        <Text style={styles.statSubtext}>+{todayCards} today</Text>
      </View>
    </View>
  );

  const renderCustomerRow = (customer, index) => (
    <View key={index} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitle}>
          <Ionicons name="person" size={18} color="#333" />
          <Text style={styles.customerName}>{customer.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) }]}>
          <Text style={styles.statusText}>{customer.status || 'Received'}</Text>
        </View>
      </View>
      <View style={styles.recordDetails}>
        <View style={styles.recordRow}>
          <Ionicons name="calendar" size={14} color="#888" />
          <Text style={styles.recordText}>{customer.date} {customer.time}</Text>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="call" size={14} color="#888" />
          <Text style={styles.recordText}>{customer.mobile}</Text>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="diamond" size={14} color="#888" />
          <Text style={styles.recordText}>{customer.items}</Text>
        </View>
      </View>
      <View style={styles.recordFooter}>
        <Text style={styles.totalLabel}>Total Pieces:</Text>
        <Text style={styles.totalValue}>{customer.total}</Text>
      </View>
    </View>
  );

  const renderCardRow = (card, index) => (
    <View key={index} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitle}>
          <Ionicons name="document-text" size={18} color="#b8860b" />
          <Text style={styles.jobNumber}>HGL{String(card.jobNo).padStart(5, '0')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#28a745' }]}>
          <Text style={styles.statusText}>{card.status || 'Issued'}</Text>
        </View>
      </View>
      <View style={styles.recordDetails}>
        <View style={styles.recordRow}>
          <Ionicons name="calendar" size={14} color="#888" />
          <Text style={styles.recordText}>{card.date}</Text>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="diamond" size={14} color="#888" />
          <Text style={styles.recordText}>{card.item}</Text>
        </View>
        <View style={styles.recordRow}>
          <Ionicons name="shield-checkmark" size={14} color="#b8860b" />
          <Text style={[styles.recordText, styles.purityText]}>{card.karat}</Text>
        </View>
      </View>
      <View style={styles.recordFooter}>
        <Text style={styles.weightText}>{card.weight}g | {card.pieces} pcs | {card.type}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#b8860b']} />
        }
      >
        <Header subtitle="Records & Reports" />

        {renderDashboard()}

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search records..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'customers' && styles.activeTab]}
            onPress={() => setActiveTab('customers')}
          >
            <Ionicons 
              name="people" 
              size={18} 
              color={activeTab === 'customers' ? '#fff' : '#0066b3'} 
            />
            <Text style={[styles.tabText, activeTab === 'customers' && styles.activeTabText]}>
              Customers ({filteredCustomers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
            onPress={() => setActiveTab('cards')}
          >
            <Ionicons 
              name="card" 
              size={18} 
              color={activeTab === 'cards' ? '#fff' : '#b8860b'} 
            />
            <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>
              Cards ({filteredCards.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportContainer}>
          <TouchableOpacity 
            style={[styles.exportBtn, exporting && styles.exportBtnDisabled]} 
            onPress={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="document" size={16} color="#fff" />
                <Text style={styles.exportBtnText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.exportBtn, styles.exportBtnCSV, exporting && styles.exportBtnDisabled]} 
            onPress={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="grid" size={16} color="#fff" />
                <Text style={styles.exportBtnText}>CSV</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.recordsContainer}>
          {activeTab === 'customers' ? (
            filteredCustomers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color="#ddd" />
                <Text style={styles.emptyText}>No customer records found</Text>
              </View>
            ) : (
              filteredCustomers.map(renderCustomerRow)
            )
          ) : (
            filteredCards.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={60} color="#ddd" />
                <Text style={styles.emptyText}>No card records found</Text>
              </View>
            ) : (
              filteredCards.map(renderCardRow)
            )
          )}
        </View>

        {(customers.length > 0 || cards.length > 0) && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearData}>
            <Ionicons name="trash" size={18} color="#fff" />
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
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  dashboard: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#28a745',
    marginTop: 4,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#b8860b',
    borderColor: '#b8860b',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  exportContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 12,
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  exportBtnCSV: {
    backgroundColor: '#28a745',
  },
  exportBtnDisabled: {
    backgroundColor: '#999',
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recordsContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b8860b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  recordDetails: {
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordText: {
    fontSize: 13,
    color: '#555',
  },
  purityText: {
    color: '#b8860b',
    fontWeight: '600',
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#b8860b',
  },
  weightText: {
    fontSize: 13,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 15,
    color: '#888',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    marginHorizontal: 15,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  clearBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
