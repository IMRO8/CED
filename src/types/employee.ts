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
  name: string;
  phoneNumber: string;
  profilePicture: string;
};

export type ACCRequest = {
  employeeName: string;
  reason: string;
  resource: string;
};
