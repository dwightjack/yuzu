export const initialState = {
  items: [],
};

const ADD_ITEM = 'ADD_TODO';

export const actions = {
  addItem: () => ({
    type: ADD_ITEM,
  }),
};

export const reducer = (state = initialState, { type }) => {
  switch (type) {
    case ADD_ITEM:
      return {
        ...state,
        items: [...state.items, state.items.length],
      };
    default:
      return state;
  }
};
