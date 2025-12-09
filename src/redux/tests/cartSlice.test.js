import cartReducer, {
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart
} from '../cartSlice';

describe('cartSlice', () => {
    const initialState = [];

    test('should handle initial state', () => {
        expect(cartReducer(undefined, { type: 'unknown' })).toEqual([]);
    });

    test('should handle addToCart', () => {
        const newItem = { _id: '1', title: 'Test Product', price: 100, quantity: 1 };
        const actual = cartReducer(initialState, addToCart(newItem));
        expect(actual).toHaveLength(1);
        expect(actual[0]).toEqual(newItem);
    });

    test('should handle addToCart (existing item increments quantity)', () => {
        const existingState = [{ _id: '1', title: 'Test Product', price: 100, quantity: 1 }];
        const newItem = { _id: '1', title: 'Test Product', price: 100, quantity: 2 };
        const actual = cartReducer(existingState, addToCart(newItem));
        expect(actual).toHaveLength(1);
        expect(actual[0].quantity).toEqual(3); // 1 + 2
    });

    test('should handle removeFromCart', () => {
        const existingState = [{ _id: '1' }, { _id: '2' }];
        const actual = cartReducer(existingState, removeFromCart('1'));
        expect(actual).toHaveLength(1);
        expect(actual[0]._id).toEqual('2');
    });

    test('should handle incrementQuantity', () => {
        const existingState = [{ _id: '1', quantity: 1 }];
        const actual = cartReducer(existingState, incrementQuantity('1'));
        expect(actual[0].quantity).toEqual(2);
    });

    test('should handle decrementQuantity', () => {
        const existingState = [{ _id: '1', quantity: 2 }];
        const actual = cartReducer(existingState, decrementQuantity('1'));
        expect(actual[0].quantity).toEqual(1);
    });

    test('should handle clearCart', () => {
        const existingState = [{ _id: '1' }];
        const actual = cartReducer(existingState, clearCart());
        expect(actual).toEqual([]);
    });
});
