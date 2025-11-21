import { create } from 'zustand';

// Kiểu dữ liệu cho 1 món trong giỏ
export interface CartItem {
  productVariantId: number; // ID biến thể (Size M, L)
  productId: number; // ID sản phẩm gốc
  name: string; // Tên hiển thị (VD: Bạc Xỉu - Size M)
  price: number; // Giá bán
  quantity: number; // Số lượng
  note?: string; // Ghi chú (Ít đá...)
}

interface CartState {
  items: CartItem[];

  // Actions
  addToCart: (product: any) => void; // Tạm dùng any cho product input
  increaseQuantity: (productVariantId: number) => void;
  decreaseQuantity: (productVariantId: number) => void;
  removeFromCart: (productVariantId: number) => void;
  clearCart: () => void;

  // Computed (Tính toán)
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (product) => {
    const { items } = get();
    // Logic đơn giản: Mặc định lấy Variant đầu tiên (Size nhỏ nhất)
    // Thực tế: Cần mở Modal chọn Size trước (Sẽ làm ở Phase sau)
    const defaultVariant = product.variants[0];

    if (!defaultVariant) {
      alert('Sản phẩm này chưa có giá (Variant)!');
      return;
    }

    const existingItem = items.find(
      (i) => i.productVariantId === defaultVariant.id
    );

    if (existingItem) {
      // Nếu món đã có -> Tăng số lượng
      set({
        items: items.map((i) =>
          i.productVariantId === defaultVariant.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      // Nếu chưa có -> Thêm mới
      const newItem: CartItem = {
        productVariantId: defaultVariant.id,
        productId: product.id,
        name: `${product.name} (${defaultVariant.name})`,
        price: product.basePrice + defaultVariant.priceAdjustment,
        quantity: 1,
        note: '',
      };
      set({ items: [...items, newItem] });
    }
  },

  increaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productVariantId === id ? { ...i, quantity: i.quantity + 1 } : i
      ),
    })),

  decreaseQuantity: (id) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (i.productVariantId === id) {
          return { ...i, quantity: Math.max(1, i.quantity - 1) }; // Không giảm dưới 1
        }
        return i;
      }),
    })),

  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.productVariantId !== id),
    })),

  clearCart: () => set({ items: [] }),

  totalAmount: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));
