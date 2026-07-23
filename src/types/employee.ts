export type RandomUser = {
  name: {
    first: string;
    last: string;
  };
  phone: string;
  picture: {
    medium: string;
    large: string;
    thumbnail: string;
  };
};

export type RandomUserResponse = {
  results: RandomUser[];
};

export type Employee = {
  id: string;           
  name: string;
  phoneNumber: string;
  profilePicture?: string;  
};

export type ACCRequest = {
  id: number;
  employeeName: string;
  reason: string;
  resource: string;
  createdAt: string;
};