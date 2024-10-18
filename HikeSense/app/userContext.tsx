import { createContext, useContext, useReducer } from 'react';
import { ReactNode } from 'react';

// Define the initial state
const initialState = {
  user: null,
  token: null, // Add token to state
  timestamp: null, // Add timestamp to state
};

// Create the UserContext
const UserContext = createContext<{
  state: typeof initialState;
  dispatch: React.Dispatch<{ type: string; payload?: any }>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Define the reducer function
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
        timestamp: action.payload.timestamp, // Save timestamp when token is set
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        timestamp: null, // Clear timestamp on logout
      };
    default:
      return state;
  }
};

// Create the UserProvider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUserContext = () => useContext(UserContext);
