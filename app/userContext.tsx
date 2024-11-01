import { createContext, useContext, useReducer } from 'react';
import { ReactNode } from 'react';

const initialState = {
  user: null,
  token: null, 
  timestamp: null,
};

const UserContext = createContext<{
  state: typeof initialState;
  dispatch: React.Dispatch<{ type: string; payload?: any }>;
}>({
  state: initialState,
  dispatch: () => null,
});

const userReducer = (state: any, action: { type: any; payload?: any; }) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        timestamp: action.payload.timestamp, 
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        timestamp: null, 
      };
    default:
      return state;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
