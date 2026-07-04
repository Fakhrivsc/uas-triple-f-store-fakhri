import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartAPI.get();
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    await cartAPI.add(data);
    const res = await cartAPI.get();
    toast.success('Produk ditambahkan ke keranjang');
    return res.data.data.cart;
  } catch (err) {
    const msg = err.response?.data?.message || 'Gagal menambahkan ke keranjang';
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    await cartAPI.update(itemId, { quantity });
    const res = await cartAPI.get();
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    await cartAPI.remove(itemId);
    const res = await cartAPI.get();
    toast.success('Item dihapus dari keranjang');
    return res.data.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartAPI.clear();
    return { items: [], total: 0 };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    guestCart: JSON.parse(localStorage.getItem('guestCart') || '[]')
  },
  reducers: {
    addToGuestCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.guestCart.find(i => i.product_id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.guestCart.push({ product_id: product.id, product, quantity });
      }
      localStorage.setItem('guestCart', JSON.stringify(state.guestCart));
      toast.success('Produk ditambahkan ke keranjang');
    },
    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.guestCart.find(i => i.product_id === productId);
      if (item) {
        if (quantity <= 0) {
          state.guestCart = state.guestCart.filter(i => i.product_id !== productId);
        } else {
          item.quantity = quantity;
        }
      }
      localStorage.setItem('guestCart', JSON.stringify(state.guestCart));
    },
    removeFromGuestCart: (state, action) => {
      state.guestCart = state.guestCart.filter(i => i.product_id !== action.payload);
      localStorage.setItem('guestCart', JSON.stringify(state.guestCart));
    },
    clearGuestCart: (state) => {
      state.guestCart = [];
      localStorage.removeItem('guestCart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      });
  }
});

export const { addToGuestCart, updateGuestCartItem, removeFromGuestCart, clearGuestCart } = cartSlice.actions;
export default cartSlice.reducer;
