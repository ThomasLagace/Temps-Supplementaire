import { createContext, useReducer } from "react";

export const OvertimeContext = createContext();

export const overtimesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_OVERTIMES':
      return { overtimes: action.payload };
    case 'ADD_OVERTIME':
      return {overtimes: [action.payload, ...state.overtimes]};
    default:
      return state;
  }
}

export const OvertimeContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(overtimesReducer, {overtimes: null});

  return (
    <OvertimeContext.Provider value={{...state, dispatch}}>
      {children}
    </OvertimeContext.Provider>
  );
}
