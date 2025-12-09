import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOMERS_KEY = 'hglcustomers';
const CARDS_KEY = 'hglcards';
const JOB_COUNTER_KEY = 'hgljob';

export const getJobCounter = async () => {
  try {
    const value = await AsyncStorage.getItem(JOB_COUNTER_KEY);
    return value ? parseInt(value) + 1 : 1;
  } catch (e) {
    return 1;
  }
};

export const saveJobCounter = async (counter) => {
  try {
    await AsyncStorage.setItem(JOB_COUNTER_KEY, counter.toString());
  } catch (e) {
    console.error('Error saving job counter:', e);
  }
};

export const getCustomers = async () => {
  try {
    const value = await AsyncStorage.getItem(CUSTOMERS_KEY);
    return value ? JSON.parse(value) : [];
  } catch (e) {
    return [];
  }
};

export const saveCustomer = async (customer) => {
  try {
    const customers = await getCustomers();
    customers.push(customer);
    await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    return true;
  } catch (e) {
    console.error('Error saving customer:', e);
    return false;
  }
};

export const getCards = async () => {
  try {
    const value = await AsyncStorage.getItem(CARDS_KEY);
    return value ? JSON.parse(value) : [];
  } catch (e) {
    return [];
  }
};

export const saveCard = async (card) => {
  try {
    const cards = await getCards();
    cards.push(card);
    await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(cards));
    return true;
  } catch (e) {
    console.error('Error saving card:', e);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([CUSTOMERS_KEY, CARDS_KEY, JOB_COUNTER_KEY]);
    return true;
  } catch (e) {
    console.error('Error clearing data:', e);
    return false;
  }
};
