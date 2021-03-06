import React, { useReducer, createContext } from "react";
import ItemReducer from "./item.reducer";
import InitialState from "./item.initial";

export const ItemContext = createContext({ ...InitialState });

const ItemProvider = ({ children }) => {
  const [items, dispatch] = useReducer(ItemReducer, InitialState);

  return (
    <ItemContext.Provider
      value={{
        apiObject: items,
        dispatch,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export default ItemProvider;
