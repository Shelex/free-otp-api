export interface Country {
  url: string;
  country: string;
  source: string;
  count: number;
}

export interface Source {
  name: string;
  url: string;
  count: number;
}

export interface CountryRecord {
  name: string;
  sources: Source[];
}

export interface PhonesResponse {
  phones: PhoneRecord[];
}

export interface PhoneRecord {
  url: string;
  value: string;
  source: string;
}

export interface PhoneRecordCard {
  value: string;
  sources: {
    name: string;
    url: string;
  }[];
}

export interface Message {
  ago: number;
  agoText: string;
  message: string;
  otp: string;
  url: string;
}

export interface PhoneMessagesResponse {
  results: Message[];
}
