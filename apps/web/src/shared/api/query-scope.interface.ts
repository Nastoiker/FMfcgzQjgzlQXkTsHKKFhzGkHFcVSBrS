export interface IQueryScope {
  readonly login: string;
  readonly role: 'admin' | 'client';
  readonly company_id: number | null;
}
