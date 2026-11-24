export class BranchNotFound extends Error {
  constructor() {
    super('Филиал не найден');
  }
}

export class InvalidPeriod extends Error {
  constructor() {
    super('Выберите период до 366 дней');
  }
}

export class LoginLimited extends Error {
  constructor(readonly retryAfter: number) {
    super('Слишком много попыток входа');
  }
}
