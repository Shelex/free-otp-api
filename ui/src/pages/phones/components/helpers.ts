import { PhoneRecord, PhoneRecordCard } from '../../../types';

export const transformPhoneRecords = (phones: PhoneRecord[]): PhoneRecordCard[] => {
  const sourceMap = phones.reduce((records, item) => {
    if (!records[item.value]) {
      records[item.value] = [];
    }
    records[item.value].push({ name: item.source, url: item.url });
    return records;
  }, {} as Record<string, { name: string; url: string }[]>);

  return Object.entries(sourceMap).map(([value, sources]) => ({ value, sources }));
};
