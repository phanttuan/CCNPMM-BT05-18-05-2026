import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../services/axiosInstance";

export const fetchHomeData = createAsyncThunk(
  "product/fetchHome",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/home");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Loi tai du lieu");
    }
  }
);

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { append = false, ...queryParams } = params;
      const res = await axiosInstance.get("/products", { params: queryParams });
      return {
        ...res.data.data,
        append,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Loi tai san pham");
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  "product/fetchDetail",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/products/${slug}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Khong tim thay san pham");
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/categories");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Loi tai danh muc");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    homeData: null,
    homeLoading: false,
    homeError: null,

    products: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    hasMoreProducts: true,
    listLoading: false,
    listError: null,

    currentProduct: null,
    similarProducts: [],
    detailLoading: false,
    detailError: null,

    categories: [],
  },
  reducers: {
    clearProductErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.homeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.homeLoading = true;
        state.homeError = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.homeLoading = false;
        state.homeData = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.homeLoading = false;
        state.homeError = action.payload;
      });

    builder
      .addCase(fetchProducts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        state.products = action.payload.append
          ? [...state.products, ...action.payload.products]
          : action.payload.products;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.hasMoreProducts = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      });

    builder
      .addCase(fetchProductDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = action.payload.product;
        state.similarProducts = action.payload.similar;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });
  },
});

export const { clearProductErrors } = productSlice.actions;
export default productSlice.reducer;
