import { describe, expect, it } from 'vitest';
import { cartReducer, type CartState } from './cartReducer';
import type { CartItem } from '../types';

describe('cartReducer - Pruebas Unitarias', () => {
  const initialCartState: CartState = { items: [] };

  const sampleItem1: CartItem = {
    productId: 'p1',
    name: 'Auriculares inalámbricos',
    price: 100,
    quantity: 1,
    imageUrl: 'https://example.com/p1.jpg',
  };

  const sampleItem2: CartItem = {
    productId: 'p2',
    name: 'Smartwatch Pro',
    price: 200,
    quantity: 2,
    imageUrl: 'https://example.com/p2.jpg',
  };

  it('debe agregar un item al carrito (ADD_ITEM)', () => {
    const nextState = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: sampleItem1,
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toEqual(sampleItem1);
  });

  it('debe incrementar la cantidad si el producto ya existe en el carrito (ADD_ITEM)', () => {
    const stateWithOne = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: sampleItem1,
    });

    const stateWithTwo = cartReducer(stateWithOne, {
      type: 'ADD_ITEM',
      payload: { ...sampleItem1, quantity: 2 },
    });

    expect(stateWithTwo.items).toHaveLength(1);
    expect(stateWithTwo.items[0].quantity).toBe(3);
  });

  it('debe actualizar la cantidad de un producto (UPDATE_QUANTITY)', () => {
    const stateWithItems = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: sampleItem1,
    });

    const updatedState = cartReducer(stateWithItems, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'p1', quantity: 5 },
    });

    expect(updatedState.items[0].quantity).toBe(5);
  });

  it('debe eliminar un producto cuando la cantidad es 0 o menor (UPDATE_QUANTITY)', () => {
    const stateWithItems = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: sampleItem1,
    });

    const updatedState = cartReducer(stateWithItems, {
      type: 'UPDATE_QUANTITY',
      payload: { productId: 'p1', quantity: 0 },
    });

    expect(updatedState.items).toHaveLength(0);
  });

  it('debe remover un producto por su id (REMOVE_ITEM)', () => {
    const stateWithTwoItems = {
      items: [sampleItem1, sampleItem2],
    };

    const stateAfterRemoval = cartReducer(stateWithTwoItems, {
      type: 'REMOVE_ITEM',
      payload: 'p1',
    });

    expect(stateAfterRemoval.items).toHaveLength(1);
    expect(stateAfterRemoval.items[0].productId).toBe('p2');
  });

  it('debe vaciar todos los productos del carrito (CLEAR_CART)', () => {
    const stateWithTwoItems = {
      items: [sampleItem1, sampleItem2],
    };

    const clearedState = cartReducer(stateWithTwoItems, {
      type: 'CLEAR_CART',
    });

    expect(clearedState.items).toHaveLength(0);
  });
});
