export interface Transaction {
  id: string;
  code: string;
  name: string;
  departureCountry: string;
  arrivalCountry: string;
  kilos: number;
  cubicMeters?: number | null;
  packageDescription: string;
  email: string;
  phone: string;
  date: string;
  year: number;
  amount: string;
  status: 'annule' | 'reserve' | 'achete';
  depositedAtAgency: boolean;
  arrivedInDestination: boolean;
  pickedUpByClient: boolean;
}
