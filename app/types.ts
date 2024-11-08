export type User = {
    id: string;
    name: string;
    email: string;
  };
  
  export type AuthParams = {
    username: string;
    password: string;
  };

export type RootStackParamList = {
    Login: undefined; 
    Register: undefined; 
  };
  